#!/usr/bin/env node
/**
 * One-time migration: Upload photos/ to Firebase Storage and create Firestore gallery docs.
 *
 * Prerequisites:
 *   1. npm install firebase-admin
 *   2. Firebase Console → Project settings → Service accounts → Generate new private key
 *   3. Save as firebase-service-account.json in project root (add to .gitignore!)
 *
 * Run: node scripts/upload-gallery-to-firebase.js
 */

const fs = require("fs");
const path = require("path");

// Load service account
const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Missing firebase-service-account.json. See FIREBASE-GALLERY-SETUP.md");
  process.exit(1);
}

const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });

const bucket = admin.storage().bucket("aa-automods.firebasestorage.app");
const db = admin.firestore();

const PHOTOS_DIR = path.join(__dirname, "..", "photos");

// Map filename prefix → category & tag
const CATEGORY_MAP = {
  ambient: { category: "ambient-lighting", tag: "Ambient Lighting" },
  starlight: { category: "star-headliner", tag: "Star Headliner" },
  underglow: { category: "underglow", tag: "Underglow" },
  el: { category: "service-lighting", tag: "Service Lighting" },
  radio: { category: "other", tag: "Radio Installation" },
  steering: { category: "other", tag: "Carbon Steering Kit" },
  hero: { category: "other", tag: "Hero" },
};

function getCategory(filename) {
  const base = path.basename(filename, path.extname(filename)).toLowerCase();
  for (const [prefix, info] of Object.entries(CATEGORY_MAP)) {
    if (base.startsWith(prefix)) return info;
  }
  return { category: "other", tag: "Other" };
}

async function uploadFile(localPath) {
  const filename = path.basename(localPath);
  const storagePath = `gallery/${Date.now()}-${filename}`;
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { contentType: getMimeType(filename) },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/aa-automods.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
  return { storagePath, url };
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif", ".webp": "image/webp" };
  return mime[ext] || "image/jpeg";
}

async function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error("photos/ directory not found");
    process.exit(1);
  }

  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => /\.(avif|jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images in photos/`);

  const galleryRef = db.collection("gallery");
  let order = 0;

  for (const file of files) {
    const localPath = path.join(PHOTOS_DIR, file);
    const { category, tag } = getCategory(file);
    const alt = path.basename(file, path.extname(file)).replace(/-/g, " ");
    console.log(`Uploading ${file} → ${category} / ${tag}`);

    try {
      const { storagePath, url } = await uploadFile(localPath);
      await galleryRef.add({
        url,
        storagePath,
        category,
        tag,
        alt,
        order: order++,
      });
      console.log(`  → OK`);
    } catch (err) {
      console.error(`  → FAIL: ${err.message}`);
    }
  }

  console.log("\nDone. Check Firebase Console → Storage and Firestore → gallery.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
