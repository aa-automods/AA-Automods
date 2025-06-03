function createStarHeadliner() {
    const container = document.getElementById("light-particles");
    container.innerHTML = ""; // Clear any existing particles
    container.style.backgroundColor = "#000814";

    // Calculate responsive particle count based on screen size
    const isMobile = window.innerWidth < 768;
    const baseParticleCount = isMobile ? 1000 : 1250;
    const screenArea = window.innerWidth * window.innerHeight;
    const baseArea = 1920 * 1080; // Base for full HD screens
    const densityFactor = Math.min(1.5, Math.sqrt(screenArea / baseArea)); // Square root for better scaling
    const particleCount = Math.floor(baseParticleCount * densityFactor);

    // Create different types of stars with responsive counts
    const starTypes = [{
            size: [1, 2],
            count: Math.floor(0.7 * particleCount), // 70% of particles
            blur: 0,
            opacity: [0.4, 0.8],
            color: "white"
        },
        {
            size: [2, 3],
            count: Math.floor(0.17 * particleCount), // 20% of particles
            blur: 0.5,
            opacity: [0.6, 1],
            color: "white"
        },
        {
            size: [3, 5],
            count: Math.floor(0.06 * particleCount), // 6% of particles
            blur: 1,
            opacity: [0.7, 1],
            color: "white"
        },
        {
            size: [2, 3],
            count: Math.floor(0.7 * particleCount), // 7% of particles
            blur: 0.5,
            opacity: [0.8, 1],
            color: "#8bcdff"
        },
    ];

    // Track total particles to create
    let totalCreated = 0;

    // Create each type of star
    starTypes.forEach((type) => {
        for (let i = 0; i < type.count && totalCreated < particleCount; i++) {
            const star = document.createElement("div");
            star.classList.add("star-particle");

            // Random size within range
            const size = Math.random() * (type.size[1] - type.size[0]) + type.size[0];
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // Random position - ensure good distribution
            const posX = Math.random() * 98 + 1; // 1-99% (avoid edges)
            const posY = Math.random() * 98 + 1; // 1-99% (avoid edges)
            star.style.left = `${posX}%`;
            star.style.top = `${posY}%`;

            // Apply star styles
            star.style.position = "absolute";
            star.style.borderRadius = "50%";
            star.style.backgroundColor = type.color;
            star.style.filter = `blur(${type.blur}px)`;

            // Random opacity within range
            const opacity = Math.random() * (type.opacity[1] - type.opacity[0]) + type.opacity[0];
            star.style.opacity = opacity;

            // Star twinkling effect
            const twinkleDelay = Math.random() * 10; // Random start time
            const twinkleDuration = Math.random() * 3 + 2; // 2-5 seconds
            star.style.animation = `twinkle ${twinkleDuration}s ease-in-out ${twinkleDelay}s infinite`;

            // Add star to container
            container.appendChild(star);
            totalCreated++;
        }
    });

    // Adjust shooting star frequency for mobile
    const shootingStarInterval = isMobile ? 10000 : 6000;
    setInterval(createShootingStar, shootingStarInterval);

    // Add CSS for animations if needed
    if (!document.getElementById("star-styles")) {
        const styleSheet = document.createElement("style");
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
        document.head.appendChild(styleSheet);
    }
}

function createShootingStar() {
    const container = document.getElementById("light-particles");
    const shootingStar = document.createElement("div");
    shootingStar.classList.add("shooting-star");

    // Start from random position at top portion of container
    const startX = Math.random() * 80 + 20; // 20-100%
    const startY = Math.random() * 30; // 0-30%

    shootingStar.style.left = `${startX}%`;
    shootingStar.style.top = `${startY}%`;

    // Randomize shooting star properties
    const length = Math.random() * 30 + 20; // Length of trail
    shootingStar.style.width = `${length}px`;
    shootingStar.style.height = "2px";

    // Random animation duration (faster = more dramatic)
    const duration = Math.random() * 0.3 + 1; // 0.3-1s
    shootingStar.style.animation = `shoot ${duration}s linear forwards`;

    // Add to container and remove when animation complete
    container.appendChild(shootingStar);
    setTimeout(() => {
        shootingStar.remove();
    }, duration * 1000);
}

// Add required CSS
function addHeadlinerStyles() {
    const style = document.createElement("style");
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
    document.head.appendChild(style);
}

// Initialize
function initStarHeadliner() {
    addHeadlinerStyles();
    createStarHeadliner();
}

// Create floating effect for background
function animateBackground() {
    const background = document.querySelector(".animated-background");

    setInterval(() => {
        const xPos = Math.random() * 10 - 5;
        const yPos = Math.random() * 10 - 5;

        background.style.transform = `translate(${xPos}px, ${yPos}px)`;
        background.style.transition = "transform 8s ease-in-out";
    }, 8000);
}

// Header scroll effect
function handleHeaderScroll() {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.padding = "0.8rem 0";
            header.style.background = "rgba(18, 18, 18, 0.95)";
        } else {
            header.style.padding = "1.5rem 0";
            header.style.background = "rgba(18, 18, 18, 0.9)";
        }
    });
}

// Mobile navigation
function setupMobileNav() {
    const navToggle = document.getElementById("nav-toggle");
    const closeNav = document.getElementById("close-nav");
    const nav = document.getElementById("main-nav");
    const navLinks = nav.querySelectorAll("a");

    navToggle.addEventListener("click", () => {
        nav.classList.add("active");
    });

    closeNav.addEventListener("click", () => {
        nav.classList.remove("active");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    });
}
// Handle initial hash if present in URL
function handleInitialHash() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                scroll.scrollTo(target, {
                    offset: -100,
                    duration: 0
                });
            }, 100);
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    initStarHeadliner();
    animateBackground();
    handleHeaderScroll();
    setupMobileNav();
    handleInitialHash();

    // Animate services cards and gallery items on scroll
    const animatedElements = document.querySelectorAll(
        ".service-card, .gallery-item",
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 150);
                }
            });
        }, { threshold: 0.1 },
    );

    animatedElements.forEach((element) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "opacity 0.6s, transform 0.6s";
        observer.observe(element);
    });
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                lazyImageObserver.unobserve(lazyImage);
            }
        });
    }, { rootMargin: "200px 0px" }); // Start loading 200px before entering viewport

    lazyImages.forEach((lazyImage) => {
        if (lazyImage.dataset.src) {
            lazyImageObserver.observe(lazyImage);
        }
    });

});

document.addEventListener("DOMContentLoaded", () => {
    // Get modal elements
    const modal = document.getElementById("consultation-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const consultationForm = document.getElementById("consultation-form");
    const formSuccess = document.getElementById("form-success");
    const closeSuccessBtn = document.querySelector(".close-success");

    // Get all CTA buttons
    const ctaButtons = document.querySelectorAll(".cta-button");

    // Open modal when CTA is clicked
    ctaButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            openModal();
            // Add shimmer animation
            const modalContent = document.querySelector('.modal-content');
            modalContent.classList.add('animate-shimmer');
            // Remove class after animation completes
            setTimeout(() => {
                modalContent.classList.remove('animate-shimmer');
            }, 800);
        });
    });

    // Close modal when clicking close button or outside
    closeModalBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close success message
    closeSuccessBtn.addEventListener("click", () => {
        closeModal();
        // Reset the form view after closing
        setTimeout(() => {
            formSuccess.classList.add("hidden");
            consultationForm.style.display = "block";
        }, 300);
    });


    // Handle form submission
    consultationForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form values
        const formData = new FormData(consultationForm);

        // Make sure the form data is submitted to Formspree
        fetch("https://formsubmit.co/ajax/anthonywalcott31@gmail.com", {
                // Replace with your FormSubmit endpoint
                method: "POST",
                body: formData,
            })
            .then((response) => response.json())
            .then((data) => {
                // Show success message
                consultationForm.style.display = "none";
                formSuccess.classList.remove("hidden");

                // Reset form for next time
                consultationForm.reset();

                // Optionally, log the response from Formspree
                console.log("Form submitted successfully:", data);
            })
            .catch((error) => {
                // Handle any errors that occur during the form submission
                console.error("Form submission error:", error);
                // Optionally show an error message
            });

        // Disable the submit button and show loading text
        const sendButton = document.querySelector(".submit-button");
        sendButton.textContent = "Sending...";
        sendButton.disabled = true;
    });

    // Functions to open and close modal
    function openModal() {
        const modal = document.getElementById("consultation-modal");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        // Reset form view if coming from success message
        const formSuccess = document.getElementById("form-success");
        const consultationForm = document.getElementById("consultation-form");
        formSuccess.classList.add("hidden");
        consultationForm.style.display = "block";

        // Focus on first input for better mobile UX
        setTimeout(() => {
            const firstInput = consultationForm.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    function closeModal() {
        modal.classList.remove("show");
        document.body.style.overflow = ""; // Restore scrolling
    }
});

// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const consultationModal = document.getElementById('consultation-modal');
    const closeModalButton = consultationModal.querySelector('.close-modal');

    // Close modal when "X" is clicked
    closeModalButton.addEventListener('click', () => {
        const modal = document.getElementById("consultation-modal");
        modal.classList.remove("show");
        document.body.style.overflow = ""; // Restore scrolling
    });

    // Open modal function
    window.openConsultationModal = () => {
        openModal();
    };
});

document.addEventListener("DOMContentLoaded", () => {
    window.openPricingModal = function(serviceId) {
        const pricingModal = document.getElementById("pricing-modal");
        const pricingTitle = document.getElementById("pricing-title");
        const pricingContents = document.querySelectorAll(".pricing-content");

        // Hide all pricing content first
        pricingContents.forEach(content => {
            content.classList.remove("active");
        });

        // Show the selected service pricing
        const selectedPricing = document.getElementById(`${serviceId}-pricing`);
        if (selectedPricing) {
            selectedPricing.classList.add("active");

            // Update modal title based on service
            const serviceTitle = selectedPricing.querySelector("h3").textContent;
            pricingTitle.textContent = `${serviceTitle} Pricing`;
        }

        // Close the sale modal first
        const saleModal = document.getElementById("sale-modal");
        saleModal.classList.remove("show");

        // Show the pricing modal
        setTimeout(() => {
            pricingModal.classList.add("show");
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }, 300); // Small delay for better transition
    };

    // Sale Modal Functionality
    const saleModal = document.getElementById("sale-modal");
    const viewOffersBtn = document.getElementById("view-offers-btn");
    const closeSaleModal = saleModal.querySelector(".close-modal");

    // Open sale modal
    viewOffersBtn.addEventListener("click", () => {
        saleModal.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    // Close sale modal
    closeSaleModal.addEventListener("click", () => {
        saleModal.classList.remove("show");
        document.body.style.overflow = "";
    });

    // Close when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === saleModal) {
            saleModal.classList.remove("show");
            document.body.style.overflow = "";
        }
    });
    // Get all "Learn more" buttons
    const serviceLinks = document.querySelectorAll(".service-link");

    // Get modal elements
    const pricingModal = document.getElementById("pricing-modal");
    const closePricingBtn = pricingModal.querySelector(".close-modal");
    const pricingTitle = document.getElementById("pricing-title");
    const pricingContents = document.querySelectorAll(".pricing-content");

    // Function to open pricing modal with specific service
    function openPricingModal(serviceId) {
        // Hide all pricing content first
        pricingContents.forEach((content) => {
            content.classList.remove("active");
        });

        // Show the selected service pricing
        const selectedPricing = document.getElementById(`${serviceId}-pricing`);
        if (selectedPricing) {
            selectedPricing.classList.add("active");

            // Update modal title based on service
            const serviceTitle = selectedPricing.querySelector("h3").textContent;
            pricingTitle.textContent = `${serviceTitle} Pricing`;
        }

        // Show the modal
        pricingModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Add click event to each "Learn more" button
    serviceLinks.forEach((link, index) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            // Get the service name from the h3 text in the parent card
            const serviceCard = link.closest(".service-card");
            const serviceTitle = serviceCard.querySelector("h3").textContent;

            // Convert service title to ID format (lowercase, hyphenated)
            const serviceId = serviceTitle.toLowerCase().replace(/\s+/g, "-");

            // Open the pricing modal for this service
            openPricingModal(serviceId);
        });
    });

    // Close modal when clicking close button or outside
    closePricingBtn.addEventListener("click", closePricingModal);
    pricingModal.addEventListener("click", (e) => {
        if (e.target === pricingModal) {
            closePricingModal();
        }
    });

    // Function to close pricing modal
    function closePricingModal() {
        pricingModal.classList.remove("show");
        document.body.style.overflow = ""; // Restore scrolling
    }

    // Function to open consultation modal from pricing
    window.openConsultationModal = function() {
        // Close the pricing modal first
        closePricingModal();

        // Then open the consultation modal
        setTimeout(() => {
            const consultationModal = document.getElementById("consultation-modal");
            consultationModal.classList.add("show");
            document.body.style.overflow = "hidden";
        }, 300); // Small delay for better transition
    };
});

// Gallery Slideshow Functionality
// Gallery Slideshow Functionality
// Gallery Slideshow Functionality
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const thumbnails = document.querySelectorAll(".thumbnail");
let isAnimating = false;

// Initialize the gallery
showSlide(slideIndex);

// Add event listeners to thumbnails once
thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
        if (index !== slideIndex && !isAnimating) {
            isAnimating = true;

            // Pause current video
            const currentVideos = slides[slideIndex].querySelectorAll('video');
            currentVideos.forEach(video => video.pause());

            slides[slideIndex].classList.add("slide-out");

            setTimeout(() => {
                slides[slideIndex].classList.remove("active-slide", "slide-out");
                showSlide(index);
                isAnimating = false;
            }, 500);
        }
    });
});

function changeSlide(n) {
    if (isAnimating) return;
    isAnimating = true;

    // Pause current video
    const currentVideos = slides[slideIndex].querySelectorAll('video');
    currentVideos.forEach(video => video.pause());

    const newIndex = (slideIndex + n + slides.length) % slides.length;
    slides[slideIndex].classList.add("slide-out");

    setTimeout(() => {
        slides[slideIndex].classList.remove("active-slide", "slide-out");
        showSlide(newIndex);
        isAnimating = false;
    }, 500);
}

function showSlide(n) {
    // Update all slides and thumbnails
    slides.forEach((slide, index) => {
        slide.classList.remove("active-slide", "slide-out");
        const videos = slide.querySelectorAll('video');
        videos.forEach(video => {
            if (index === n) {
                video.play().catch(e => console.log("Video autoplay prevented:", e));
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    });

    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle("active", index === n);
    });

    // Activate new slide
    slides[n].classList.add("active-slide");
    slideIndex = n;
}

document.querySelectorAll(".services .service-card").forEach((card) => {
    const images = card.querySelector(".service-images");
    const prevBtn = card.querySelector(".prev");
    const nextBtn = card.querySelector(".next");
    const dots = card.querySelectorAll(".image-dot");
    let currentIndex = 0;
    const mediaItems = images.querySelectorAll("img, video"); // Get both images and videos

    function updateImages() {
        images.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });

        // Pause all videos except the current one
        mediaItems.forEach((item, index) => {
            if (item.tagName === 'VIDEO') {
                if (index === currentIndex) {
                    item.play().catch(e => console.log("Video autoplay prevented:", e));
                } else {
                    item.pause();
                    item.currentTime = 0; // Reset to start
                }
            }
        });
    }

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        updateImages();
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % mediaItems.length;
        updateImages();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateImages();
        });
    });

    // Initialize by playing the first video if it exists
    const firstVideo = mediaItems[0];
    if (firstVideo && firstVideo.tagName === 'VIDEO') {
        firstVideo.play().catch(e => console.log("Video autoplay prevented:", e));
    }
});


window.addEventListener('resize', fixViewport);
fixViewport();
// Smooth Scroll Implementation
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Locomotive Scroll
    // Initialize Locomotive Scroll
    const scroll = new LocomotiveScroll({
        el: document.querySelector("[data-scroll-container]"),
        smooth: true,
        multiplier: 0.6,
        smartphone: {
            smooth: true, // Changed to true for smoother mobile experience
        },
        tablet: {
            smooth: true, // Changed to true for smoother tablet experience
        },
        getDirection: true,
        getSpeed: true,
        inertia: 0.7, // Increased for smoother deceleration
        lerp: 0.1, // Added for smoother animations
        touchMultiplier: 1.5, // Added for better touch response
        firefoxMultiplier: 50, // Added for better Firefox performance
    });

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                scroll.scrollTo(target, {
                    offset: -100, // Account for header
                    duration: 1000
                });

                // Close mobile menu if open
                const nav = document.getElementById("main-nav");
                nav.classList.remove("active");
            }
        });
    });
    // Optional: Update scroll on window resize
    window.addEventListener("resize", () => {
        scroll.update();
    });

    function ScrollUpdateDelay() {
        setTimeout(function() { scroll.update(); }, 500);

    }

    ScrollUpdateDelay();

    // Add this near your scroll-related code
    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            const context = this,
                args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    window.addEventListener('scroll', debounce(() => {
        // Your scroll-related code here
    }));
});

if (document.getElementById('paypal-button-container')) {
    paypal.Buttons({
        style: {
            color: 'blue',
            shape: 'pill',
            label: 'pay',
            height: 40
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: "Deposit Payment",
                    amount: {
                        value: '100.00' // Change to your deposit amount
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Redirect after successful payment
                window.location.href = "https://yourdomain.com/thank-you"; // Customize this
            });
        },
        onCancel: function(data) {
            alert('Payment cancelled.');
        },
        onError: function(err) {
            console.error('PayPal Checkout error', err);
            alert('An error occurred with PayPal Checkout.');
        }
    }).render('#paypal-button-container');
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}