import { db } from "/firebase-client.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

async function loadPricing() {
  try {
    const snap = await getDoc(doc(db, "siteContent", "pricing"));
    if (!snap.exists()) return;

    const data = snap.data();

    document.querySelectorAll("[data-price]").forEach((el) => {
      const key = el.getAttribute("data-price");
      const val = getByPath(data, key);
      if (typeof val === "string") el.textContent = val;
    });
  } catch (err) {
    console.error("Failed to load pricing:", err);
  }
}

loadPricing();
