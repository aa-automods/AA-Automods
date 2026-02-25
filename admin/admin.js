import { db, auth } from "/firebase-client.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const loginCard = document.getElementById("loginCard");
const editorCard = document.getElementById("editorCard");

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const saveBtn = document.getElementById("saveBtn");
const saveMsg = document.getElementById("saveMsg");

const ref = doc(db, "siteContent", "pricing");

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] ??= {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

async function loadIntoInputs() {
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();

  document.querySelectorAll("[data-bind]").forEach((input) => {
    const key = input.getAttribute("data-bind");
    const val = getByPath(data, key);
    input.value = typeof val === "string" ? val : "";
  });
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `admin-toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function saveFromInputs() {
  saveMsg.textContent = "Saving...";
  saveMsg.className = "admin-status";
  const out = {};

  document.querySelectorAll("[data-bind]").forEach((input) => {
    const key = input.getAttribute("data-bind");
    setByPath(out, key, input.value.trim());
  });

  try {
    await setDoc(ref, out, { merge: true });
    saveMsg.textContent = "Saved";
    saveMsg.className = "admin-status success";
    showToast("Pricing updated successfully", "success");
  } catch (err) {
    saveMsg.textContent = "Error: " + err.message;
    saveMsg.className = "admin-status error";
    showToast("Failed to save: " + err.message, "error");
  }
}

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

saveBtn.addEventListener("click", saveFromInputs);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginCard.style.display = "none";
    editorCard.style.display = "block";
    userEmail.textContent = user.email || "";
    await loadIntoInputs();
  } else {
    loginCard.style.display = "block";
    editorCard.style.display = "none";
  }
});
