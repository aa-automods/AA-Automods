import { db } from "/firebase-client.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PRICING_CACHE_KEY = "aa_pricing_cache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min — reduces Firestore reads on refresh/revisit

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function applyPricingToDOM(data) {
  document.querySelectorAll("[data-price]").forEach((el) => {
    const key = el.getAttribute("data-price");
    const val = getByPath(data, key);
    if (typeof val === "string") el.textContent = val;
  });
}

function getCachedPricing() {
  try {
    const raw = sessionStorage.getItem(PRICING_CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS || !data) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedPricing(data) {
  try {
    sessionStorage.setItem(
      PRICING_CACHE_KEY,
      JSON.stringify({ at: Date.now(), data })
    );
  } catch {
    // ignore
  }
}

async function loadPricing() {
  const cached = getCachedPricing();
  if (cached) {
    applyPricingToDOM(cached);
    return;
  }
  try {
    const snap = await getDoc(doc(db, "siteContent", "pricing"));
    if (!snap.exists()) return;
    const data = snap.data();
    setCachedPricing(data);
    applyPricingToDOM(data);
  } catch (err) {
    console.error("Failed to load pricing:", err);
  }
}

loadPricing();
