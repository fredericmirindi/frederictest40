// Academic website JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const pages = document.querySelectorAll('.page');
    const contactForm = document.querySelector('.contact-form');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Page navigation
    function showPage(targetPage) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetElement = document.getElementById(targetPage);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Update active navigation link
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${targetPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Close mobile menu if open
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Update URL hash
        window.location.hash = targetPage;
    }

    // Navigation link click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
        });
    });

    // Handle hero action buttons
    const heroButtons = document.querySelectorAll('.hero__actions .btn[data-page]');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        }
    });

    // Initialize page based on URL hash
    function initializePage() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showPage(hash);
        } else {
            showPage('home');
        }
    }

    // Contact form handling
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Validate form
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                showNotification('Thank you for your message! I will get back to you soon.', 'success');
                contactForm.reset();
                
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <p>${message}</p>
                <button class="notification__close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1001;
            background: ${type === 'error' ? 'var(--color-error)' : 'var(--color-success)'};
            color: white;
            padding: var(--space-16);
            border-radius: var(--radius-base);
            box-shadow: var(--shadow-lg);
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .notification__content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-12);
                }
                .notification__close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: var(--font-size-xl);
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Close button functionality
        const closeButton = notification.querySelector('.notification__close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Smooth scroll for anchor links
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && targetElement.classList.contains('page')) {
                e.preventDefault();
                showPage(targetId);
            }
        }
    });

    // Add hover effects to cards
    function addCardHoverEffects() {
        const cards = document.querySelectorAll('.achievement-card, .research-card, .course-card, .publication-item, .conference-item');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // Initialize card hover effects
    addCardHoverEffects();

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            const keyMap = {
                '1': 'home',
                '2': 'about', 
                '3': 'research',
                '4': 'publications',
                '5': 'conferences',
                '6': 'teaching',
                '7': 'blog',
                '8': 'contact'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                showPage(keyMap[e.key]);
            }
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Initialize the page
    initializePage();

    // Add loading animation
    function showLoadingAnimation() {
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.3s ease-in-out';
            document.body.style.opacity = '1';
        }, 100);
    }

    // Show loading animation
    showLoadingAnimation();

    // Add scroll-to-top functionality for long pages
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 500) {
            if (!document.querySelector('.scroll-to-top')) {
                const scrollButton = document.createElement('button');
                scrollButton.className = 'scroll-to-top';
                scrollButton.innerHTML = '↑';
                scrollButton.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    cursor: pointer;
                    z-index: 1000;
                    font-size: var(--font-size-xl);
                    box-shadow: var(--shadow-lg);
                    transition: all var(--duration-normal) var(--ease-standard);
                `;
                
                scrollButton.addEventListener('click', () => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
                
                document.body.appendChild(scrollButton);
            }
        } else {
            const scrollButton = document.querySelector('.scroll-to-top');
            if (scrollButton) {
                scrollButton.remove();
            }
        }
    });

    console.log('Academic website initialized successfully!');
});