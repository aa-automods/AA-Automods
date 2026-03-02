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

let allItems = [];
let currentFilter = "all";
let currentPage = 1;

export async function loadGallery() {
  const galleryGrid = document.querySelector(".gallery-grid");
  const paginationWrapper = document.querySelector(".pagination-wrapper");
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '<div class="gallery-loading">Loading gallery…</div>';

  try {
    const q = query(GALLERY_REF, orderBy("order", "asc"));
    const snap = await getDocs(q);
    allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

  if (!lightbox || !lightboxImg) return;

  const filtered = getFilteredItems();
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  let currentIndex = 0;

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

  const open = (index) => {
    currentIndex = index;
    updateImg();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  lightboxClose.onclick = close;
  lightboxPrev.onclick = () => {
    currentIndex = (currentIndex - 1 + pageItems.length) % pageItems.length;
    updateImg();
  };
  lightboxNext.onclick = () => {
    currentIndex = (currentIndex + 1) % pageItems.length;
    updateImg();
  };

  lightbox.onclick = (e) => { if (e.target === lightbox) close(); };

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
