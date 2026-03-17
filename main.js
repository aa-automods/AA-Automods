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

// ——— Additional Services Detail Modal ———
const ADDITIONAL_SERVICES_DATA = {
    'radio': {
        title: 'Radio — Apple CarPlay',
        description: 'Upgrade your vehicle with a modern aftermarket touchscreen radio featuring Apple CarPlay, Android Auto, Bluetooth, navigation, and a crisp touch display. With programmed factory features retained such as; steerwheel controls, voice control, HVAC controls, and all other original features your car already has. As well as adding features your car might not have like a back up camera or video streaming via hotspot.',
        images: ['photos/radio-1.avif', 'photos/radio-2.avif']
    },
    'remote-starter': {
        title: 'Remote Starter',
        description: 'Start your vehicle from the comfort of your home with our remote starter systems. Warm up your car in winter or cool it down in summer with convenient features like long-range remotes, optional range extenders, smartphone app control, and compatibility with your original key fob. Built-in safety features ensure the engine shuts off if the vehicle is accessed without the key, helping protect against theft while keeping your drive comfortable and secure.',
        images: ['photos/remote-Starter-1.avif', 'photos/remote-Starter.avif']
    },
    'dash-camera': {
        title: 'Dash Camera',
        description: 'Protect your vehicle and drive with confidence using our dash camera systems. Record clear video of the road with features like HD recording, wide-angle lenses, night vision, and loop recording so you never miss important moments. Many models also include parking mode, motion detection, GPS tracking, and smartphone connectivity, giving you reliable evidence and added peace of mind whether you\'re driving or parked. Some models can even be paired with our aftermarket radios to directly download and view footage right from your car screen.',
        images: ['photos/dash-Camera-1.avif', 'photos/dash-Camera.avif']
    },
    'vinyl-wrap': {
        title: 'Vinyl Wrap',
        description: 'Transform the look of your vehicle with our professional vinyl wrap services. Whether you want a full colour change, chrome delete, or custom accents, vinyl wrap is a stylish and reversible way to personalize your car. We also specialize in niche installs like interior trim wrapping, giving your vehicle a clean, custom finish inside and out. We also offer custom printed decals and livery.',
        images: ['photos/vinyl-Wrap-1.avif', 'photos/vinyl-Wrap.avif']
    },
    'ppf': {
        title: 'PPF (Paint Protection Film)',
        description: 'Protect and enhance your vehicle with Paint Protection Film (PPF). Available in clear, satin, and colour-change finishes, PPF helps shield your paint from rock chips, scratches, and road debris while maintaining a flawless look. This durable, self-healing film keeps your vehicle looking newer for longer while adding an extra layer of protection and style.',
        images: ['photos/ppf.avif']
    },
    'carbon-steering': {
        title: 'Carbon Fiber Parts',
        description: 'Upgrade your vehicle\'s style and performance with carbon fibre steering wheels and body kits. Designed for a sleek, high-end look, these lightweight upgrades add a sporty feel, improved grip, and aggressive styling to your interior and exterior. From custom steering wheels to aerodynamic body components. Our carbon fibre parts are all custom made to order and allows the customer to provide any type of customization they desire, from completely reshaping your wheel to the pattern and design of the carbon itself.',
        images: ['photos/carbon-Fibre-Parts.avif', 'photos/carbon-Fibre-Parts-1.avif']
    },
};

let serviceDetailCarouselInterval = null;

function buildServiceDetailModalContent(modal, data) {
    const track = modal.querySelector('.service-detail-carousel__track');
    const titleEl = modal.querySelector('#service-detail-title');
    const descEl = modal.querySelector('.service-detail-modal__description');

    track.innerHTML = '';

    data.images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'service-detail-carousel__slide';
        slide.setAttribute('aria-hidden', i !== 0);
        slide.style.backgroundImage = `url('${src}')`;
        track.appendChild(slide);
    });

    titleEl.textContent = data.title;
    descEl.textContent = data.description;
}

function goToServiceDetailSlide(modal, index) {
    const slides = modal.querySelectorAll('.service-detail-carousel__slide');
    if (!slides.length) return;
    const i = index < 0 ? 0 : index >= slides.length ? slides.length - 1 : index;
    slides.forEach((s, k) => s.setAttribute('aria-hidden', k !== i));
}

function startServiceDetailCarousel(modal) {
    stopServiceDetailCarousel();
    serviceDetailCarouselInterval = setInterval(() => {
        const slides = modal.querySelectorAll('.service-detail-carousel__slide');
        const current = modal.querySelector('.service-detail-carousel__slide[aria-hidden="false"]');
        if (!slides.length) return;
        const idx = Array.from(slides).indexOf(current);
        const next = (idx + 1) % slides.length;
        goToServiceDetailSlide(modal, next);
    }, 3000);
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
    const data = ADDITIONAL_SERVICES_DATA[serviceId];
    if (!data) return;
    buildServiceDetailModalContent(modal, data);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startServiceDetailCarousel(modal);
    modal.querySelector('.modal-close').focus();
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

    modal.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', () => closeServiceDetailModal());
    });

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