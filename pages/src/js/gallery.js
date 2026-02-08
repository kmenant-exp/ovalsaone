/**
 * Gestion de la galerie photos sur la page d'accueil
 * Albums multi-photos gérés via DecapCMS
 */

let galleryPhotos = [];
let currentPhotoIndex = 0;
let currentFilter = 'all';
let currentAlbumImages = [];
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

document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});

/**
 * Initialise la galerie
 */
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length === 0) {
        return;
    }

    galleryPhotos = Array.from(galleryItems).map(function(item, index) {
        var btn = item.querySelector('.gallery-view-btn');
        if (!btn) {
            return null;
        }

        var images = [];
        try {
            images = JSON.parse(btn.dataset.photoImages || '[]');
        } catch (e) {
            images = [];
        }

        return {
            index: index,
            titre: btn.dataset.photoTitre,
            description: btn.dataset.photoDescription || '',
            date: btn.dataset.photoDate,
            mainImage: btn.dataset.photoMainImage,
            images: images,
            alt: btn.dataset.photoAlt,
            categorie: item.dataset.category
        };
    }).filter(function(p) { return p !== null; });

    setupFilters();
    setupLightbox();
    setupLoadMore();
}

/**
 * Configure les filtres de catégories
 */
function setupFilters() {
    var filterButtons = document.querySelectorAll('.gallery-filter-btn');

    filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterButtons.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterGallery(currentFilter);
        });
    });
}

/**
 * Filtre la galerie par catégorie
 */
function filterGallery(category) {
    var galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(function(item, index) {
        var itemCategory = item.dataset.category;
        var isHidden = item.classList.contains('gallery-item-hidden');

        if (category === 'all' || itemCategory === category) {
            if (!isHidden) {
                item.style.display = 'block';
                setTimeout(function() {
                    item.classList.add('fade-in-up');
                }, index * 50);
            }
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Configure le lightbox (modal de visualisation)
 */
function setupLightbox() {
    var modal = document.getElementById('gallery-modal');
    var closeBtn = document.getElementById('gallery-modal-close');
    var prevBtn = document.getElementById('gallery-modal-prev');
    var nextBtn = document.getElementById('gallery-modal-next');
    var fullscreenBtn = document.getElementById('gallery-modal-fullscreen');
    carouselTrack = document.getElementById('gallery-carousel-track');
    carouselContainer = modal ? modal.querySelector('.gallery-carousel') : null;
    galleryModalElement = modal;
    galleryModalContainer = modal ? modal.querySelector('.gallery-modal-container') : null;
    fullscreenButton = fullscreenBtn;
    updateFullscreenButton(false);

    if (!isFullscreenEventsBound) {
        ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach(function(eventName) {
            document.addEventListener(eventName, handleFullscreenChange);
        });
        isFullscreenEventsBound = true;
    }

    document.querySelectorAll('.gallery-view-btn').forEach(function(btn, index) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentPhotoIndex = index;
            openLightboxWithAlbum(index);
        });
    });

    document.querySelectorAll('.gallery-item').forEach(function(item, index) {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.gallery-view-btn')) {
                return;
            }
            currentPhotoIndex = index;
            openLightboxWithAlbum(index);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleGalleryFullscreen();
        });
    }

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

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (!modal || !modal.classList.contains('active')) return;
        var tagName = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
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

    setupTouchGestures(modal);
}

/**
 * Configure les gestes tactiles pour la navigation dans le lightbox
 */
function setupTouchGestures(modal) {
    if (!modal) return;

    var carousel = modal.querySelector('.gallery-carousel');
    if (!carousel || !carouselTrack) return;

    var touchStartX = 0;
    var touchStartY = 0;
    var deltaX = 0;
    var touchEndY = 0;
    var isDragging = false;
    var basePercent = 0;

    var minSwipeDistance = 50;
    var maxVerticalDistance = 100;

    var resetPosition = function() {
        updateCarouselPosition({ animate: false });
    };

    carousel.addEventListener('touchstart', function(e) {
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

    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;

        var currentX = e.changedTouches[0].clientX;
        var currentY = e.changedTouches[0].clientY;
        deltaX = currentX - touchStartX;
        touchEndY = currentY;
        var deltaY = Math.abs(currentY - touchStartY);

        if (Math.abs(deltaX) > deltaY) {
            e.preventDefault();
            var containerWidth = carousel.offsetWidth || 1;
            var offsetPercent = (deltaX / containerWidth) * 100;
            var clampedOffset = Math.max(Math.min(offsetPercent, 30), -30);
            carouselTrack.style.transform = 'translateX(' + (basePercent + clampedOffset) + '%)';
        }
    }, { passive: false });

    var completeSwipe = function() {
        var deltaY = Math.abs(touchEndY - touchStartY);
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

    carousel.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        completeSwipe();
    }, { passive: true });

    carousel.addEventListener('touchcancel', function() {
        if (!isDragging) return;
        isDragging = false;
        carouselTrack.style.transition = '';
        resetPosition();
    }, { passive: true });
}

/**
 * Ouvre le lightbox et affiche les photos de l'album
 */
function openLightboxWithAlbum(index) {
    var modal = document.getElementById('gallery-modal');
    var loading = document.getElementById('gallery-modal-loading');
    var photo = galleryPhotos[index];

    if (!photo || !modal) return;

    modal.classList.add('active');
    setGalleryFullscreenState(false);
    document.body.style.overflow = 'hidden';

    document.getElementById('gallery-modal-titre').textContent = photo.titre;
    document.getElementById('gallery-modal-description').textContent = photo.description || '';
    document.getElementById('gallery-modal-date').querySelector('span').textContent = photo.date;
    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = 'translateX(0%)';
    }

    // Build album: mainImage first, then album photos (no duplicates)
    currentAlbumImages = [photo.mainImage];
    if (photo.images && photo.images.length > 0) {
        photo.images.forEach(function(img) {
            if (img !== photo.mainImage) {
                currentAlbumImages.push(img);
            }
        });
    }

    currentAlbumIndex = 0;

    buildCarouselSlides(photo);
    updateActiveSlide();
    updateCarouselPosition({ animate: false });

    if (loading) {
        loading.classList.add('hidden');
    }

    if (carouselTrack) {
        requestAnimationFrame(function() {
            carouselTrack.style.transition = '';
        });
    }

    updateImageCounter();
}

function buildCarouselSlides(photo) {
    if (!carouselTrack) return;

    carouselTrack.innerHTML = '';
    var baseAlt = photo.alt || photo.titre || 'Photo de la galerie';

    currentAlbumImages.forEach(function(imageUrl, idx) {
        var slide = document.createElement('div');
        slide.className = 'gallery-carousel-slide';
        slide.dataset.index = idx;
        slide.setAttribute('role', 'option');
        slide.setAttribute('aria-selected', idx === currentAlbumIndex ? 'true' : 'false');
        slide.setAttribute('tabindex', idx === currentAlbumIndex ? '0' : '-1');

        var img = document.createElement('img');
        img.src = imageUrl;
        img.alt = baseAlt;
        img.loading = idx === currentAlbumIndex ? 'eager' : 'lazy';

        slide.appendChild(img);
        carouselTrack.appendChild(slide);
    });
}

function updateCarouselPosition(opts) {
    if (!carouselTrack) return;
    var animate = opts && opts.animate !== undefined ? opts.animate : true;
    var translateValue = 'translateX(-' + (currentAlbumIndex * 100) + '%)';

    if (!animate) {
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = translateValue;
        requestAnimationFrame(function() {
            carouselTrack.style.transition = '';
        });
        return;
    }

    carouselTrack.style.transform = translateValue;
}

function updateActiveSlide() {
    if (!carouselTrack) return;
    var slides = carouselTrack.querySelectorAll('.gallery-carousel-slide');
    slides.forEach(function(slide, idx) {
        var isActive = idx === currentAlbumIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-selected', isActive ? 'true' : 'false');
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
        var img = slide.querySelector('img');
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
        carouselAnimationTimeout = setTimeout(function() {
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
function showAlbumImage(index, opts) {
    if (currentAlbumImages.length === 0 || !carouselTrack) return;
    var animate = opts && opts.animate !== undefined ? opts.animate : true;

    var total = currentAlbumImages.length;
    var normalizedIndex = ((index % total) + total) % total;
    currentAlbumIndex = normalizedIndex;

    setCarouselAnimating(animate);
    updateCarouselPosition({ animate: animate });
    updateActiveSlide();
    updateImageCounter();
}

/**
 * Met à jour le compteur d'images
 */
function updateImageCounter() {
    var currentSpan = document.getElementById('gallery-modal-current');
    var totalSpan = document.getElementById('gallery-modal-total');

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
    var newIndex = (currentAlbumIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
    showAlbumImage(newIndex, { animate: true });
}

/**
 * Affiche la photo suivante de l'album
 */
function showNextAlbumPhoto() {
    if (currentAlbumImages.length === 0 || isCarouselAnimating) return;
    var newIndex = (currentAlbumIndex + 1) % currentAlbumImages.length;
    showAlbumImage(newIndex, { animate: true });
}

/**
 * Ferme le lightbox
 */
function closeLightbox() {
    var modal = document.getElementById('gallery-modal');
    if (!modal) return;
    exitGalleryFullscreen();

    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (carouselTrack) {
        carouselTrack.innerHTML = '';
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = 'translateX(0%)';
        requestAnimationFrame(function() {
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

    currentAlbumImages = [];
    currentAlbumIndex = 0;
}

function toggleGalleryFullscreen() {
    var modal = getGalleryModalElement();
    if (!modal) return;
    if (modal.classList.contains('is-fullscreen')) {
        exitGalleryFullscreen();
    } else {
        enterGalleryFullscreen();
    }
}

function enterGalleryFullscreen() {
    var modal = getGalleryModalElement();
    var container = getGalleryModalContainer();
    if (!modal || !container) return;
    setGalleryFullscreenState(true);
    var requestMethod = container.requestFullscreen || container.webkitRequestFullscreen || container.msRequestFullscreen;
    if (!requestMethod) return;
    try {
        var result = requestMethod.call(container);
        if (result && typeof result.then === 'function') {
            result.catch(function() {});
        }
    } catch (error) {
        console.warn('Erreur lors du passage en plein écran :', error);
    }
}

function exitGalleryFullscreen() {
    var modal = getGalleryModalElement();
    if (!modal) return;
    setGalleryFullscreenState(false);
    var fullscreenElement = getFullscreenElement();
    if (!fullscreenElement || !modal.contains(fullscreenElement)) return;
    var exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exitMethod) return;
    try {
        var result = exitMethod.call(document);
        if (result && typeof result.catch === 'function') {
            result.catch(function() {});
        }
    } catch (error) {
        console.warn('Erreur lors de la sortie du plein écran :', error);
    }
}

function setGalleryFullscreenState(isFullscreen) {
    var modal = getGalleryModalElement();
    if (!modal) return;
    modal.classList.toggle('is-fullscreen', Boolean(isFullscreen));
    updateFullscreenButton(Boolean(isFullscreen));
}

function updateFullscreenButton(isFullscreen) {
    if (!fullscreenButton) return;
    var label = isFullscreen ? 'Quitter le plein écran' : 'Activer le mode plein écran';
    fullscreenButton.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.setAttribute('title', label);
    var icon = fullscreenButton.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-expand', !isFullscreen);
        icon.classList.toggle('fa-compress', isFullscreen);
    }
}

function handleFullscreenChange() {
    var modal = getGalleryModalElement();
    if (!modal) return;
    var fullscreenElement = getFullscreenElement();
    var isActive = Boolean(fullscreenElement && modal.contains(fullscreenElement));
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
    var modal = getGalleryModalElement();
    if (!modal) return null;
    galleryModalContainer = modal.querySelector('.gallery-modal-container');
    return galleryModalContainer;
}

/**
 * Configure le bouton "Voir plus"
 */
function setupLoadMore() {
    var loadMoreBtn = document.getElementById('btn-gallery-load-more');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function() {
        var hiddenItems = document.querySelectorAll('.gallery-item-hidden');

        hiddenItems.forEach(function(item, index) {
            setTimeout(function() {
                item.classList.remove('gallery-item-hidden');
                item.style.display = 'block';
                item.classList.add('fade-in-up');
            }, index * 100);
        });

        this.style.display = 'none';
    });
}
