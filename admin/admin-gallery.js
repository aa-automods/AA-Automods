import { db, auth, storage } from "/firebase-client.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const loginCard = document.getElementById("loginCard");
const galleryCard = document.getElementById("galleryCard");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const galleryFile = document.getElementById("galleryFile");
const galleryCategory = document.getElementById("galleryCategory");
const galleryTag = document.getElementById("galleryTag");
const galleryAlt = document.getElementById("galleryAlt");
const uploadBtn = document.getElementById("uploadBtn");
const uploadMsg = document.getElementById("uploadMsg");
const galleryGrid = document.getElementById("galleryGrid");
const galleryEmpty = document.getElementById("galleryEmpty");
const editModal = document.getElementById("editModal");
const editCategory = document.getElementById("editCategory");
const editTag = document.getElementById("editTag");
const editAlt = document.getElementById("editAlt");
const editCancel = document.getElementById("editCancel");
const editSave = document.getElementById("editSave");

const GALLERY_REF = collection(db, "gallery");
const CATEGORIES = [
  { value: "star-headliner", label: "Star Headliner" },
  { value: "ambient-lighting", label: "Ambient Lighting" },
  { value: "underglow", label: "Underglow" },
  { value: "service-lighting", label: "Service Lighting" },
  { value: "other", label: "Other Services" },
];

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `admin-toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Populate edit modal category select
CATEGORIES.forEach(({ value, label }) => {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  editCategory.appendChild(opt);
});

galleryFile.addEventListener("change", () => {
  uploadBtn.disabled = !galleryFile.files?.length;
  const textEl = document.querySelector(".admin-file-picker-text");
  if (textEl) textEl.textContent = galleryFile.files?.length ? galleryFile.files[0].name : "Choose image file";
});

loginBtn.addEventListener("click", async () => {
  loginMsg.textContent = "";
  loginMsg.className = "admin-status";
  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
  } catch (e) {
    loginMsg.textContent = "Login failed: " + e.message;
    loginMsg.className = "admin-status error";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

async function loadGallery() {
  const q = query(GALLERY_REF, orderBy("order", "asc"));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  galleryGrid.innerHTML = "";
  galleryEmpty.style.display = items.length ? "none" : "block";

  for (const item of items) {
    const card = document.createElement("div");
    card.className = "admin-gallery-card";
    card.innerHTML = `
      <div class="admin-gallery-card-image">
        <img src="${item.url}" alt="${(item.alt || "").replace(/"/g, "&quot;")}" loading="lazy" />
      </div>
      <div class="admin-gallery-card-info">
        <span class="admin-gallery-tag">${item.tag || item.category || "—"}</span>
        <div class="admin-gallery-actions">
          <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-action="edit" data-id="${item.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm admin-btn-danger" data-action="delete" data-id="${item.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    galleryGrid.appendChild(card);
  }

  galleryGrid.querySelectorAll("[data-action=edit]").forEach((btn) => {
    btn.addEventListener("click", () => openEdit(items.find((i) => i.id === btn.dataset.id)));
  });
  galleryGrid.querySelectorAll("[data-action=delete]").forEach((btn) => {
    btn.addEventListener("click", () => deleteImage(btn.dataset.id, items.find((i) => i.id === btn.dataset.id)));
  });
}

let editingId = null;

function openEdit(item) {
  editingId = item.id;
  editCategory.value = item.category || "other";
  editTag.value = item.tag || "";
  editAlt.value = item.alt || "";
  editModal.style.display = "flex";
}

function closeEdit() {
  editingId = null;
  editModal.style.display = "none";
}

editCancel.addEventListener("click", closeEdit);
editModal.querySelector(".admin-modal-backdrop")?.addEventListener("click", closeEdit);

editSave.addEventListener("click", async () => {
  if (!editingId) return;
  editSave.disabled = true;
  try {
    await updateDoc(doc(db, "gallery", editingId), {
      category: editCategory.value,
      tag: editTag.value.trim(),
      alt: editAlt.value.trim(),
    });
    showToast("Image updated");
    closeEdit();
    loadGallery();
  } catch (e) {
    showToast("Failed: " + e.message, "error");
  }
  editSave.disabled = false;
});

async function deleteImage(id, item) {
  if (!confirm("Delete this image? This cannot be undone.")) return;
  try {
    if (item?.storagePath) {
      try {
        await deleteObject(ref(storage, item.storagePath));
      } catch (e) {
        console.warn("Storage delete failed:", e);
      }
    }
    await deleteDoc(doc(db, "gallery", id));
    showToast("Image deleted");
    loadGallery();
  } catch (e) {
    showToast("Delete failed: " + e.message, "error");
  }
}

uploadBtn.addEventListener("click", async () => {
  const file = galleryFile.files?.[0];
  if (!file) return;

  const category = galleryCategory.value;
  const tag = galleryTag.value.trim() || galleryCategory.options[galleryCategory.selectedIndex].text;
  const alt = galleryAlt.value.trim() || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

  uploadBtn.disabled = true;
  uploadMsg.textContent = "Uploading...";
  uploadMsg.className = "admin-status";

  try {
    const storagePath = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const snap = await getDocs(GALLERY_REF);
    const maxOrder = snap.docs.reduce((m, d) => Math.max(m, d.data().order ?? -1), -1);

    await addDoc(GALLERY_REF, {
      url,
      storagePath,
      category,
      tag,
      alt,
      order: maxOrder + 1,
    });

    showToast("Image added");
    galleryFile.value = "";
    galleryTag.value = "";
    galleryAlt.value = "";
    uploadBtn.disabled = true;
    uploadMsg.textContent = "";
    loadGallery();
  } catch (e) {
    uploadMsg.textContent = "Error: " + e.message;
    uploadMsg.className = "admin-status error";
    showToast("Upload failed: " + e.message, "error");
  }
  uploadBtn.disabled = false;
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginCard.style.display = "none";
    galleryCard.style.display = "block";
    userEmail.textContent = user.email || "";
    await loadGallery();
  } else {
    loginCard.style.display = "block";
    galleryCard.style.display = "none";
  }
});
