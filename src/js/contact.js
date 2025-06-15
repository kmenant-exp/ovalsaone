// JavaScript spécifique à la page contact
document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
    initializeMap();
});

function setupContactForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const statusElement = document.getElementById('form-status');
        
        // Validation du formulaire
        const validation = window.formHandler.validateForm(form);
        
        if (!validation.isValid) {
            window.formHandler.showFormStatus(
                statusElement, 
                validation.errors.join('\n'), 
                'error'
            );
            return;
        }

        try {
            window.formHandler.setButtonLoading(submitButton, true);
            
            // Ajouter des métadonnées
            const formDataWithExtras = {
                ...validation.data,
                dateEnvoi: new Date().toISOString(),
                source: 'site-web'
            };

            // Envoi via Azure Function
            const response = await window.formHandler.submitForm(formDataWithExtras, 'contact');
            
            window.formHandler.showFormStatus(
                statusElement,
                'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
                'success'
            );
            
            form.reset();
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            window.formHandler.showFormStatus(
                statusElement,
                'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement par téléphone.',
                'error'
            );
        } finally {
            window.formHandler.setButtonLoading(submitButton, false);
        }
    });
}

function initializeMap() {
    // Vérifier si Leaflet est disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet n\'est pas chargé');
        return;
    }

    const mapElement = document.getElementById('stadium-map');
    const loadingElement = document.getElementById('map-loading');
    
    if (!mapElement) {
        console.error('Élément de carte non trouvé');
        return;
    }

    try {
        // Coordonnées pour l'adresse : {{ contact.address }}
        // Coordonnées approximatives pour Sainte-Euphémie
        const latitude = 45.8833;
        const longitude = 4.8667;

        // Initialiser la carte
        const map = L.map('stadium-map').setView([latitude, longitude], 15);

        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Ajouter un marqueur pour le stade
        const marker = L.marker([latitude, longitude]).addTo(map);
        
        // Popup avec les informations du stade
        marker.bindPopup(`
            <div style="text-align: center;">
                <h3>🏉 Stade Municipal - Oval Saône</h3>
                <p><strong>420 Route de Reyrieux</strong><br>
                01600 Sainte-Euphémie</p>
                <a href="https://www.openstreetmap.org/search?query=420%20Route%20de%20Reyrieux,%2001600%20Sainte-Euphémie" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="color: #8fbc8f; text-decoration: none;">
                   🗺️ Voir sur OpenStreetMap
                </a>
            </div>
        `).openPopup();

        // Masquer le loading après l'initialisation
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Géocodage pour obtenir les coordonnées exactes (optionnel)
        geocodeAddress('{{ contact.address }}', map, marker);

    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
        if (loadingElement) {
            loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Erreur de chargement de la carte';
        }
    }
}

function geocodeAddress(address, map, marker) {
    // Utiliser le service de géocodage Nominatim d'OpenStreetMap
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                
                // Mettre à jour la position de la carte et du marqueur
                map.setView([lat, lon], 16);
                marker.setLatLng([lat, lon]);
                
                console.log(`Adresse géocodée: ${lat}, ${lon}`);
            }
        })
        .catch(error => {
            console.warn('Géocodage échoué, utilisation des coordonnées par défaut:', error);
        });
}
