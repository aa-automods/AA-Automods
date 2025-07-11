function createStarHeadliner() { const container = document.getElementById("light-particles");
    container.innerHTML = "";
    container.style.backgroundColor = "#000814"; const isMobile = window.innerWidth < 768; const baseParticleCount = isMobile ? 1000 : 1250; const screenArea = window.innerWidth * window.innerHeight; const baseArea = 1920 * 1080; const densityFactor = Math.min(1.5, Math.sqrt(screenArea / baseArea)); const particleCount = Math.floor(baseParticleCount * densityFactor); const starTypes = [{ size: [1, 2], count: Math.floor(0.7 * particleCount), blur: 0, opacity: [0.4, 0.8], color: "white" }, { size: [2, 3], count: Math.floor(0.17 * particleCount), blur: 0.5, opacity: [0.6, 1], color: "white" }, { size: [3, 5], count: Math.floor(0.06 * particleCount), blur: 1, opacity: [0.7, 1], color: "white" }, { size: [2, 3], count: Math.floor(0.7 * particleCount), blur: 0.5, opacity: [0.8, 1], color: "#8bcdff" }, ]; let totalCreated = 0;
    starTypes.forEach((type) => { for (let i = 0; i < type.count && totalCreated < particleCount; i++) { const star = document.createElement("div");
            star.classList.add("star-particle"); const size = Math.random() * (type.size[1] - type.size[0]) + type.size[0];
            star.style.width = `${size}px`;
            star.style.height = `${size}px`; const posX = Math.random() * 98 + 1; const posY = Math.random() * 98 + 1;
            star.style.left = `${posX}%`;
            star.style.top = `${posY}%`;
            star.style.position = "absolute";
            star.style.borderRadius = "50%";
            star.style.backgroundColor = type.color;
            star.style.filter = `blur(${type.blur}px)`; const opacity = Math.random() * (type.opacity[1] - type.opacity[0]) + type.opacity[0];
            star.style.opacity = opacity; const twinkleDelay = Math.random() * 10; const twinkleDuration = Math.random() * 3 + 2;
            star.style.animation = `twinkle ${twinkleDuration}s ease-in-out ${twinkleDelay}s infinite`;
            container.appendChild(star);
            totalCreated++ } }); const shootingStarInterval = isMobile ? 10000 : 6000;
    setInterval(createShootingStar, shootingStarInterval); if (!document.getElementById("star-styles")) { const styleSheet = document.createElement("style");
        styleSheet.id = "star-styles";
        styleSheet.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
            }
            
            @keyframes shoot {
                0% { 
                    transform: translate(0, 0) rotate(-45deg) scale(0);
                    opacity: 0;
                }
                10% {
                    transform: translate(-20px, 20px) rotate(-45deg) scale(1);
                    opacity: 1;
                }
                100% { 
                    transform: translate(-200px, 200px) rotate(-45deg) scale(0.2);
                    opacity: 0;
                }
            }
            
            .shooting-star {
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
                border-radius: 50%;
                box-shadow: 0 0 3px 1px white;
                transform-origin: 100% 0;
            }
        `;
        document.head.appendChild(styleSheet) } }

function createShootingStar() { const container = document.getElementById("light-particles"); const shootingStar = document.createElement("div");
    shootingStar.classList.add("shooting-star"); const startX = Math.random() * 80 + 20; const startY = Math.random() * 30;
    shootingStar.style.left = `${startX}%`;
    shootingStar.style.top = `${startY}%`; const length = Math.random() * 30 + 20;
    shootingStar.style.width = `${length}px`;
    shootingStar.style.height = "2px"; const duration = Math.random() * 0.3 + 1;
    shootingStar.style.animation = `shoot ${duration}s linear forwards`;
    container.appendChild(shootingStar);
    setTimeout(() => { shootingStar.remove() }, duration * 1000) }

function addHeadlinerStyles() { const style = document.createElement("style");
    style.textContent = `
    #light-particles {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000814;
    }
    
    .star-particle {
      position: absolute;
      border-radius: 50%;
    }
  `;
    document.head.appendChild(style) }

function initStarHeadliner() { addHeadlinerStyles();
    createStarHeadliner() }

function animateBackground() { const background = document.querySelector(".animated-background");
    setInterval(() => { const xPos = Math.random() * 10 - 5; const yPos = Math.random() * 10 - 5;
        background.style.transform = `translate(${xPos}px, ${yPos}px)`;
        background.style.transition = "transform 8s ease-in-out" }, 8000) }

function handleHeaderScroll() { const header = document.getElementById("header");
    window.addEventListener("scroll", () => { if (window.scrollY > 50) { header.style.padding = "0.8rem 0";
            header.style.background = "rgba(18, 18, 18, 0.95)" } else { header.style.padding = "1.5rem 0";
            header.style.background = "rgba(18, 18, 18, 0.9)" } }) }

function setupMobileNav() { const navToggle = document.getElementById("nav-toggle"); const closeNav = document.getElementById("close-nav"); const nav = document.getElementById("main-nav"); const navLinks = nav.querySelectorAll("a");
    navToggle.addEventListener("click", () => { nav.classList.add("active") });
    closeNav.addEventListener("click", () => { nav.classList.remove("active") });
    navLinks.forEach((link) => { link.addEventListener("click", () => { nav.classList.remove("active") }) }) }

function handleInitialHash() { if (window.location.hash) { const target = document.querySelector(window.location.hash); if (target) { setTimeout(() => { scroll.scrollTo(target, { offset: -100, duration: 0 }) }, 100) } } }
document.addEventListener("DOMContentLoaded", () => { initStarHeadliner();
    animateBackground();
    handleHeaderScroll();
    setupMobileNav();
    handleInitialHash(); const animatedElements = document.querySelectorAll(".service-card, .gallery-item", ); const observer = new IntersectionObserver((entries) => { entries.forEach((entry, index) => { if (entry.isIntersecting) { setTimeout(() => { entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)" }, index * 150) } }) }, { threshold: 0.1 }, );
    animatedElements.forEach((element) => { element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "opacity 0.6s, transform 0.6s";
        observer.observe(element) }); const lazyImages = document.querySelectorAll('img[loading="lazy"]'); const lazyImageObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                lazyImageObserver.unobserve(lazyImage) } }) }, { rootMargin: "200px 0px" });
    lazyImages.forEach((lazyImage) => { if (lazyImage.dataset.src) { lazyImageObserver.observe(lazyImage) } }) });
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("consultation-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const consultationForm = document.getElementById("consultation-form");
    const formSuccess = document.getElementById("form-success");
    const closeSuccessBtn = document.querySelector(".close-success");
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((button) => { button.addEventListener("click", (e) => { e.preventDefault();
            openModal(); const modalContent = document.querySelector('.modal-content');
            modalContent.classList.add('animate-shimmer');
            setTimeout(() => { modalContent.classList.remove('animate-shimmer') }, 800) }) });
    closeModalBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => { if (e.target === modal) { closeModal() } });
    closeSuccessBtn.addEventListener("click", () => { closeModal();
        setTimeout(() => { formSuccess.classList.add("hidden");
            consultationForm.style.display = "block" }, 300) });
    consultationForm.addEventListener("submit", (e) => { e.preventDefault(); const formData = new FormData(consultationForm);
        fetch("https://formsubmit.co/ajax/anthonywalcott31@gmail.com", { method: "POST", body: formData, }).then((response) => response.json()).then((data) => { consultationForm.style.display = "none";
            formSuccess.classList.remove("hidden");
            consultationForm.reset();
            console.log("Form submitted successfully:", data) }).catch((error) => { console.error("Form submission error:", error) }); const sendButton = document.querySelector(".submit-button");
        sendButton.textContent = "Sending...";
        sendButton.disabled = !0 });

    function openModal() { const modal = document.getElementById("consultation-modal");
        modal.classList.add("show");
        document.body.style.overflow = "hidden"; const formSuccess = document.getElementById("form-success"); const consultationForm = document.getElementById("consultation-form");
        formSuccess.classList.add("hidden");
        consultationForm.style.display = "block";
        setTimeout(() => { const firstInput = consultationForm.querySelector('input, textarea, select'); if (firstInput) { firstInput.focus() } }, 100) }

    function closeModal() { modal.classList.remove("show");
        document.body.style.overflow = "" }
});
document.addEventListener('DOMContentLoaded', () => { const consultationModal = document.getElementById('consultation-modal'); const closeModalButton = consultationModal.querySelector('.close-modal');
    closeModalButton.addEventListener('click', () => { const modal = document.getElementById("consultation-modal");
        modal.classList.remove("show");
        document.body.style.overflow = "" });
    window.openConsultationModal = () => { openModal() } });
document.addEventListener("DOMContentLoaded", () => {
    window.openPricingModal = function(serviceId) {
        const pricingModal = document.getElementById("pricing-modal");
        const pricingTitle = document.getElementById("pricing-title");
        const pricingContents = document.querySelectorAll(".pricing-content");
        pricingContents.forEach(content => { content.classList.remove("active") });
        const selectedPricing = document.getElementById(`${serviceId}-pricing`);
        if (selectedPricing) { selectedPricing.classList.add("active"); const serviceTitle = selectedPricing.querySelector("h3").textContent;
            pricingTitle.textContent = `${serviceTitle} Pricing` }
        const saleModal = document.getElementById("sale-modal");
        saleModal.classList.remove("show");
        setTimeout(() => { pricingModal.classList.add("show");
            document.body.style.overflow = "hidden" }, 300)
    };
    const saleModal = document.getElementById("sale-modal");
    const viewOffersBtn = document.getElementById("view-offers-btn");
    const closeSaleModal = saleModal.querySelector(".close-modal");
    viewOffersBtn.addEventListener("click", () => { saleModal.classList.add("show");
        document.body.style.overflow = "hidden" });
    closeSaleModal.addEventListener("click", () => { saleModal.classList.remove("show");
        document.body.style.overflow = "" });
    window.addEventListener("click", (e) => { if (e.target === saleModal) { saleModal.classList.remove("show");
            document.body.style.overflow = "" } });
    const serviceLinks = document.querySelectorAll(".service-link");
    const pricingModal = document.getElementById("pricing-modal");
    const closePricingBtn = pricingModal.querySelector(".close-modal");
    const pricingTitle = document.getElementById("pricing-title");
    const pricingContents = document.querySelectorAll(".pricing-content");

    function openPricingModal(serviceId) {
        pricingContents.forEach((content) => { content.classList.remove("active") });
        const selectedPricing = document.getElementById(`${serviceId}-pricing`);
        if (selectedPricing) { selectedPricing.classList.add("active"); const serviceTitle = selectedPricing.querySelector("h3").textContent;
            pricingTitle.textContent = `${serviceTitle} Pricing` }
        pricingModal.classList.add("show");
        document.body.style.overflow = "hidden"
    }
    serviceLinks.forEach((link, index) => { link.addEventListener("click", (e) => { e.preventDefault(); const serviceCard = link.closest(".service-card"); const serviceTitle = serviceCard.querySelector("h3").textContent; const serviceId = serviceTitle.toLowerCase().replace(/\s+/g, "-");
            openPricingModal(serviceId) }) });
    closePricingBtn.addEventListener("click", closePricingModal);
    pricingModal.addEventListener("click", (e) => { if (e.target === pricingModal) { closePricingModal() } });

    function closePricingModal() { pricingModal.classList.remove("show");
        document.body.style.overflow = "" }
    window.openConsultationModal = function() { closePricingModal();
        setTimeout(() => { const consultationModal = document.getElementById("consultation-modal");
            consultationModal.classList.add("show");
            document.body.style.overflow = "hidden" }, 300) }
});
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const thumbnails = document.querySelectorAll(".thumbnail");
let isAnimating = !1;
showSlide(slideIndex);
thumbnails.forEach((thumb, index) => { thumb.addEventListener("click", () => { if (index !== slideIndex && !isAnimating) { isAnimating = !0; const currentVideos = slides[slideIndex].querySelectorAll('video');
            currentVideos.forEach(video => video.pause());
            slides[slideIndex].classList.add("slide-out");
            setTimeout(() => { slides[slideIndex].classList.remove("active-slide", "slide-out");
                showSlide(index);
                isAnimating = !1 }, 500) } }) });

function changeSlide(n) { if (isAnimating) return;
    isAnimating = !0; const currentVideos = slides[slideIndex].querySelectorAll('video');
    currentVideos.forEach(video => video.pause()); const newIndex = (slideIndex + n + slides.length) % slides.length;
    slides[slideIndex].classList.add("slide-out");
    setTimeout(() => { slides[slideIndex].classList.remove("active-slide", "slide-out");
        showSlide(newIndex);
        isAnimating = !1 }, 500) }

function showSlide(n) { slides.forEach((slide, index) => { slide.classList.remove("active-slide", "slide-out"); const videos = slide.querySelectorAll('video');
        videos.forEach(video => { if (index === n) { video.play().catch(e => console.log("Video autoplay prevented:", e)) } else { video.pause();
                video.currentTime = 0 } }) });
    thumbnails.forEach((thumb, index) => { thumb.classList.toggle("active", index === n) });
    slides[n].classList.add("active-slide");
    slideIndex = n }
document.querySelectorAll(".services .service-card").forEach((card) => {
    const images = card.querySelector(".service-images");
    const prevBtn = card.querySelector(".prev");
    const nextBtn = card.querySelector(".next");
    const dots = card.querySelectorAll(".image-dot");
    let currentIndex = 0;
    const mediaItems = images.querySelectorAll("img, video");

    function updateImages() { images.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => { dot.classList.toggle("active", index === currentIndex) });
        mediaItems.forEach((item, index) => { if (item.tagName === 'VIDEO') { if (index === currentIndex) { item.play().catch(e => console.log("Video autoplay prevented:", e)) } else { item.pause();
                    item.currentTime = 0 } } }) }
    prevBtn.addEventListener("click", () => { currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        updateImages() });
    nextBtn.addEventListener("click", () => { currentIndex = (currentIndex + 1) % mediaItems.length;
        updateImages() });
    dots.forEach((dot, index) => { dot.addEventListener("click", () => { currentIndex = index;
            updateImages() }) });
    const firstVideo = mediaItems[0];
    if (firstVideo && firstVideo.tagName === 'VIDEO') { firstVideo.play().catch(e => console.log("Video autoplay prevented:", e)) }
});
window.addEventListener('resize', fixViewport);
fixViewport();
document.addEventListener("DOMContentLoaded", () => {
    const scroll = new LocomotiveScroll({ el: document.querySelector("[data-scroll-container]"), smooth: !0, multiplier: 0.6, smartphone: { smooth: !0, }, tablet: { smooth: !0, }, getDirection: !0, getSpeed: !0, inertia: 0.7, lerp: 0.1, touchMultiplier: 1.5, firefoxMultiplier: 50, });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function(e) { e.preventDefault(); const targetId = this.getAttribute('href'); const target = document.querySelector(targetId); if (target) { scroll.scrollTo(target, { offset: -100, duration: 1000 }); const nav = document.getElementById("main-nav");
                nav.classList.remove("active") } }) });
    window.addEventListener("resize", () => { scroll.update() });

    function ScrollUpdateDelay() { setTimeout(function() { scroll.update() }, 500) }
    ScrollUpdateDelay();

    function debounce(func, wait = 20, immediate = !0) { let timeout; return function() { const context = this,
                args = arguments; const later = function() { timeout = null; if (!immediate) func.apply(context, args); }; const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait); if (callNow) func.apply(context, args); } }
    window.addEventListener('scroll', debounce(() => {}))
});
if (document.getElementById('paypal-button-container')) { paypal.Buttons({ style: { color: 'blue', shape: 'pill', label: 'pay', height: 40 }, createOrder: function(data, actions) { return actions.order.create({ purchase_units: [{ description: "Deposit Payment", amount: { value: '100.00' } }] }) }, onApprove: function(data, actions) { return actions.order.capture().then(function(details) { window.location.href = "https://yourdomain.com/thank-you" }) }, onCancel: function(data) { alert('Payment cancelled.') }, onError: function(err) { console.error('PayPal Checkout error', err);
            alert('An error occurred with PayPal Checkout.') } }).render('#paypal-button-container') }
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').then(registration => console.log('SW registered')).catch(err => console.log('SW registration failed')) }) }