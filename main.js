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