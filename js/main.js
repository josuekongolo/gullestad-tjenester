/**
 * Gullestad Tjenester ENK - Main JavaScript
 * Maler & Glassarbeid | Hokksund, Øvre Eiker
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const header = document.querySelector('.header');
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.querySelector('.form-message');

    // ==========================================================================
    // Mobile Navigation
    // ==========================================================================
    function initMobileNav() {
        if (!menuToggle || !mobileNav) return;

        menuToggle.addEventListener('click', function() {
            const isOpen = this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';

            // Update ARIA attributes
            this.setAttribute('aria-expanded', isOpen);
            mobileNav.setAttribute('aria-hidden', !isOpen);
        });

        // Close mobile nav when clicking a link
        const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav__link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile nav on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close mobile nav when resizing to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && mobileNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================================================
    // Header Scroll Effect
    // ==========================================================================
    function initHeaderScroll() {
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 10) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '';
            }

            // Hide/show header on scroll (optional - disabled by default)
            /*
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            */

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================================================
    // Contact Form Handling
    // ==========================================================================
    function initContactForm() {
        if (!contactForm) return;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sender...';

            // Gather form data
            const formData = {
                name: this.querySelector('#name').value.trim(),
                email: this.querySelector('#email').value.trim(),
                phone: this.querySelector('#phone').value.trim(),
                address: this.querySelector('#address')?.value.trim() || '',
                jobType: this.querySelector('#jobType').value,
                description: this.querySelector('#description').value.trim(),
                wantSiteVisit: this.querySelector('#siteVisit')?.checked || false
            };

            // Basic validation
            const errors = validateForm(formData);
            if (errors.length > 0) {
                showFormMessage('error', 'Vennligst fyll ut alle påkrevde felt:\n' + errors.join('\n'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }

            try {
                // Simulate form submission (replace with actual API call)
                await simulateFormSubmission(formData);

                // Show success message
                showFormMessage('success', 'Takk for din henvendelse! Vi tar kontakt så snart som mulig.');

                // Reset form
                contactForm.reset();

            } catch (error) {
                console.error('Form submission error:', error);
                showFormMessage('error', 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        // Real-time validation feedback
        const requiredInputs = contactForm.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('invalid')) {
                    validateInput(this);
                }
            });
        });
    }

    function validateForm(data) {
        const errors = [];

        if (!data.name) errors.push('• Navn er påkrevd');
        if (!data.email) {
            errors.push('• E-post er påkrevd');
        } else if (!isValidEmail(data.email)) {
            errors.push('• Ugyldig e-postadresse');
        }
        if (!data.phone) {
            errors.push('• Telefon er påkrevd');
        } else if (!isValidPhone(data.phone)) {
            errors.push('• Ugyldig telefonnummer');
        }
        if (!data.jobType) errors.push('• Velg type jobb');
        if (!data.description) errors.push('• Beskriv jobben');

        return errors;
    }

    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;

        if (input.required && !value) {
            isValid = false;
        } else if (input.type === 'email' && value && !isValidEmail(value)) {
            isValid = false;
        } else if (input.id === 'phone' && value && !isValidPhone(value)) {
            isValid = false;
        }

        input.classList.toggle('invalid', !isValid);
        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        // Norwegian phone number validation (8 digits, optionally with spaces or country code)
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^(\+47)?[2-9]\d{7}$/.test(cleaned);
    }

    function showFormMessage(type, message) {
        if (!formMessage) return;

        formMessage.className = 'form-message form-message--' + type + ' active';
        formMessage.innerHTML = message.replace(/\n/g, '<br>');
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-hide success message after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.classList.remove('active');
            }, 10000);
        }
    }

    async function simulateFormSubmission(data) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Log form data (for development)
                console.log('Form submission:', data);

                // Simulate success (90% of the time) or failure
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 1500);
        });
    }

    // ==========================================================================
    // Intersection Observer for Animations
    // ==========================================================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // ==========================================================================
    // Click-to-Call on Mobile
    // ==========================================================================
    function initClickToCall() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Track phone click (for analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'contact',
                        event_label: 'phone_call'
                    });
                }
            });
        });
    }

    // ==========================================================================
    // Lazy Loading Images
    // ==========================================================================
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback for older browsers
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        lazyObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                lazyObserver.observe(img);
            });
        }
    }

    // ==========================================================================
    // Current Year in Footer
    // ==========================================================================
    function initCurrentYear() {
        const yearElements = document.querySelectorAll('[data-current-year]');
        const currentYear = new Date().getFullYear();

        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    // ==========================================================================
    // Active Navigation Link
    // ==========================================================================
    function initActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
                link.classList.add('nav__link--active', 'mobile-nav__link--active');
            }
        });
    }

    // ==========================================================================
    // Service Cards Hover Effect Enhancement
    // ==========================================================================
    function initServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');

        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // ==========================================================================
    // Form Input Styling
    // ==========================================================================
    function initFormInputs() {
        const inputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

        inputs.forEach(input => {
            // Add filled class when input has value
            input.addEventListener('change', function() {
                this.classList.toggle('filled', this.value.trim() !== '');
            });

            // Check on page load
            if (input.value.trim() !== '') {
                input.classList.add('filled');
            }
        });
    }

    // ==========================================================================
    // Scroll to Top Button (Optional)
    // ==========================================================================
    function initScrollToTop() {
        const scrollTopBtn = document.querySelector('.scroll-to-top');
        if (!scrollTopBtn) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================================================
    // Initialize All Functions
    // ==========================================================================
    function init() {
        initMobileNav();
        initHeaderScroll();
        initSmoothScroll();
        initContactForm();
        initScrollAnimations();
        initClickToCall();
        initLazyLoading();
        initCurrentYear();
        initActiveNavLink();
        initServiceCards();
        initFormInputs();
        initScrollToTop();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==========================================================================
    // Export for external use (if needed)
    // ==========================================================================
    window.GullestadTjenester = {
        showFormMessage: showFormMessage,
        validateForm: validateForm
    };

})();
