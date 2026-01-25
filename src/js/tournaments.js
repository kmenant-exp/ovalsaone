/**
 * Gestion de l'affichage des tournois sur la page d'accueil
 * Affiche les tournois des 2 prochaines semaines
 */

document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si on est sur la page d'accueil et si la section tournois existe
    console.log('Tournaments script loaded');

    const tournamentsSection = document.querySelector('.tournois');
    if (!tournamentsSection || !window.calendarConfig) {
        return;
    }

    const { apiKey, teams } = window.calendarConfig;
    const tournamentsLoading = document.querySelector('.tournaments-loading');
    const tournamentsError = document.querySelector('.tournaments-error');
    const tournamentsGrid = document.querySelector('.tournaments-grid');
    const noTournaments = document.querySelector('.no-tournaments');

    let allEvents = [];
    let loadedCalendars = 0;

    /**
     * Charge les événements de tous les calendriers
     */
    function loadAllCalendars() {
        showLoading();
        allEvents = [];
        loadedCalendars = 0;

        // Charge les événements pour chaque calendrier
        teams.forEach(team => {
            loadCalendarEvents(team);
        });
    }

    /**
     * Charge les événements d'un calendrier spécifique
     * @param {Object} team - Objet contenant le nom et l'ID du calendrier
     */
    function loadCalendarEvents(team) {
        const today = new Date();
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);

        // On charge uniquement les 2 prochaines semaines
        const timeMin = today.toISOString();
        const timeMax = twoWeeksLater.toISOString();

        // Construit l'URL de l'API Google Calendar
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(team.calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

        // Appelle l'API Google Calendar
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Traite les événements reçus
                if (data.items && data.items.length > 0) {
                    data.items.forEach(event => {
                        allEvents.push({
                            ...event,
                            team: team.name
                        });
                    });
                }
                
                // Incrémente le compteur de calendriers chargés
                loadedCalendars++;
                
                // Si tous les calendriers sont chargés, on filtre et affiche les tournois
                if (loadedCalendars === teams.length) {
                    // Trie les événements par date de début
                    allEvents.sort((a, b) => {
                        const dateA = new Date(a.start.dateTime || a.start.date);
                        const dateB = new Date(b.start.dateTime || b.start.date);
                        return dateA - dateB;
                    });
                    
                    // Filtre uniquement les tournois
                    const tournaments = filterTournaments(allEvents);
                    
                    // Affiche les tournois
                    renderTournaments(tournaments);
                }
            })
            .catch(error => {
                console.error(`Erreur lors du chargement du calendrier ${team.name}:`, error);
                loadedCalendars++;
                
                // Si tous les calendriers ont tenté d'être chargés
                if (loadedCalendars === teams.length) {
                    if (allEvents.length === 0) {
                        showError();
                    } else {
                        const tournaments = filterTournaments(allEvents);
                        renderTournaments(tournaments);
                    }
                }
            });
    }

    /**
     * Filtre les événements pour ne garder que les tournois
     * @param {Array} events - Liste des événements
     * @return {Array} Liste des tournois uniquement
     */
    function filterTournaments(events) {
        return events.filter(event => {
            const summary = event.summary || '';
            // Recherche case-insensitive du mot "tournoi"
            return summary.toLowerCase().includes('tournoi');
        });
    }

    /**
     * Regroupe les événements qui ont le même nom et la même date
     * @param {Array} events - Liste des événements à regrouper
     * @return {Array} Liste des événements regroupés
     */
    function mergeIdenticalEvents(events) {
        const mergedEventsMap = new Map();
        
        events.forEach(event => {
            const startDate = new Date(event.start.dateTime || event.start.date);
            const key = `${event.summary}_${startDate.toDateString()}`;
            
            if (mergedEventsMap.has(key)) {
                const existingEvent = mergedEventsMap.get(key);
                if (!existingEvent.teams.includes(event.team)) {
                    existingEvent.teams.push(event.team);
                }
            } else {
                mergedEventsMap.set(key, {
                    ...event,
                    teams: [event.team]
                });
            }
        });
        
        return Array.from(mergedEventsMap.values());
    }

    /**
     * Affiche les tournois
     * @param {Array} tournaments - Liste des tournois à afficher
     */
    function renderTournaments(tournaments) {
        // Fusionne les tournois identiques
        const mergedTournaments = mergeIdenticalEvents(tournaments);
        
        // Efface le contenu précédent
        tournamentsGrid.innerHTML = '';
        
        if (mergedTournaments.length === 0) {
            // Aucun tournoi à afficher
            hideLoading();
            tournamentsGrid.style.display = 'none';
            noTournaments.style.display = 'block';
        } else {
            // Crée les cartes de tournoi
            mergedTournaments.forEach(tournament => {
                const tournamentCard = createTournamentCard(tournament);
                tournamentsGrid.appendChild(tournamentCard);
            });
            
            hideLoading();
            tournamentsGrid.style.display = 'grid';
            noTournaments.style.display = 'none';
        }
    }

    /**
     * Crée une carte de tournoi
     * @param {Object} event - Événement à afficher
     * @param {boolean} isUpcoming - Indique si l'événement est à venir
     * @return {HTMLElement} Élément HTML représentant le tournoi
     */
    function createTournamentCard(event, isUpcoming = true) {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = event.end ? new Date(event.end.dateTime || event.end.date) : null;
        
        const isAllDay = !event.start.dateTime;
        
        // Format de la date et de l'heure
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const dateStr = startDate.toLocaleDateString('fr-FR', options);
        
        // Format de l'heure (pour les événements non-journaliers)
        let timeStr = '';
        if (!isAllDay) {
            const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const endTime = endDate ? endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
            timeStr = `${startTime}${endTime ? ' - ' + endTime : ''}`;
        }
        
        // Gestion de l'affichage des équipes
        let teamDisplay = '';
        let primaryTeam = '';
        
        // Vérifiez si l'événement a été fusionné (possède un tableau d'équipes)
        if (event.teams && event.teams.length > 0) {
            // Pour les événements fusionnés, afficher toutes les équipes concernées
            teamDisplay = event.teams.map(team => `<span class="event-team">${team}</span>`).join('');
            primaryTeam = event.teams[0];
        } else {
            // Pour les événements non fusionnés (vue par équipe), afficher l'équipe unique
            teamDisplay = `<span class="event-team">${event.team}</span>`;
            primaryTeam = event.team;
        }

        // Génère l'identifiant unique de l'événement pour les convocations
        const eventId = generateEventId(event, primaryTeam);
        const eventDateString = startDate.toISOString().split('T')[0];
        const eventDateTimeString = `${dateStr}${!isAllDay ? ' à ' + timeStr : ' (toute la journée)'}`;

        // Bouton de convocation (uniquement pour les événements à venir)
        let convocationButton = '';
        if (isUpcoming) {
            convocationButton = `
                <button class="btn btn-convocation" 
                        data-event-id="${eventId}"
                        data-event-summary="${(event.summary || 'Événement').replace(/"/g, '&quot;')}"
                        data-event-date="${eventDateString}"
                        data-event-datetime="${eventDateTimeString}"
                        data-event-team="${primaryTeam}">
                    <span class="convocation-icon">📋</span>
                    <span class="convocation-text">Répondre</span>
                </button>
            `;
        }
        
        // Crée l'élément HTML
        const eventElement = document.createElement('div');
        eventElement.className = 'calendar-event';
        eventElement.innerHTML = `
            <div class="event-date">
                <span class="event-day">${startDate.getDate()}</span>
                <span class="event-month">${startDate.toLocaleDateString('fr-FR', { month: 'short' })}</span>
            </div>
            <div class="event-details">
                <h3 class="event-title">${event.summary || 'Sans titre'}</h3>
                <div class="event-meta">
                    <div class="event-teams">${teamDisplay}</div>
                    <span class="event-time">${isAllDay ? 'Toute la journée' : timeStr}</span>
                    ${event.location ? `<span class="event-location">${event.location}</span>` : ''}
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            </div>
            <div class="event-actions">
                ${convocationButton}
            </div>
        `;

        // Ajoute l'événement de clic sur le bouton de convocation
        const convBtn = eventElement.querySelector('.btn-convocation');
        if (convBtn) {
            convBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const eventData = {
                    eventId: convBtn.dataset.eventId,
                    summary: convBtn.dataset.eventSummary,
                    dateString: convBtn.dataset.eventDate,
                    dateTimeString: convBtn.dataset.eventDatetime,
                    team: convBtn.dataset.eventTeam
                };
                
                if (window.ConvocationManager) {
                    window.ConvocationManager.openModal(eventData);
                }
            });
        }
        
        return eventElement;
    }

    /**
     * Génère un identifiant unique pour un événement
     * @param {Object} event - Événement Google Calendar
     * @param {string} team - Nom de l'équipe
     * @returns {string} Identifiant unique
     */
    function generateEventId(event, team) {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const dateStr = startDate.toISOString().split('T')[0];
        const summary = (event.summary || 'event').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        return `${team}_${dateStr}_${summary}`;
    }

    function showLoading() {
        tournamentsLoading.style.display = 'block';
        tournamentsError.style.display = 'none';
        tournamentsGrid.style.display = 'none';
        noTournaments.style.display = 'none';
    }

    function hideLoading() {
        tournamentsLoading.style.display = 'none';
    }

    function showError() {
        tournamentsLoading.style.display = 'none';
        tournamentsError.style.display = 'block';
        tournamentsGrid.style.display = 'none';
        noTournaments.style.display = 'none';
    }

    // Charge tous les calendriers au chargement de la page
    loadAllCalendars();
});
