# Firebase Gallery Setup Guide

This guide walks you through moving your website images to Firebase Storage and enabling the admin panel to add, edit, and manage gallery images.

---

## Part 1: Firebase Console Setup

### Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/) and select project **aa-automods**
2. In the left sidebar, click **Build** → **Storage**
3. Click **Get started**
4. Choose **Start in production mode** (we'll add rules next)
5. Select your storage location (e.g. `us-central1` or closest to your users) → **Done**

### Step 2: Set Storage Security Rules

1. In Storage, go to the **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read (public website images)
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /hero/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 3: Firestore Index (if needed)

The gallery queries `gallery` by `order` (asc). Firestore usually auto-creates single-field indexes. If you get an error like "The query requires an index", click the link in the error message to create it, or add this in **Firestore → Indexes**:

- Collection: `gallery`
- Field: `order` (Ascending)

### Step 4: Verify Pay-as-You-Go / Blaze Plan

1. Click the gear icon → **Usage and billing**
2. Confirm you're on the **Blaze (pay-as-you-go)** plan
3. Storage free tier: 5 GB stored, 1 GB/day downloaded — plenty for a gallery

---

## Part 2: Upload Existing Images (One-Time Migration)

You have two options:

### Option A: Run the Migration Script (Recommended)

1. Install dependencies:
   ```bash
   cd /Users/ramisaziz/AA-Automods
   npm install firebase-admin
   ```

2. Get a Firebase Service Account key:
   - Firebase Console → Project settings (gear) → **Service accounts**
   - Click **Generate new private key** → Download JSON
   - Save as `firebase-service-account.json` in project root (add to `.gitignore`)

3. Run the migration:
   ```bash
   node scripts/upload-gallery-to-firebase.js
   ```

   This uploads all images from `photos/` to Storage and creates Firestore `gallery` documents.

### Option B: Manual Upload via Admin Panel

After deploying, log into the admin panel and add each image manually via **Add Image**. Use this only if you have a few images or the script fails.

---

## Part 3: Firestore Structure

The `gallery` collection stores metadata. Each document:

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `url`     | string | Firebase Storage download URL        |
| `category`| string | `star-headliner`, `ambient-lighting`, `underglow`, `service-lighting`, `other` |
| `alt`     | string | Alt text for accessibility           |
| `tag`     | string | Display label (e.g. "Star Headliner")|
| `order`   | number | Sort order (lower = first)           |
| `storagePath` | string | Storage path for deletion         |

---

## Part 4: Admin Panel Usage

1. Go to `/admin` and sign in
2. Click **Gallery** in the sidebar
3. **Add image**: Choose file, category, alt text, tag → Upload
4. **Edit**: Change category, alt, or tag
5. **Delete**: Removes from Storage and Firestore

---

## Time Estimate

| Task                              | Time        |
|-----------------------------------|-------------|
| Firebase Console setup            | 10–15 min   |
| Run migration script (if Option A)| 5–10 min    |
| Deploy & smoke test               | 5 min       |
| **Total (your time)**             | **~30 min** |

Implementation (code) is already done in this repo.
