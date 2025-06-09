// Main JavaScript file pour fonctionnalités communes

class RugbyClubApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupParallax();
        this.setupCookieBanner();
        this.setupScrollEffects();
        this.setupMobileMenu();
    }

    // Navigation sticky avec effet de réduction
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScrollY = currentScrollY;
        });

        // Active link management
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage) || 
                (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Effet parallax pour les sections
    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-image, .hero-image');
        
        if (parallaxElements.length === 0) return;

        const handleParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach(element => {
                const section = element.closest('.hero, .parallax-section');
                if (!section) return;

                const rect = section.getBoundingClientRect();
                const isVisible = rect.bottom >= 0 && rect.top <= window.innerHeight;

                if (isVisible) {
                    element.style.transform = `translate3d(0, ${rate}px, 0)`;
                }
            });
        };

        // Throttle pour améliorer les performances
        let ticking = false;
        const throttledParallax = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleParallax();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledParallax);
        handleParallax(); // Initial call
    }

    // Gestion du bandeau cookies RGPD
    setupCookieBanner() {
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('accept-cookies');
        const declineBtn = document.getElementById('decline-cookies');

        if (!cookieBanner) return;

        // Vérifier si l'utilisateur a déjà fait un choix
        const cookieConsent = localStorage.getItem('cookieConsent');
        
        if (!cookieConsent) {
            setTimeout(() => {
                cookieBanner.classList.remove('hidden');
            }, 2000);
        }

        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.add('hidden');
            this.enableTracking();
        });

        declineBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.add('hidden');
        });
    }

    enableTracking() {
        // Activer Google Analytics ou autres outils de tracking
        console.log('Tracking enabled');
        // Exemple : gtag('consent', 'update', {'analytics_storage': 'granted'});
    }

    // Effets d'animation au scroll
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observer les éléments à animer
        const animatedElements = document.querySelectorAll(
            '.actualite-card, .categorie-card, .contact-card, .form-card'
        );
        animatedElements.forEach(el => observer.observe(el));
    }

    // Menu mobile
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fermer le menu quand on clique sur un lien
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Utilitaires
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    static getAgeCategory(birthDate) {
        const age = this.calculateAge(birthDate);
        
        if (age < 6) return 'U6';
        if (age < 8) return 'U8';
        if (age < 10) return 'U10';
        if (age < 12) return 'U12';
        if (age < 14) return 'U14';
        return 'Senior';
    }
}

// Gestionnaire de formulaires
class FormHandler {
    constructor() {
        this.apiBaseUrl = '/api'; // Azure Function endpoint
    }

    async submitForm(formData, endpoint) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    validateForm(formElement) {
        const errors = [];
        const formData = new FormData(formElement);
        
        // Validation des champs requis
        const requiredFields = formElement.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                errors.push(`Le champ "${field.labels?.[0]?.textContent || field.name}" est requis`);
            }
        });

        // Validation email
        const emailField = formElement.querySelector('input[type="email"]');
        if (emailField && emailField.value && !this.validateEmail(emailField.value)) {
            errors.push('L\'adresse email n\'est pas valide');
        }

        // Validation téléphone
        const phoneField = formElement.querySelector('input[type="tel"]');
        if (phoneField && phoneField.value && !this.validatePhone(phoneField.value)) {
            errors.push('Le numéro de téléphone n\'est pas valide');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: Object.fromEntries(formData)
        };
    }

    showFormStatus(element, message, type) {
        element.className = `form-status ${type}`;
        element.textContent = message;
        element.classList.remove('hidden');

        // Auto-hide après 5 secondes pour les messages de succès
        if (type === 'success') {
            setTimeout(() => {
                element.classList.add('hidden');
            }, 5000);
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.dataset.originalText = button.textContent;
            button.textContent = 'Envoi en cours...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    window.rugbyApp = new RugbyClubApp();
    window.formHandler = new FormHandler();
});

// Export pour utilisation dans d'autres modules
window.RugbyClubApp = RugbyClubApp;
window.FormHandler = FormHandler;
