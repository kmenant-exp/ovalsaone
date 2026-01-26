/**
 * Gestion des convocations aux tournois
 * Script pour la page événements.liquid
 */

const ConvocationManager = {
    apiBaseUrl: '/api',
    
    /**
     * Initialise le gestionnaire de convocations
     */
    init() {
        this.createModal();
        this.bindEvents();
    },

    /**
     * Crée la modale de convocation
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'convocation-modal';
        modal.className = 'convocation-modal';
        modal.innerHTML = `
            <div class="convocation-modal-content">
                <button class="convocation-modal-close" aria-label="Fermer">&times;</button>
                
                <div class="convocation-modal-header">
                    <h2>Répondre à la convocation</h2>
                    <div class="convocation-event-info">
                        <p class="event-name"></p>
                        <p class="event-date-time"></p>
                        <div class="event-teams"></div>
                    </div>
                </div>

                <form id="convocation-form" class="convocation-form">
                    <input type="hidden" name="eventId" id="conv-eventId">
                    <input type="hidden" name="eventDate" id="conv-eventDate">
                    <input type="hidden" name="eventName" id="conv-eventName">
                    <input type="hidden" name="equipe" id="conv-equipe">
                    <input type="hidden" name="eventStart" id="conv-eventStart">
                    <input type="hidden" name="eventEnd" id="conv-eventEnd">
                    <input type="hidden" name="eventLocation" id="conv-eventLocation">

                    <div class="form-grid-compact">
                        <div class="form-section">
                            <h3>Joueur</h3>
                            <div class="form-group">
                                <label for="conv-prenom">Prénom *</label>
                                <input type="text" id="conv-prenom" name="prenom" required 
                                       placeholder="Prénom" minlength="2" maxlength="50">
                            </div>
                            <div class="form-group">
                                <label for="conv-nom">Nom *</label>
                                <input type="text" id="conv-nom" name="nom" required 
                                       placeholder="Nom" minlength="2" maxlength="50">
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Réponse *</h3>
                            <div class="status-buttons">
                                <label class="status-option present">
                                    <input type="radio" name="statut" value="Present" required>
                                    <span class="status-icon">✅</span>
                                    <span class="status-label">Présent</span>
                                </label>
                                <label class="status-option absent">
                                    <input type="radio" name="statut" value="Absent">
                                    <span class="status-icon">❌</span>
                                    <span class="status-label">Absent</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-section covoiturage-section">
                        <h3>Covoiturage</h3>
                        <div class="covoiturage-row">
                            <div class="form-group">
                                <label>Besoin de covoiturage</label>
                                <div class="radio-group">
                                    <label class="radio-option">
                                        <input type="radio" name="besoinCovoiturage" value="true">
                                        <span>Oui</span>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="besoinCovoiturage" value="false" checked>
                                        <span>Non</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group places-group" id="places-group">
                                <label for="conv-places">Places proposées</label>
                                <input type="number" id="conv-places" name="placesProposees" 
                                       min="0" max="8" value="0">
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary convocation-cancel">Annuler</button>
                        <button type="submit" class="btn btn-primary">Envoyer ma réponse</button>
                    </div>

                    <div class="form-message" style="display: none;"></div>
                </form>

                <div class="convocation-loading" style="display: none;">
                    <p>Envoi en cours...</p>
                </div>

                <div class="convocation-success" style="display: none;">
                    <div class="success-icon">✅</div>
                    <h3>Réponse enregistrée !</h3>
                    <p class="success-message"></p>
                    <div class="success-actions">
                        <button class="btn btn-secondary add-to-calendar" style="display: none;">
                            <span class="calendar-icon">📅</span>
                            <span>Ajouter au calendrier</span>
                        </button>
                        <button class="btn btn-primary convocation-close-success">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Lie les événements
     */
    bindEvents() {
        const modal = document.getElementById('convocation-modal');
        const form = document.getElementById('convocation-form');
        const closeBtn = modal.querySelector('.convocation-modal-close');
        const cancelBtn = modal.querySelector('.convocation-cancel');
        const closeSuccessBtn = modal.querySelector('.convocation-close-success');
        const addToCalendarBtn = modal.querySelector('.add-to-calendar');

        // Fermer la modale
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        closeSuccessBtn.addEventListener('click', () => this.closeModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Bouton "Ajouter au calendrier"
        addToCalendarBtn.addEventListener('click', () => this.handleAddToCalendar());

        // Soumission du formulaire
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Sélection du statut
        const statusOptions = modal.querySelectorAll('.status-option');
        statusOptions.forEach(option => {
            option.addEventListener('click', () => {
                statusOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Gestion de l'affichage des places proposées selon le besoin de covoiturage
        const covoiturageRadios = form.querySelectorAll('input[name="besoinCovoiturage"]');
        const placesGroup = document.getElementById('places-group');
        const placesInput = document.getElementById('conv-places');
        
        const updatePlacesVisibility = () => {
            const besoinCovoiturage = form.querySelector('input[name="besoinCovoiturage"]:checked');
            if (besoinCovoiturage && besoinCovoiturage.value === 'false') {
                placesGroup.style.display = 'block';
            } else {
                placesGroup.style.display = 'none';
                placesInput.value = 0;
            }
        };
        
        covoiturageRadios.forEach(radio => {
            radio.addEventListener('change', updatePlacesVisibility);
        });
        
        // État initial
        updatePlacesVisibility();

        // Fermer avec Echap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Sauvegarde automatique des données dans localStorage
        const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="number"])');
        inputs.forEach(input => {
            // Charger les données sauvegardées
            const saved = localStorage.getItem(`convocation_${input.name}`);
            if (saved) {
                input.value = saved;
            }
            
            // Sauvegarder à chaque changement
            input.addEventListener('change', () => {
                localStorage.setItem(`convocation_${input.name}`, input.value);
            });
        });
    },

    /**
     * Ouvre la modale de convocation pour un événement
     * @param {Object} eventData - Données de l'événement
     */
    openModal(eventData) {
        const modal = document.getElementById('convocation-modal');
        const form = document.getElementById('convocation-form');
        
        // Réinitialiser l'état de la modale
        form.style.display = 'block';
        modal.querySelector('.convocation-loading').style.display = 'none';
        modal.querySelector('.convocation-success').style.display = 'none';
        modal.querySelector('.form-message').style.display = 'none';

        // Remplir les informations de l'événement
        modal.querySelector('.event-name').textContent = eventData.summary || 'Événement';
        modal.querySelector('.event-date-time').textContent = eventData.dateTimeString;
        // Afficher toutes les catégories si multiples (séparées par des virgules)
        const teams = eventData.team.split(',');
        modal.querySelector('.event-teams').innerHTML = teams.map(team => `<span class="event-team">${team}</span>`).join('');

        // Remplir les champs cachés
        document.getElementById('conv-eventId').value = eventData.eventId;
        document.getElementById('conv-eventDate').value = eventData.dateString;
        document.getElementById('conv-eventName').value = eventData.summary || 'Événement';
        document.getElementById('conv-equipe').value = eventData.team;
        document.getElementById('conv-eventStart').value = eventData.startDate || '';
        document.getElementById('conv-eventEnd').value = eventData.endDate || '';
        document.getElementById('conv-eventLocation').value = eventData.location || '';

        // Réinitialiser les boutons de statut
        const statusOptions = modal.querySelectorAll('.status-option');
        statusOptions.forEach(opt => opt.classList.remove('selected'));
        form.querySelectorAll('input[name="statut"]').forEach(r => r.checked = false);

        // Réinitialiser covoiturage
        form.querySelector('input[name="besoinCovoiturage"][value="false"]').checked = true;
        document.getElementById('conv-places').value = 0;

        // Afficher la modale
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus sur le premier champ
        setTimeout(() => {
            document.getElementById('conv-prenom').focus();
        }, 100);
    },

    /**
     * Ferme la modale
     */
    closeModal() {
        const modal = document.getElementById('convocation-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Gère la soumission du formulaire
     * @param {Event} e - Événement de soumission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const modal = document.getElementById('convocation-modal');
        const messageDiv = modal.querySelector('.form-message');
        const loadingDiv = modal.querySelector('.convocation-loading');
        const successDiv = modal.querySelector('.convocation-success');

        // Validation côté client
        const statut = form.querySelector('input[name="statut"]:checked');
        if (!statut) {
            this.showMessage(messageDiv, 'Veuillez sélectionner votre statut (Présent ou Absent)', 'error');
            return;
        }

        // Récupérer la valeur du covoiturage
        const besoinCovoiturage = form.querySelector('input[name="besoinCovoiturage"]:checked');

        // Préparer les données
        const formData = {
            eventId: form.eventId.value,
            eventDate: form.eventDate.value,
            eventName: form.eventName.value,
            equipe: form.equipe.value,
            prenom: form.prenom.value.trim(),
            nom: form.nom.value.trim(),
            statut: statut.value,
            besoinCovoiturage: besoinCovoiturage ? besoinCovoiturage.value === 'true' : false,
            placesProposees: parseInt(form.placesProposees.value) || 0
        };

        // Afficher le chargement
        form.style.display = 'none';
        loadingDiv.style.display = 'block';

        try {
            const response = await fetch(`${this.apiBaseUrl}/convocation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            loadingDiv.style.display = 'none';

            if (result.success) {
                // Afficher le succès
                successDiv.querySelector('.success-message').textContent = result.message;
                successDiv.style.display = 'block';

                // Afficher le bouton "Ajouter au calendrier" uniquement si présent
                const addToCalendarBtn = modal.querySelector('.add-to-calendar');
                if (formData.statut === 'Present') {
                    // Stocker les données de l'événement pour le bouton calendrier
                    this.currentEventData = {
                        eventId: formData.eventId,
                        eventName: formData.eventName,
                        eventDate: formData.eventDate,
                        equipe: formData.equipe,
                        startDate: form.eventStart.value,
                        endDate: form.eventEnd.value,
                        location: form.eventLocation.value
                    };
                    addToCalendarBtn.style.display = 'inline-flex';
                } else {
                    addToCalendarBtn.style.display = 'none';
                }

                // Déclencher un événement pour mettre à jour l'affichage
                window.dispatchEvent(new CustomEvent('convocationUpdated', {
                    detail: { eventId: formData.eventId }
                }));
            } else {
                // Afficher l'erreur
                form.style.display = 'block';
                this.showMessage(messageDiv, result.message || 'Une erreur est survenue', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la convocation:', error);
            loadingDiv.style.display = 'none';
            form.style.display = 'block';
            this.showMessage(messageDiv, 'Impossible de contacter le serveur. Veuillez réessayer.', 'error');
        }
    },

    /**
     * Gère l'ajout de l'événement au calendrier
     */
    handleAddToCalendar() {
        if (!this.currentEventData) {
            console.error('Aucune donnée d\'événement disponible');
            return;
        }

        if (!window.CalendarUtils || !window.CalendarUtils.downloadICalFile) {
            console.error('CalendarUtils n\'est pas disponible');
            return;
        }

        const eventData = {
            eventId: this.currentEventData.eventId,
            eventName: this.currentEventData.eventName,
            eventDate: this.currentEventData.startDate || this.currentEventData.eventDate,
            endDate: this.currentEventData.endDate,
            description: `Vous avez confirmé votre présence pour ${this.currentEventData.eventName} - ${this.currentEventData.equipe}`,
            location: this.currentEventData.location || ''
        };

        // Génère un nom de fichier propre
        const fileName = `${this.currentEventData.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
        
        // Télécharge le fichier iCal
        window.CalendarUtils.downloadICalFile(eventData, fileName);
    },

    /**
     * Affiche un message dans la modale
     */
    showMessage(messageDiv, text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
        
        // Scroll vers le message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    /**
     * Récupère le résumé des convocations pour un événement
     * @param {string} eventId - Identifiant de l'événement
     * @returns {Promise<Object>} Résumé des convocations
     */
    async getSummary(eventId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/convocation-summary?eventId=${encodeURIComponent(eventId)}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération du résumé:', error);
            return null;
        }
    },

    /**
     * Génère l'identifiant unique d'un événement
     * @param {Object} event - Événement Google Calendar
     * @param {string} team - Nom de l'équipe
     * @returns {string} Identifiant unique
     */
    generateEventId(event, team) {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const dateStr = startDate.toISOString().split('T')[0];
        const summary = (event.summary || 'event').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        return `${team}_${dateStr}_${summary}`;
    }
};

// Initialise le gestionnaire au chargement
document.addEventListener('DOMContentLoaded', () => {
    ConvocationManager.init();
});

// Export pour utilisation dans d'autres modules
window.ConvocationManager = ConvocationManager;
