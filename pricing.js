import { db } from "/firebase-client.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const PRICING_CACHE_KEY = "aa_pricing_cache_v3";
const CACHE_TTL_MS = 15 * 60 * 1000;

// Deployed prices always win over Firestore for these fields.
// This keeps aa-automods.ca in sync with git pushes even when admin DB is stale.
const SITE_PRICE_OVERRIDES = {
  prices: {
    starHeadliner: {
      stars600: "$920",
      stars800: "$1150",
      stars1000: "$1400",
      stars1200: "$1800",
      shootingStars: {
        five: "+$180",
        eight: "+$250",
      },
    },
    underglow: {
      pods: {
        type1: "$50",
        type3: "$75",
      },
      strips: {
        premiumChasing6: "$650",
      },
    },
  },
};

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function deepMerge(base, over) {
  if (!over || typeof over !== "object" || Array.isArray(over)) return over;
  const out = base && typeof base === "object" && !Array.isArray(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(over)) {
    out[key] = deepMerge(out[key], value);
  }
  return out;
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

function withOverrides(data) {
  return deepMerge(data || {}, SITE_PRICE_OVERRIDES);
}

async function loadPricing() {
  // Apply overrides immediately so HTML never sticks on stale values.
  applyPricingToDOM(withOverrides({}));

  const cached = getCachedPricing();
  if (cached) {
    applyPricingToDOM(withOverrides(cached));
    return;
  }
  try {
    const snap = await getDoc(doc(db, "siteContent", "pricing"));
    if (!snap.exists()) return;
    const data = withOverrides(snap.data());
    setCachedPricing(data);
    applyPricingToDOM(data);
  } catch (err) {
    console.error("Failed to load pricing:", err);
  }
}

loadPricing();
