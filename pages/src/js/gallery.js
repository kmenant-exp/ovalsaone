/**
 * Gestion de la galerie photos sur la page d'accueil
 * Avec intégration Azure Storage Account
 */

// Données de la galerie (chargées depuis gallery.json via Eleventy)
let galleryPhotos = [];
let currentPhotoIndex = 0;
let currentFilter = 'all';
let currentAlbumImages = []; // Images du dossier Azure Storage actuel
let currentAlbumIndex = 0;
let carouselTrack = null;
let carouselContainer = null;
let carouselAnimationTimeout = null;
let isCarouselAnimating = false;
let galleryModalElement = null;
let galleryModalContainer = null;
let fullscreenButton = null;
let isFullscreenEventsBound = false;

const CAROUSEL_TRANSITION_MS = 450;

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});

/**
 * Initialise la galerie
 */
function initGallery() {
    // Récupère toutes les photos de la galerie
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryItems.length === 0) {
        return;
    }
    
    galleryPhotos = Array.from(galleryItems).map((item, index) => {
        const btn = item.querySelector('.gallery-view-btn');
        if (!btn) {
            return null;
        }
        
        return {
            index: index,
            titre: btn.dataset.photoTitre,
            description: btn.dataset.photoDescription,
            date: btn.dataset.photoDate,
            mainImage: btn.dataset.photoMainImage,
            storageUrl: btn.dataset.photoStorageUrl,
            alt: btn.dataset.photoAlt,
            categorie: item.dataset.category
        };
    }).filter(p => p !== null);
    
    // Gestion des filtres
    setupFilters();
    
    // Gestion de l'ouverture du lightbox
    setupLightbox();
    
    // Gestion du bouton "Voir plus"
    setupLoadMore();
}

/**
 * Configure les filtres de catégories
 */
function setupFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retire la classe active de tous les boutons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Ajoute la classe active au bouton cliqué
            this.classList.add('active');
            
            // Récupère le filtre
            const filter = this.dataset.filter;
            currentFilter = filter;
            
            // Applique le filtre
            filterGallery(filter);
        });
    });
}

/**
 * Filtre la galerie par catégorie
 */
function filterGallery(category) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        const itemCategory = item.dataset.category;
        
        if (category === 'all' || itemCategory === category) {
            // Affiche l'élément avec animation
            item.style.display = 'block';
            setTimeout(() => {
                item.classList.add('fade-in-up');
            }, index * 50);
        } else {
            // Cache l'élément
            item.style.display = 'none';
        }
    });
}

/**
 * Configure le lightbox (modal de visualisation)
 */
function setupLightbox() {
    const modal = document.getElementById('gallery-modal');
    const closeBtn = document.getElementById('gallery-modal-close');
    const prevBtn = document.getElementById('gallery-modal-prev');
    const nextBtn = document.getElementById('gallery-modal-next');
    const fullscreenBtn = document.getElementById('gallery-modal-fullscreen');
    carouselTrack = document.getElementById('gallery-carousel-track');
    carouselContainer = modal ? modal.querySelector('.gallery-carousel') : null;
    galleryModalElement = modal;
    galleryModalContainer = modal ? modal.querySelector('.gallery-modal-container') : null;
    fullscreenButton = fullscreenBtn;
    updateFullscreenButton(false);
    
    if (!isFullscreenEventsBound) {
        ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(eventName => {
            document.addEventListener(eventName, handleFullscreenChange);
        });
        isFullscreenEventsBound = true;
    }
    
    // Ouvre le lightbox au clic sur une photo
    document.querySelectorAll('.gallery-view-btn').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentPhotoIndex = index;
            openLightboxWithAlbum(index);
        });
    });
    
    // Ouvre le lightbox au clic sur l'image elle-même
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', function(e) {
            // Évite de déclencher si on clique sur le bouton
            if (e.target.closest('.gallery-view-btn')) {
                return;
            }
            currentPhotoIndex = index;
            openLightboxWithAlbum(index);
        });
    });
    
    // Ferme le lightbox
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleGalleryFullscreen();
        });
    }
    
    // Navigation précédent/suivant
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showPrevAlbumPhoto();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextAlbumPhoto();
        });
    }
    
    // Ferme au clic sur l'overlay
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeLightbox();
            }
        });
    }
    
    // Navigation au clavier
    document.addEventListener('keydown', function(e) {
        if (!modal || !modal.classList.contains('active')) return;
        const tagName = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
            return;
        }

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevAlbumPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextAlbumPhoto();
        } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleGalleryFullscreen();
        }
    });
    
    // Gestion des gestes tactiles (swipe) pour mobile
    setupTouchGestures(modal);
}

/**
 * Configure les gestes tactiles pour la navigation dans le lightbox
 */
function setupTouchGestures(modal) {
    if (!modal) return;
    
    const carousel = modal.querySelector('.gallery-carousel');
    if (!carousel || !carouselTrack) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let deltaX = 0;
    let touchEndY = 0;
    let isDragging = false;
    let basePercent = 0;
    
    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;

    const resetPosition = () => {
        updateCarouselPosition({ animate: false });
    };
    
    carousel.addEventListener('touchstart', (e) => {
        if (e.target.closest('.gallery-modal-nav')) {
            return;
        }
        if (isCarouselAnimating) return;

        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        touchEndY = touchStartY;
        deltaX = 0;
        isDragging = true;
        basePercent = -currentAlbumIndex * 100;
        carouselTrack.style.transition = 'none';
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.changedTouches[0].clientX;
        const currentY = e.changedTouches[0].clientY;
        deltaX = currentX - touchStartX;
        touchEndY = currentY;
        const deltaY = Math.abs(currentY - touchStartY);
        
        if (Math.abs(deltaX) > deltaY) {
            e.preventDefault();
            const containerWidth = carousel.offsetWidth || 1;
            const offsetPercent = (deltaX / containerWidth) * 100;
            const clampedOffset = Math.max(Math.min(offsetPercent, 30), -30);
            carouselTrack.style.transform = `translateX(${basePercent + clampedOffset}%)`;
        }
    }, { passive: false });
    
    const completeSwipe = () => {
        const deltaY = Math.abs(touchEndY - touchStartY);
        carouselTrack.style.transition = '';

        if (Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance) {
            if (deltaX > 0) {
                showPrevAlbumPhoto();
            } else {
                showNextAlbumPhoto();
            }
        } else {
            updateCarouselPosition({ animate: true });
        }
    };
    
    carousel.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        completeSwipe();
    }, { passive: true });
    
    carousel.addEventListener('touchcancel', () => {
        if (!isDragging) return;
        isDragging = false;
        carouselTrack.style.transition = '';
        resetPosition();
    }, { passive: true });
}

/**
 * Récupère la liste des blobs depuis Azure Storage
 * Utilise l'API REST de Azure Storage avec accès public
 */
async function fetchBlobsFromStorage(storageUrl) {
    try {
        // Parse l'URL pour extraire le container et le préfixe
        // Format attendu : https://account.blob.core.windows.net/container/prefix
        const url = new URL(storageUrl);
        const pathParts = url.pathname.split('/').filter(p => p);
        
        if (pathParts.length < 2) {
            console.error('URL invalide, doit contenir container et préfixe');
            return [];
        }
        
        const containerName = pathParts[0]; // ex: "medias"
        const prefix = pathParts.slice(1).join('/'); // ex: "tournoi-trevoux-20251010"
        
        // Construit l'URL de listing avec le container et le préfixe
        const baseUrl = `${url.protocol}//${url.host}/${containerName}`;
        const listUrl = `${baseUrl}?restype=container&comp=list&prefix=${encodeURIComponent(prefix + '/')}`;
        
        const response = await fetch(listUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Parse le XML pour extraire les URLs des blobs
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Récupère tous les éléments <Name>
        const blobNames = xmlDoc.querySelectorAll('Blob > Name');
        
        // Construit les URLs complètes et filtre les images
        const imageUrls = Array.from(blobNames)
            .map(nameElement => {
                const blobName = nameElement.textContent;
                return `${url.protocol}//${url.host}/${containerName}/${blobName}`;
            })
            .filter(imageUrl => {
                // Filtre uniquement les images (jpg, jpeg, png, webp, gif)
                const ext = imageUrl.toLowerCase().split('.').pop().split('?')[0];
                return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
            });
        
        return imageUrls;
    } catch (error) {
        console.error('Erreur lors de la récupération des blobs:', error);
        return [];
    }
}

/**
 * Ouvre le lightbox et charge toutes les images de l'album Azure Storage
 */
async function openLightboxWithAlbum(index) {
    const modal = document.getElementById('gallery-modal');
    const loading = document.getElementById('gallery-modal-loading');
    const photo = galleryPhotos[index];
    
    if (!photo) {
        return;
    }
    
    if (!modal) {
        console.error('Modal #gallery-modal introuvable dans le DOM');
        return;
    }
    
    // Affiche le modal et le loader
    modal.classList.add('active');
    setGalleryFullscreenState(false);
    document.body.style.overflow = 'hidden';
    
    if (loading) {
        loading.classList.remove('hidden');
    }
    
    // Met à jour les infos de base
    document.getElementById('gallery-modal-titre').textContent = photo.titre;
    document.getElementById('gallery-modal-description').textContent = photo.description;
    document.getElementById('gallery-modal-date').querySelector('span').textContent = photo.date;
    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = 'translateX(0%)';
    }
    
    // Récupère toutes les images du dossier Azure Storage
    currentAlbumImages = await fetchBlobsFromStorage(photo.storageUrl);
    
    // Si aucune image n'a été trouvée, utilise l'image principale
    if (currentAlbumImages.length === 0) {
        currentAlbumImages = [photo.mainImage];
    } else if (!currentAlbumImages.includes(photo.mainImage)) {
        currentAlbumImages.unshift(photo.mainImage);
    }
    
    // Trouve l'index de l'image principale dans l'album
    const mainImageIndex = currentAlbumImages.findIndex(url => url === photo.mainImage);
    currentAlbumIndex = mainImageIndex >= 0 ? mainImageIndex : 0;
    
    buildCarouselSlides(photo);
    updateActiveSlide();
    updateCarouselPosition({ animate: false });
    await waitForActiveSlideImage();
    
    if (loading) {
        loading.classList.add('hidden');
    }
    
    // Assure que les transitions sont réactivées après initialisation
    if (carouselTrack) {
        requestAnimationFrame(() => {
            carouselTrack.style.transition = '';
        });
    }
    
    // Met à jour le compteur
    updateImageCounter();
}

function buildCarouselSlides(photo) {
    if (!carouselTrack) return;
    
    carouselTrack.innerHTML = '';
    const baseAlt = photo.alt || photo.titre || 'Photo de la galerie';
    
    currentAlbumImages.forEach((imageUrl, idx) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-carousel-slide';
        slide.dataset.index = idx;
        slide.setAttribute('role', 'option');
        slide.setAttribute('aria-selected', idx === currentAlbumIndex ? 'true' : 'false');
        slide.setAttribute('tabindex', idx === currentAlbumIndex ? '0' : '-1');
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = baseAlt;
        img.loading = idx === currentAlbumIndex ? 'eager' : 'lazy';
        
        slide.appendChild(img);
        carouselTrack.appendChild(slide);
    });
}

function waitForActiveSlideImage() {
    return new Promise(resolve => {
        if (!carouselTrack) {
            resolve();
            return;
        }
        const activeSlide = carouselTrack.querySelector(`.gallery-carousel-slide[data-index="${currentAlbumIndex}"] img`);
        if (!activeSlide) {
            resolve();
            return;
        }
        if (activeSlide.complete) {
            resolve();
        } else {
            activeSlide.addEventListener('load', () => resolve(), { once: true });
            activeSlide.addEventListener('error', () => resolve(), { once: true });
        }
    });
}

function updateCarouselPosition({ animate = true } = {}) {
    if (!carouselTrack) return;
    const translateValue = `translateX(-${currentAlbumIndex * 100}%)`;
    
    if (!animate) {
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = translateValue;
        requestAnimationFrame(() => {
            carouselTrack.style.transition = '';
        });
        return;
    }
    
    carouselTrack.style.transform = translateValue;
}

function updateActiveSlide() {
    if (!carouselTrack) return;
    const slides = carouselTrack.querySelectorAll('.gallery-carousel-slide');
    slides.forEach((slide, idx) => {
        const isActive = idx === currentAlbumIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-selected', isActive ? 'true' : 'false');
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
        const img = slide.querySelector('img');
        if (img) {
            img.loading = isActive ? 'eager' : 'lazy';
        }
    });
}

function setCarouselAnimating(animate) {
    if (carouselAnimationTimeout) {
        clearTimeout(carouselAnimationTimeout);
        carouselAnimationTimeout = null;
    }
    
    if (animate) {
        isCarouselAnimating = true;
        carouselAnimationTimeout = setTimeout(() => {
            isCarouselAnimating = false;
            carouselAnimationTimeout = null;
        }, CAROUSEL_TRANSITION_MS);
    } else {
        isCarouselAnimating = false;
    }
}

/**
 * Affiche une image spécifique de l'album
 */
function showAlbumImage(index, { animate = true } = {}) {
    if (currentAlbumImages.length === 0 || !carouselTrack) return;
    
    const total = currentAlbumImages.length;
    const normalizedIndex = ((index % total) + total) % total;
    currentAlbumIndex = normalizedIndex;
    
    setCarouselAnimating(animate);
    updateCarouselPosition({ animate });
    updateActiveSlide();
    updateImageCounter();
}

/**
 * Met à jour le compteur d'images
 */
function updateImageCounter() {
    const currentSpan = document.getElementById('gallery-modal-current');
    const totalSpan = document.getElementById('gallery-modal-total');
    
    if (currentSpan && totalSpan) {
        currentSpan.textContent = currentAlbumIndex + 1;
        totalSpan.textContent = currentAlbumImages.length;
    }
}

/**
 * Affiche la photo précédente de l'album
 */
function showPrevAlbumPhoto() {
    if (currentAlbumImages.length === 0 || isCarouselAnimating) return;
    
    const newIndex = (currentAlbumIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
    showAlbumImage(newIndex, { animate: true });
}

/**
 * Affiche la photo suivante de l'album
 */
function showNextAlbumPhoto() {
    if (currentAlbumImages.length === 0 || isCarouselAnimating) return;
    
    const newIndex = (currentAlbumIndex + 1) % currentAlbumImages.length;
    showAlbumImage(newIndex, { animate: true });
}

/**
 * Ferme le lightbox
 */
function closeLightbox() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    exitGalleryFullscreen();
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = 'translateX(0%)';
        requestAnimationFrame(() => {
            if (carouselTrack) {
                carouselTrack.style.transition = '';
            }
        });
    }
    
    if (carouselAnimationTimeout) {
        clearTimeout(carouselAnimationTimeout);
        carouselAnimationTimeout = null;
    }
    isCarouselAnimating = false;
    
    // Réinitialise l'album
    currentAlbumImages = [];
    currentAlbumIndex = 0;
}

function toggleGalleryFullscreen() {
    const modal = getGalleryModalElement();
    if (!modal) {
        return;
    }
    if (modal.classList.contains('is-fullscreen')) {
        exitGalleryFullscreen();
    } else {
        enterGalleryFullscreen();
    }
}

async function enterGalleryFullscreen() {
    const modal = getGalleryModalElement();
    const container = getGalleryModalContainer();
    if (!modal || !container) {
        return;
    }
    setGalleryFullscreenState(true);
    const requestMethod = container.requestFullscreen || container.webkitRequestFullscreen || container.msRequestFullscreen;
    if (!requestMethod) {
        return;
    }
    try {
        const result = requestMethod.call(container);
        if (result && typeof result.then === 'function') {
            await result;
        }
    } catch (error) {
        console.warn('Erreur lors du passage en plein écran :', error);
    }
}

function exitGalleryFullscreen() {
    const modal = getGalleryModalElement();
    if (!modal) {
        return;
    }
    setGalleryFullscreenState(false);
    const fullscreenElement = getFullscreenElement();
    if (!fullscreenElement || !modal.contains(fullscreenElement)) {
        return;
    }
    const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exitMethod) {
        return;
    }
    try {
        const result = exitMethod.call(document);
        if (result && typeof result.catch === 'function') {
            result.catch(() => {});
        }
    } catch (error) {
        console.warn('Erreur lors de la sortie du plein écran :', error);
    }
}

function setGalleryFullscreenState(isFullscreen) {
    const modal = getGalleryModalElement();
    if (!modal) {
        return;
    }
    modal.classList.toggle('is-fullscreen', Boolean(isFullscreen));
    updateFullscreenButton(Boolean(isFullscreen));
}

function updateFullscreenButton(isFullscreen) {
    if (!fullscreenButton) {
        return;
    }
    const label = isFullscreen ? 'Quitter le plein écran' : 'Activer le mode plein écran';
    fullscreenButton.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.setAttribute('title', label);
    const icon = fullscreenButton.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-expand', !isFullscreen);
        icon.classList.toggle('fa-compress', isFullscreen);
    }
}

function handleFullscreenChange() {
    const modal = getGalleryModalElement();
    if (!modal) {
        return;
    }
    const fullscreenElement = getFullscreenElement();
    const isActive = Boolean(fullscreenElement && modal.contains(fullscreenElement));
    setGalleryFullscreenState(isActive);
}

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

function getGalleryModalElement() {
    if (galleryModalElement && galleryModalElement.isConnected) {
        return galleryModalElement;
    }
    galleryModalElement = document.getElementById('gallery-modal');
    return galleryModalElement;
}

function getGalleryModalContainer() {
    if (galleryModalContainer && galleryModalContainer.isConnected) {
        return galleryModalContainer;
    }
    const modal = getGalleryModalElement();
    if (!modal) {
        return null;
    }
    galleryModalContainer = modal.querySelector('.gallery-modal-container');
    return galleryModalContainer;
}

/**
 * Configure le bouton "Voir plus"
 */
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('btn-gallery-load-more');
    
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        // TODO: Charger plus de photos depuis le JSON
        // Pour l'instant, affiche toutes les photos
        const hiddenItems = document.querySelectorAll('.gallery-item[style*="display: none"]');
        
        hiddenItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.display = 'block';
                item.classList.add('fade-in-up');
            }, index * 100);
        });
        
        // Cache le bouton une fois toutes les photos affichées
        this.style.display = 'none';
    });
}
