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
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevAlbumPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextAlbumPhoto();
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
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    
    const minSwipeDistance = 50; // Distance minimale pour déclencher un swipe (en pixels)
    const maxVerticalDistance = 100; // Distance verticale max pour considérer comme un swipe horizontal
    
    const modalContent = modal.querySelector('.gallery-modal-content');
    const modalImage = document.getElementById('gallery-modal-image');
    
    if (!modalContent || !modalImage) return;
    
    // Début du toucher
    modalImage.addEventListener('touchstart', function(e) {
        // Ne pas interférer si on touche les boutons de navigation
        if (e.target.closest('.gallery-modal-nav')) {
            return;
        }
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isDragging = true;
        
        console.log('Touch start:', touchStartX, touchStartY);
        
        // Désactive la transition pendant le drag
        modalImage.style.transition = 'none';
    }, { passive: true });
    
    // Déplacement du doigt
    modalImage.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        // Si le mouvement est principalement horizontal
        if (Math.abs(deltaX) > deltaY) {
            // Empêche le scroll de la page pendant le swipe horizontal
            e.preventDefault();
            
            // Applique un effet de déplacement visuel (optionnel)
            const translateX = deltaX * 0.3; // Réduit l'amplitude pour un effet subtil
            modalImage.style.transform = `translateX(${translateX}px)`;
        }
    }, { passive: false });
    
    // Fin du toucher
    modalImage.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        // Réactive la transition
        modalImage.style.transition = '';
        modalImage.style.transform = '';
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        console.log('Touch end - deltaX:', deltaX, 'deltaY:', deltaY);
        
        // Vérifie si c'est un swipe horizontal valide
        if (Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance) {
            console.log('Swipe détecté!', deltaX > 0 ? 'Droite (prev)' : 'Gauche (next)');
            if (deltaX > 0) {
                // Swipe vers la droite -> photo précédente
                showPrevAlbumPhoto();
            } else {
                // Swipe vers la gauche -> photo suivante
                showNextAlbumPhoto();
            }
        } else {
            console.log('Swipe non valide - distance trop courte ou trop vertical');
        }
        
        isDragging = false;
    }, { passive: true });
    
    // Annulation du toucher
    modalImage.addEventListener('touchcancel', function() {
        isDragging = false;
        modalImage.style.transition = '';
        modalImage.style.transform = '';
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
    document.body.style.overflow = 'hidden';
    
    if (loading) {
        loading.classList.remove('hidden');
    }
    
    // Met à jour les infos de base
    document.getElementById('gallery-modal-titre').textContent = photo.titre;
    document.getElementById('gallery-modal-description').textContent = photo.description;
    document.getElementById('gallery-modal-date').querySelector('span').textContent = photo.date;
    
    // Affiche d'abord l'image principale
    const modalImage = document.getElementById('gallery-modal-image');
    modalImage.src = photo.mainImage;
    modalImage.alt = photo.alt;
    
    // Récupère toutes les images du dossier Azure Storage
    currentAlbumImages = await fetchBlobsFromStorage(photo.storageUrl);
    
    // Si aucune image n'a été trouvée, utilise l'image principale
    if (currentAlbumImages.length === 0) {
        currentAlbumImages = [photo.mainImage];
    }
    
    // Trouve l'index de l'image principale dans l'album
    const mainImageIndex = currentAlbumImages.findIndex(url => url === photo.mainImage);
    currentAlbumIndex = mainImageIndex >= 0 ? mainImageIndex : 0;
    
    // Affiche l'image courante
    showAlbumImage(currentAlbumIndex);
    
    // Cache le loader
    loading.classList.add('hidden');
    
    // Met à jour le compteur
    updateImageCounter();
}

/**
 * Affiche une image spécifique de l'album
 */
function showAlbumImage(index) {
    if (currentAlbumImages.length === 0) return;
    
    const modalImage = document.getElementById('gallery-modal-image');
    const imageUrl = currentAlbumImages[index];
    
    // Effet de transition
    modalImage.style.opacity = '0';
    
    setTimeout(() => {
        modalImage.src = imageUrl;
        modalImage.onload = () => {
            modalImage.style.opacity = '1';
        };
    }, 150);
    
    currentAlbumIndex = index;
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
    if (currentAlbumImages.length === 0) return;
    
    const newIndex = (currentAlbumIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
    showAlbumImage(newIndex);
}

/**
 * Affiche la photo suivante de l'album
 */
function showNextAlbumPhoto() {
    if (currentAlbumImages.length === 0) return;
    
    const newIndex = (currentAlbumIndex + 1) % currentAlbumImages.length;
    showAlbumImage(newIndex);
}

/**
 * Ferme le lightbox
 */
function closeLightbox() {
    const modal = document.getElementById('gallery-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Réinitialise l'album
    currentAlbumImages = [];
    currentAlbumIndex = 0;
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
