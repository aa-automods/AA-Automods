/**
 * Gallery loader: fetches images from Firestore and renders the gallery with filters, pagination, lightbox.
 */
import { db } from "/firebase-client.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const GALLERY_REF = collection(db, "gallery");
const ITEMS_PER_PAGE = 16;
const GALLERY_CACHE_KEY = "aa_gallery_cache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min — reduces Firestore reads on refresh/revisit

let allItems = [];
let currentFilter = "all";
let currentPage = 1;

function getCachedGallery() {
  try {
    const raw = sessionStorage.getItem(GALLERY_CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS || !Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedGallery(items) {
  try {
    sessionStorage.setItem(
      GALLERY_CACHE_KEY,
      JSON.stringify({ at: Date.now(), data: items })
    );
  } catch {
    // ignore quota or parse errors
  }
}

export async function loadGallery() {
  const galleryGrid = document.querySelector(".gallery-grid");
  const paginationWrapper = document.querySelector(".pagination-wrapper");
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '<div class="gallery-loading">Loading gallery…</div>';

  const cached = getCachedGallery();
  if (cached != null) {
    allItems = cached;
    currentFilter = "all";
    currentPage = 1;
    if (allItems.length === 0) {
      galleryGrid.innerHTML = '<p class="gallery-empty">No images in the gallery yet.</p>';
      if (paginationWrapper) paginationWrapper.style.display = "none";
      return;
    }
    render();
    setupFilters();
    setupPagination();
    setupLightbox();
    return;
  }

  try {
    const q = query(GALLERY_REF, orderBy("order", "asc"));
    const snap = await getDocs(q);
    allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCachedGallery(allItems);
  } catch (e) {
    console.error("Gallery load failed:", e);
    galleryGrid.innerHTML =
      '<p class="gallery-empty">Unable to load gallery. Please try again later.</p>';
    return;
  }

  if (allItems.length === 0) {
    galleryGrid.innerHTML = '<p class="gallery-empty">No images in the gallery yet.</p>';
    if (paginationWrapper) paginationWrapper.style.display = "none";
    return;
  }

  currentFilter = "all";
  currentPage = 1;
  render();
  setupFilters();
  setupPagination();
  setupLightbox();
}

function getFilteredItems() {
  return currentFilter === "all"
    ? allItems
    : allItems.filter((i) => i.category === currentFilter);
}

function render() {
  const galleryGrid = document.querySelector(".gallery-grid");
  if (!galleryGrid) return;

  const filtered = getFilteredItems();
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  galleryGrid.innerHTML = pageItems
    .map(
      (item) => `
    <div class="gallery-item visible" data-category="${(item.category || "other").replace(/"/g, "&quot;")}">
      <div class="gallery-image">
        <img src="${item.url}" alt="${(item.alt || "").replace(/"/g, "&quot;")}" loading="lazy" />
        <div class="gallery-overlay">
          <div class="gallery-info">
            <h3 class="gallery-title"></h3>
            <p class="gallery-tag">${(item.tag || item.category || "").replace(/</g, "&lt;")}</p>
          </div>
          <button class="gallery-expand" aria-label="Expand image">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  updatePaginationUI(filtered.length, totalPages);
  setupLightbox();
}

function updatePaginationUI(filteredCount, totalPages) {
  const paginationWrapper = document.querySelector(".pagination-wrapper");
  const paginationPages = document.querySelector(".pagination-pages");
  const prevBtn = document.querySelector(".pagination-prev");
  const nextBtn = document.querySelector(".pagination-next");

  if (!paginationWrapper) return;

  if (totalPages <= 1) {
    paginationWrapper.style.display = "none";
    return;
  }

  paginationWrapper.style.display = "block";
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.classList.toggle("disabled", currentPage === 1);
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.classList.toggle("disabled", currentPage === totalPages);
  }

  if (paginationPages) {
    paginationPages.innerHTML = "";
    const maxVisible = 7;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      const b = document.createElement("button");
      b.className = "pagination-page";
      b.textContent = "1";
      b.onclick = () => { currentPage = 1; render(); };
      paginationPages.appendChild(b);
      if (start > 2) {
        const e = document.createElement("span");
        e.className = "pagination-ellipsis";
        e.textContent = "...";
        paginationPages.appendChild(e);
      }
    }
    for (let i = start; i <= end; i++) {
      const b = document.createElement("button");
      b.className = "pagination-page" + (i === currentPage ? " active" : "");
      b.textContent = i;
      const p = i;
      b.onclick = () => { currentPage = p; render(); };
      paginationPages.appendChild(b);
    }
    if (end < totalPages) {
      if (end < totalPages - 1) {
        const e = document.createElement("span");
        e.className = "pagination-ellipsis";
        e.textContent = "...";
        paginationPages.appendChild(e);
      }
      const b = document.createElement("button");
      b.className = "pagination-page";
      b.textContent = totalPages;
      b.onclick = () => { currentPage = totalPages; render(); };
      paginationPages.appendChild(b);
    }
  }
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter") || "all";
      currentPage = 1;
      render();
    });
  });
}

function setupPagination() {
  const prevBtn = document.querySelector(".pagination-prev");
  const nextBtn = document.querySelector(".pagination-next");
  if (prevBtn) prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; render(); } };
  if (nextBtn) nextBtn.onclick = () => {
    const filtered = getFilteredItems();
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage < totalPages) { currentPage++; render(); }
  };
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxTag = document.getElementById("lightbox-tag");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  const swipeHint = document.getElementById("swipe-hint");

  if (!lightbox || !lightboxImg) return;

  const filtered = getFilteredItems();
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  let currentIndex = 0;
  let swipeHintFadeTimeout = null;
  const SWIPE_THRESHOLD = 50;

  const SWIPE_ANIMATION_DURATION_MS = 300;
  const TRANSITION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

  const updateImg = () => {
    const item = pageItems[currentIndex];
    if (item) {
      lightboxImg.src = item.url;
      lightboxImg.alt = item.alt || "";
      lightboxImg.style.display = "block";
      if (lightboxTitle) lightboxTitle.textContent = "";
      if (lightboxTag) lightboxTag.textContent = item.tag || item.category || "";
    }
  };

  const setImageTransform = (x, useTransition = false) => {
    lightboxImg.style.transition = useTransition
      ? `transform ${SWIPE_ANIMATION_DURATION_MS}ms ${TRANSITION_EASING}`
      : "none";
    lightboxImg.style.transform = typeof x === "number" ? `translateX(${x}px)` : `translateX(${x})`;
  };

  const slideInNewImage = (fromRight) => {
    const startX = fromRight ? "100%" : "-100%";
    setImageTransform(startX, false);
    const onReady = () => {
      requestAnimationFrame(() => {
        setImageTransform("0", true);
      });
    };
    if (lightboxImg.complete && lightboxImg.naturalWidth) {
      onReady();
    } else {
      lightboxImg.addEventListener("load", onReady, { once: true });
    }
  };

  const goPrev = () => {
    currentIndex = (currentIndex - 1 + pageItems.length) % pageItems.length;
    updateImg();
    slideInNewImage(false);
  };
  const goNext = () => {
    currentIndex = (currentIndex + 1) % pageItems.length;
    updateImg();
    slideInNewImage(true);
  };

  const fadeOutSwipeHint = () => {
    if (swipeHint) swipeHint.classList.add("fade-out");
    if (swipeHintFadeTimeout) {
      clearTimeout(swipeHintFadeTimeout);
      swipeHintFadeTimeout = null;
    }
  };

  const open = (index) => {
    currentIndex = index;
    setImageTransform(0, false);
    updateImg();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    if (swipeHint) swipeHint.classList.remove("fade-out");
    const isTouch = "ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && swipeHint) {
      swipeHintFadeTimeout = setTimeout(fadeOutSwipeHint, 3000);
      lightbox._swipeHintFadeTimeout = swipeHintFadeTimeout;
    }
  };

  const close = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    if (swipeHint) swipeHint.classList.remove("fade-out");
    if (swipeHintFadeTimeout) {
      clearTimeout(swipeHintFadeTimeout);
      swipeHintFadeTimeout = null;
    }
  };

  lightboxClose.onclick = close;
  lightboxPrev.onclick = goPrev;
  lightboxNext.onclick = goNext;

  lightbox.onclick = (e) => { if (e.target === lightbox) close(); };

  if (!lightbox._galleryTouchListenersAttached) {
    lightbox._galleryTouchListenersAttached = true;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    lightbox.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
    }, { passive: true });
    lightbox.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault();
        currentX = dx;
        setImageTransform(dx, false);
      }
    }, { passive: false });
    lightbox.addEventListener("touchend", (e) => {
      if (e.changedTouches.length !== 1) return;
      const deltaX = currentX;
      const fadeHint = () => {
        document.getElementById("swipe-hint")?.classList.add("fade-out");
        if (lightbox._swipeHintFadeTimeout) {
          clearTimeout(lightbox._swipeHintFadeTimeout);
          lightbox._swipeHintFadeTimeout = null;
        }
      };
      if (deltaX > SWIPE_THRESHOLD) {
        fadeHint();
        setImageTransform("100%", true);
        const onEnd = () => {
          lightboxImg.removeEventListener("transitionend", onEnd);
          goPrev();
        };
        lightboxImg.addEventListener("transitionend", onEnd);
      } else if (deltaX < -SWIPE_THRESHOLD) {
        fadeHint();
        setImageTransform("-100%", true);
        const onEnd = () => {
          lightboxImg.removeEventListener("transitionend", onEnd);
          goNext();
        };
        lightboxImg.addEventListener("transitionend", onEnd);
      } else {
        setImageTransform(0, true);
      }
    }, { passive: true });
  }

  document.querySelectorAll(".gallery-item").forEach((el, idx) => {
    el.onclick = () => open(idx);
  });

  if (!window._galleryKeyHandler) {
    window._galleryKeyHandler = (e) => {
      const lb = document.getElementById("lightbox");
      if (!lb?.classList.contains("active")) return;
      if (e.key === "Escape") lb.querySelector(".lightbox-close")?.click();
      if (e.key === "ArrowLeft") lb.querySelector(".lightbox-prev")?.click();
      if (e.key === "ArrowRight") lb.querySelector(".lightbox-next")?.click();
    };
    document.addEventListener("keydown", window._galleryKeyHandler);
  }
}
