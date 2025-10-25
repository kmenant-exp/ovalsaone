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
        this.setupActualitesToggle(); // Ajouter la gestion du bouton "Voir plus"
        this.setupActualiteModal(); // Ajouter la gestion de la modal des actualités
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
        });

    // Effet parallax pour les sections
    }
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
        } else if (cookieConsent === 'accepted') {
            // Activer le tracking si l'utilisateur a déjà accepté
            this.enableTracking();
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
        // Activer Microsoft Clarity
        window.clarity('consent');
    }

    // Gestion du défilement et effets visuels
    setupScrollEffects() {
        // Éléments à animer lors du défilement
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in');
        
        // Indicateur de défilement (scroll-indicator)
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        if (scrollIndicator) {
            // Masquer l'indicateur de défilement au scroll
            window.addEventListener('scroll', () => {
                if (window.scrollY > 200) {
                    scrollIndicator.style.opacity = '0';
                    scrollIndicator.style.pointerEvents = 'none';
                } else {
                    scrollIndicator.style.opacity = '0.7';
                    scrollIndicator.style.pointerEvents = 'auto';
                }
            });
            
            // Scroll vers le bas en cliquant sur l'indicateur
            scrollIndicator.addEventListener('click', () => {
                const actualitesSection = document.querySelector('.actualites');
                if (actualitesSection) {
                    actualitesSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        if (animatedElements.length > 0) {
            // Observer les éléments qui entrent dans le viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Une fois visible, on n'a plus besoin d'observer l'élément
                        observer.unobserve(entry.target);
                    }
                });
            }, { 
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }

    // Menu mobile avec animations améliorées
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const menuOverlay = document.getElementById('menu-overlay');
        const navbar = document.getElementById('navbar');
        const root = document.documentElement;
        
        if (!navToggle || !navMenu) return;

        const getSpacingFallback = () => {
            const spacing = getComputedStyle(root).getPropertyValue('--spacing-6');
            return spacing && spacing.trim().length > 0 ? spacing.trim() : '24px';
        };

        const updateNavOffset = () => {
            if (!navMenu.classList.contains('active')) {
                root.style.setProperty('--nav-offset', '0px');
                root.style.setProperty('--nav-offset-inner', '0px');
                return;
            }

            const offsetBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
            const safeOffset = Math.max(offsetBottom, 0);
            root.style.setProperty('--nav-offset', `${safeOffset}px`);
            root.style.setProperty('--nav-offset-inner', getSpacingFallback());
        };

        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            if (menuOverlay) menuOverlay.classList.toggle('active');
            updateNavOffset();
            
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
                if (menuOverlay) menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
                updateNavOffset();
            });
        });

        // Fermer le menu quand on clique sur l'overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
                updateNavOffset();
            });
        }

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && !navMenu.contains(e.target.parentElement)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (menuOverlay) menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
                updateNavOffset();
            }
        });

        window.addEventListener('resize', () => {
            if (navMenu.classList.contains('active')) {
                updateNavOffset();
            }
        });

        window.addEventListener('scroll', () => {
            if (navMenu.classList.contains('active')) {
                updateNavOffset();
            }
        });
    }

    // Gestion du bouton "Voir plus" pour les actualités
    setupActualitesToggle() {
        const btnVoirPlus = document.getElementById('btn-voir-plus');
        const actualitesSupplementaires = document.getElementById('actualites-supplementaires');
        
        if (!btnVoirPlus || !actualitesSupplementaires) return;
        
        let isExpanded = false;
        
        btnVoirPlus.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                // Afficher les actualités supplémentaires
                actualitesSupplementaires.style.display = 'grid';
                setTimeout(() => {
                    actualitesSupplementaires.classList.add('show');
                }, 10);
                
                // Mettre à jour le bouton
                btnVoirPlus.classList.add('expanded');
                btnVoirPlus.querySelector('.btn-text').textContent = 'Voir moins d\'actualités';
                
                // Scroll smooth vers les nouvelles actualités
                setTimeout(() => {
                    actualitesSupplementaires.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 300);
                
            } else {
                // Masquer les actualités supplémentaires
                actualitesSupplementaires.classList.remove('show');
                setTimeout(() => {
                    actualitesSupplementaires.style.display = 'none';
                }, 500);
                
                // Mettre à jour le bouton
                btnVoirPlus.classList.remove('expanded');
                btnVoirPlus.querySelector('.btn-text').textContent = 'Voir plus d\'actualités';
                
                // Scroll vers le début de la section actualités
                const actualitesSection = document.querySelector('.actualites');
                if (actualitesSection) {
                    actualitesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // Gestion de la modal des actualités
    setupActualiteModal() {
        const modal = document.getElementById('actualite-modal');
        const modalTitre = document.getElementById('modal-titre');
        const modalImage = document.getElementById('modal-image');
        const modalDateBadge = document.getElementById('modal-date-badge');
        const modalDate = document.querySelector('#modal-date span');
        const modalContenu = document.getElementById('modal-contenu');
        const modalClose = document.getElementById('modal-close');
        
        if (!modal) return;
        
        // Fonction pour ouvrir la modal
        const openModal = (actualiteData) => {
            modalTitre.textContent = actualiteData.titre;
            modalImage.src = actualiteData.image;
            modalImage.alt = actualiteData.titre;
            modalDateBadge.textContent = actualiteData.date;
            modalDate.textContent = actualiteData.date;
            modalContenu.textContent = actualiteData.contenu;
            
            // Afficher la modal avec animation
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll en arrière-plan
        };
        
        // Fonction pour fermer la modal
        const closeModal = () => {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restaurer le scroll
        };
        
        // Gestionnaires d'événements pour les boutons "Lire la suite"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-lire-suite')) {
                e.preventDefault();
                
                const actualiteData = {
                    id: e.target.dataset.actualiteId,
                    titre: e.target.dataset.actualiteTitre,
                    date: e.target.dataset.actualiteDate,
                    image: e.target.dataset.actualiteImage,
                    contenu: e.target.dataset.actualiteContenu
                };
                
                openModal(actualiteData);
            }
        });
        
        // Fermeture par le bouton X
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        // Fermeture par clic sur l'overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Fermeture par la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
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
