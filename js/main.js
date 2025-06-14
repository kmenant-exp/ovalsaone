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
    // Effet de défilement smooth et indicateur de navigation amélioré
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Effet de réduction de la barre de navigation
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Mise en évidence du lien actif basé sur la section visible
            // (uniquement sur la page d'accueil où il y a plusieurs sections avec ID)
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                let currentSection = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.offsetHeight;
                    
                    if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute('id');
                    }
                });
                
                // Mettre à jour les liens de navigation
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(currentSection)) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // Active link management pour les autres pages
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage) || 
                (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }    // Effet parallax pour les sections
    setupParallax() {
        // Pour un vrai effet parallax, nous n'avons pas besoin de manipuler les images
        // Les images sont positionnées avec background-attachment: fixed en CSS
        // Le contenu défile naturellement par-dessus
        
        // Aucune manipulation JavaScript n'est nécessaire pour l'effet de base
        // Si nous avions besoin d'une personnalisation supplémentaire, nous pourrions l'ajouter ici

        // Désactivons tout code qui pourrait interférer avec l'effet parallax CSS
        const parallaxElements = document.querySelectorAll('.parallax-section');
        
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', () => {
                // Juste pour s'assurer que le z-index est correctement géré
                document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);
            });
        }
    }// Gestion du bandeau cookies RGPD
    setupCookieBanner() {
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('accept-cookies');
        const declineBtn = document.getElementById('decline-cookies');

        if (!cookieBanner) return;

        // Vérifier si l'utilisateur a déjà fait un choix
        const cookieConsent = localStorage.getItem('cookieConsent');
        
        if (!cookieConsent) {
            // Nous utilisons une technique qui ne décale pas la mise en page
            // Nous enlevons d'abord la classe 'hidden', puis nous laissons la CSS
            // gérer la transition d'apparition
            setTimeout(() => {
                cookieBanner.classList.remove('hidden');
                // Nous forçons un reflow pour que la transition s'active correctement
                void cookieBanner.offsetWidth;
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

    // Menu mobile avec animations améliorées
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLogo = document.querySelector('.nav-logo');
        
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Désactiver le scroll quand le menu est ouvert
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Fermer le menu quand on clique sur un lien
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
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
        
        // Charger les catégories d'âge depuis les données en cache si disponibles
        return window.categoriesData 
            ? this.getCategoryFromData(age) 
            : this.getDefaultCategory(age);
    }
    
    static getCategoryFromData(age) {
        const categories = window.categoriesData;
        for (const categorie of categories) {
            if (age >= categorie.age_min && age <= categorie.age_max) {
                return categorie.nom;
            }
        }
        return 'Senior';
    }
    
    static getDefaultCategory(age) {
        // Fallback sur les valeurs codées en dur
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
