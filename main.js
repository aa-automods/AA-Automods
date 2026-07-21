// main.js
// Brand New Clean Mobile Navigation
const navMenuBtn = document.querySelector('.nav-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (navMenuBtn && navMenu) {
    navMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = navMenu.classList.toggle('active');
        navMenuBtn.classList.toggle('active');
        
        // Toggle body scroll and overlay
        if (isActive) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('menu-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navMenuBtn.contains(e.target)) {
            navMenu.classList.remove('active');
            navMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        }
    });

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        // If it's a page link, don't prevent default
        if (targetId.startsWith('http') || targetId.includes('.html')) {
            return;
        }
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Staggered delay for grid children
            const parent = entry.target.parentElement;
            if (parent) {
                const siblings = [...parent.children].filter(c => 
                    c.matches('.service-card, .project-card, .gallery-item')
                );
                const idx = siblings.indexOf(entry.target);
                if (idx >= 0) {
                    entry.target.style.transitionDelay = `${idx * 0.08}s`;
                }
            }
        }
    });
}, observerOptions);

// Observe cards, gallery items, and section elements
document.querySelectorAll('.service-card, .project-card, .gallery-item').forEach(el => observer.observe(el));
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
if (navbar) {
    const updateNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
}

// Counter animation for cert numbers
function animateCounter(el, duration = 1500) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(target * eased);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const certObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.cert-number[data-count]').forEach(el => certObserver.observe(el));

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        const speed = scrolled * 0.3;
        hero.style.transform = `translateY(${speed}px)`;
    }
});

// Hero: starlight photo slideshow + twinkle overlay (no video file needed)
function initHeroStarlight() {
    const slideshow = document.querySelector('.hero-slideshow');
    const canvas = document.querySelector('.hero-twinkles');
    if (!slideshow) return;

    const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (slides.length > 1 && !reduceMotion) {
        let index = slides.findIndex(s => s.classList.contains('is-active'));
        if (index < 0) index = 0;
        setInterval(() => {
            slides[index].classList.remove('is-active');
            index = (index + 1) % slides.length;
            // Restart ken-burns by reflowing the next slide
            const next = slides[index];
            next.style.animation = 'none';
            // force reflow
            void next.offsetWidth;
            next.style.animation = '';
            next.classList.add('is-active');
        }, 7000);
    }

    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let rafId = null;
    let running = true;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        spawnStars(rect.width, rect.height);
    }

    function spawnStars(w, h) {
        const count = Math.min(90, Math.floor((w * h) / 14000));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.6 + Math.random() * 1.8,
            base: 0.15 + Math.random() * 0.45,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 2.2
        }));
    }

    function draw(time) {
        if (!running) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);

        for (const s of stars) {
            const twinkle = s.base + Math.sin(time * 0.001 * s.speed + s.phase) * 0.45;
            const alpha = Math.max(0, Math.min(1, twinkle));
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();

            // soft glow on brighter twinkles
            if (alpha > 0.55) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(180, 210, 255, ${alpha * 0.25})`;
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            running = entries.some(e => e.isIntersecting);
            if (running && !rafId) rafId = requestAnimationFrame(draw);
            if (!running && rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, { threshold: 0.05 });
        io.observe(hero);
    }

    rafId = requestAnimationFrame(draw);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroStarlight);
} else {
    initHeroStarlight();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu && navMenuBtn) {
        navMenu.classList.remove('active');
        navMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
    }
});


// Modal functionality
const modalTriggers = document.querySelectorAll('.modal-trigger');
const modals = document.querySelectorAll('.modal');
const modalCloses = document.querySelectorAll('.modal-close');
const modalOverlays = document.querySelectorAll('.modal-overlay');

// Open modal
modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close modal functions
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close on close button click
modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) {
            closeModal(modal);
        }
    });
});

// Close on overlay click
modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', () => {
        const modal = overlay.closest('.modal');
        if (modal) {
            closeModal(modal);
        }
    });
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modals.forEach(modal => {
            if (modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    }
});

// Service Card Image Carousel
class ServiceCarousel {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.carousel-slide');
        this.indicators = container.querySelectorAll('.indicator');
        this.currentIndex = 0;
        this.autoRotateInterval = null;
        this.autoRotateDelay = 4000; // 4 seconds
        
        this.init();
    }
    
    init() {
        // Start auto-rotation
        this.startAutoRotate();
        
        // Keep carousel moving even on hover - removed pause functionality
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        // Remove active class from current slide
        this.slides[this.currentIndex].classList.remove('active');
        
        // Update indicator if it exists
        if (this.indicators.length > 0 && this.indicators[this.currentIndex]) {
            this.indicators[this.currentIndex].classList.remove('active');
        }
        
        // Set new index
        this.currentIndex = index;
        
        // Add active class to new slide
        this.slides[this.currentIndex].classList.add('active');
        
        // Update indicator if it exists
        if (this.indicators.length > 0 && this.indicators[this.currentIndex]) {
            this.indicators[this.currentIndex].classList.add('active');
        }
        
        // Reset auto-rotate timer
        this.resetAutoRotate();
    }
    
    goToNext() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    goToPrev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoRotate() {
        this.stopAutoRotate(); // Clear any existing interval
        this.autoRotateInterval = setInterval(() => {
            this.goToNext();
        }, this.autoRotateDelay);
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    resetAutoRotate() {
        this.stopAutoRotate();
        this.startAutoRotate();
    }
}

// Initialize all service carousels
function initServiceCarousels() {
    const carouselContainers = document.querySelectorAll('.service-image-carousel .carousel-container');
    carouselContainers.forEach(container => {
        // Check if already initialized
        if (!container.dataset.initialized) {
            new ServiceCarousel(container);
            container.dataset.initialized = 'true';
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceCarousels);
} else {
    // DOM is already loaded
    initServiceCarousels();
}

// Service detail modal (photo cycle + description)
const SERVICE_DETAIL_DATA = {
    'star-headliner': {
        title: 'Star Headliner',
        description: 'Transform your headliner into a breathtaking night sky with our fiber optic starlight installations. Choose custom colors, density, and shooting-star effects for a one-of-a-kind interior glow.',
        images: ['photos/starlight-1.avif', 'photos/starlight-6.avif', 'photos/starlight-8.avif'],
        pricingModal: 'star-headliner-modal',
        pricingHash: 'star-headliner'
    },
    'ambient-lighting': {
        title: 'Ambient Lighting',
        description: 'Custom RGB LED ambient lighting with smartphone control, music sync, and multi-zone installs. From subtle footwell accents to full cabin immersion.',
        images: ['photos/ambient-3.avif', 'photos/ambient-9.avif', 'photos/ambient-8.avif'],
        pricingModal: 'ambient-lighting-modal',
        pricingHash: 'ambient-lighting'
    },
    'underglow': {
        title: 'Underglow',
        description: 'Premium underglow installation with vibrant, customizable LED lighting. Choose strips or pods with chasing RGB options for a clean, eye-catching exterior look.',
        images: ['photos/underglow-1.avif', 'photos/underglow-3.avif', 'photos/underglow-4.avif'],
        pricingModal: 'underglow-modal',
        pricingHash: 'underglow'
    },
    'service-lighting': {
        title: 'Service Lighting',
        description: 'Professional service lighting installation for maximum visibility. High-quality LED solutions for service vehicles—built for reliability in any condition.',
        images: ['photos/el-2.avif', 'photos/el-1.avif'],
        pricingModal: 'service-lighting-modal',
        pricingHash: 'service-lighting'
    },
    'radio': {
        title: 'Radio — Apple CarPlay',
        description: 'Upgrade your vehicle with a modern aftermarket touchscreen radio featuring Apple CarPlay, Android Auto, Bluetooth, navigation, and a crisp touch display. Factory features retained such as steering wheel controls, voice control, HVAC controls, and more—plus extras like backup camera or video streaming via hotspot.',
        images: ['photos/radio-1.avif', 'photos/radio-2.avif']
    },
    'remote-starter': {
        title: 'Remote Starter',
        description: 'Start your vehicle from the comfort of your home with our remote starter systems. Warm up in winter or cool down in summer with long-range remotes, optional range extenders, smartphone app control, and compatibility with your original key fob. Built-in safety features help protect against theft.',
        images: ['photos/remote-Starter.avif', 'photos/remote-Starter-1.avif']
    },
    'dash-camera': {
        title: 'Dash Camera',
        description: 'Protect your vehicle and drive with confidence using our dash camera systems. HD recording, wide-angle lenses, night vision, and loop recording so you never miss important moments. Many models include parking mode, motion detection, GPS tracking, and smartphone connectivity.',
        images: ['photos/dash-Camera.avif', 'photos/dash-Camera-1.avif']
    },
    'vinyl-wrap': {
        title: 'Vinyl Wrap',
        description: 'Transform the look of your vehicle with professional vinyl wrap. Full colour change, chrome delete, custom accents, interior trim wrapping, and custom printed decals or liveries—stylish and reversible.',
        images: ['photos/vinyl-Wrap.avif', 'photos/vinyl-Wrap-1.avif']
    },
    'ppf': {
        title: 'PPF (Paint Protection Film)',
        description: 'Protect and enhance your vehicle with Paint Protection Film. Available in clear, satin, and colour-change finishes, PPF helps shield paint from rock chips, scratches, and road debris while keeping a flawless look.',
        images: ['photos/ppf.avif']
    },
    'carbon-steering': {
        title: 'Carbon Fiber Parts',
        description: 'Upgrade with carbon fibre steering wheels and body kits for a sleek, high-end look. Lightweight upgrades with improved grip and aggressive styling. Custom made to order—reshape your wheel, choose carbon patterns, and personalize the design.',
        images: ['photos/carbon-Fibre-Parts.avif', 'photos/carbon-Fibre-Parts-1.avif', 'photos/steering-1.avif']
    }
};

let serviceDetailCarouselInterval = null;

function buildServiceDetailModalContent(modal, data) {
    const track = modal.querySelector('.service-detail-carousel__track');
    const titleEl = modal.querySelector('#service-detail-title');
    const descEl = modal.querySelector('.service-detail-modal__description');
    const pricingBtn = modal.querySelector('.js-service-pricing');
    const pricingLink = modal.querySelector('.js-service-pricing-link');

    track.innerHTML = '';
    data.images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'service-detail-carousel__slide';
        slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
        slide.style.backgroundImage = `url('${src}')`;
        track.appendChild(slide);
    });

    titleEl.textContent = data.title;
    descEl.textContent = data.description;

    if (pricingBtn) {
        if (data.pricingModal) {
            pricingBtn.hidden = false;
            pricingBtn.dataset.modal = data.pricingModal;
        } else {
            pricingBtn.hidden = true;
            delete pricingBtn.dataset.modal;
        }
    }

    if (pricingLink) {
        if (data.pricingHash) {
            pricingLink.hidden = false;
            pricingLink.href = `/services#${data.pricingHash}`;
        } else {
            pricingLink.hidden = true;
            pricingLink.href = '/services';
        }
    }
}

function goToServiceDetailSlide(modal, index) {
    const slides = modal.querySelectorAll('.service-detail-carousel__slide');
    if (!slides.length) return;
    const i = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((s, k) => s.setAttribute('aria-hidden', k !== i ? 'true' : 'false'));
}

function startServiceDetailCarousel(modal) {
    stopServiceDetailCarousel();
    const slides = modal.querySelectorAll('.service-detail-carousel__slide');
    if (slides.length < 2) return;
    serviceDetailCarouselInterval = setInterval(() => {
        const current = modal.querySelector('.service-detail-carousel__slide[aria-hidden="false"]');
        const idx = Array.from(slides).indexOf(current);
        goToServiceDetailSlide(modal, idx + 1);
    }, 4000);
}

function stopServiceDetailCarousel() {
    if (serviceDetailCarouselInterval) {
        clearInterval(serviceDetailCarouselInterval);
        serviceDetailCarouselInterval = null;
    }
}

function openServiceDetailModal(serviceId) {
    const modal = document.getElementById('service-detail-modal');
    if (!modal) return;
    const data = SERVICE_DETAIL_DATA[serviceId];
    if (!data) return;
    buildServiceDetailModalContent(modal, data);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startServiceDetailCarousel(modal);
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeServiceDetailModal() {
    const modal = document.getElementById('service-detail-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopServiceDetailCarousel();
}

function initServiceDetailModal() {
    const modal = document.getElementById('service-detail-modal');
    if (!modal) return;

    document.querySelectorAll('.js-open-service-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-service-id');
            if (id) openServiceDetailModal(id);
        });
    });

    modal.querySelectorAll('.modal-close, .modal-overlay, .js-close-service-modal').forEach(el => {
        el.addEventListener('click', () => closeServiceDetailModal());
    });

    const pricingBtn = modal.querySelector('.js-service-pricing');
    if (pricingBtn) {
        pricingBtn.addEventListener('click', () => {
            const pricingId = pricingBtn.dataset.modal;
            if (!pricingId) return;
            closeServiceDetailModal();
            const pricingModal = document.getElementById(pricingId);
            if (pricingModal) {
                pricingModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeServiceDetailModal();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceDetailModal);
} else {
    initServiceDetailModal();
}