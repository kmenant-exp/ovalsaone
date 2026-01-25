/**
 * Gestion des événements et calendriers Google
 * Script pour la page événements.liquid
 */

document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si la configuration du calendrier est disponible
    if (!window.calendarConfig) {
        return;
    }

    const { apiKey, teams } = window.calendarConfig;
    const tabButtons = document.querySelectorAll('.tab-buttons li');
    const calendarLoading = document.querySelector('.calendar-loading');
    const calendarError = document.querySelector('.calendar-error');
    const calendarEvents = document.querySelector('.calendar-events');
    const calendarPastEvents = document.querySelector('.calendar-past-events');
    const pastEventsButton = document.querySelector('.past-events-button');

    let activeTeam = 'all';
    let allEvents = [];
    let upcomingEvents = [];
    let pastEvents = [];
    let loadedCalendars = 0;
    let showPastEvents = false;
    
    // Initialise les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            activeTeam = button.getAttribute('data-team');
            renderEvents();
        });
    });

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
        const nextThreeMonths = new Date(today);
        nextThreeMonths.setMonth(today.getMonth() + 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        // On charge les 6 derniers mois et les 3 prochains mois
        const timeMin = sixMonthsAgo.toISOString();
        const timeMax = nextThreeMonths.toISOString();

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
                
                // Si tous les calendriers sont chargés, on trie et affiche les événements
                if (loadedCalendars === teams.length) {
                    // Trie les événements par date de début
                    allEvents.sort((a, b) => {
                        const dateA = new Date(a.start.dateTime || a.start.date);
                        const dateB = new Date(b.start.dateTime || b.start.date);
                        return dateA - dateB;
                    });
                    
                    // Sépare les événements à venir et passés
                    const now = new Date();
                    upcomingEvents = allEvents.filter(event => {
                        const eventDate = new Date(event.start.dateTime || event.start.date);
                        return eventDate >= now;
                    });
                    
                    pastEvents = allEvents.filter(event => {
                        const eventDate = new Date(event.start.dateTime || event.start.date);
                        return eventDate < now;
                    });
                    
                    // On affiche les événements
                    renderEvents();
                    
                    // On affiche ou masque le bouton "Voir les événements passés" selon qu'il y a des événements passés ou non
                    if (pastEvents.length > 0) {
                        pastEventsButton.style.display = 'block';
                    } else {
                        pastEventsButton.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error(`Erreur lors du chargement du calendrier ${team.name}:`, error);
                loadedCalendars++;
                
                // Si tous les calendriers ont tenté d'être chargés, on vérifie s'il y a des événements
                if (loadedCalendars === teams.length) {
                    if (allEvents.length === 0) {
                        showError();
                    } else {
                        renderEvents();
                    }
                }
            });
    }

    /**
     * Regroupe les événements qui ont le même nom et la même date
     * @param {Array} events - Liste des événements à regrouper
     * @return {Array} Liste des événements regroupés
     */
    function mergeIdenticalEvents(events) {
        // Map pour stocker les événements uniques par clé
        const mergedEventsMap = new Map();
        
        events.forEach(event => {
            const startDate = new Date(event.start.dateTime || event.start.date);
            // Crée une clé unique basée sur le nom de l'événement et sa date de début
            const key = `${event.summary}_${startDate.toDateString()}`;
            
            if (mergedEventsMap.has(key)) {
                // Si cet événement existe déjà, ajoutez l'équipe à la liste
                const existingEvent = mergedEventsMap.get(key);
                // Vérifiez si l'équipe existe déjà dans la liste des équipes
                if (!existingEvent.teams.includes(event.team)) {
                    existingEvent.teams.push(event.team);
                }
            } else {
                // Si c'est un nouvel événement, créez une entrée avec un tableau d'équipes
                mergedEventsMap.set(key, {
                    ...event,
                    teams: [event.team]
                });
            }
        });
        
        // Convertir la Map en tableau
        return Array.from(mergedEventsMap.values());
    }

    /**
     * Affiche les événements filtrés par équipe
     */
    function renderEvents() {
        // Filtre les événements selon l'équipe sélectionnée
        let filteredUpcomingEvents = upcomingEvents;
        let filteredPastEvents = pastEvents;
        
        if (activeTeam !== 'all') {
            filteredUpcomingEvents = upcomingEvents.filter(event => event.team === activeTeam);
            filteredPastEvents = pastEvents.filter(event => event.team === activeTeam);
        } else {
            // Pour l'onglet "Tous les événements", fusionner les événements identiques
            filteredUpcomingEvents = mergeIdenticalEvents(upcomingEvents);
            filteredPastEvents = mergeIdenticalEvents(pastEvents);
        }
        
        // Efface le contenu précédent
        calendarEvents.innerHTML = '';
        calendarPastEvents.innerHTML = '';
        
        // Si aucun événement à venir n'est disponible
        if (filteredUpcomingEvents.length === 0) {
            calendarEvents.innerHTML = `<div class="no-events"><p>Aucun événement à venir pour ${activeTeam === 'all' ? 'les équipes' : `l'équipe ${activeTeam}`}.</p></div>`;
        } else {
            // Regroupe les événements à venir par mois
            const upcomingEventsByMonth = groupEventsByMonth(filteredUpcomingEvents);
            
            // Crée l'élément HTML pour chaque mois d'événements à venir
            for (const [month, events] of Object.entries(upcomingEventsByMonth)) {
                const monthElement = document.createElement('div');
                monthElement.className = 'calendar-month';
                monthElement.innerHTML = `<h2>${month}</h2>`;
                
                // Crée l'élément HTML pour chaque événement (avec bouton convocation)
                events.forEach(event => {
                    const eventElement = createEventElement(event, true);
                    monthElement.appendChild(eventElement);
                });
                
                calendarEvents.appendChild(monthElement);
            }
        }
        
        // Si des événements passés sont disponibles
        if (filteredPastEvents.length > 0) {
            // Regroupe les événements passés par mois
            const pastEventsByMonth = groupEventsByMonth(filteredPastEvents);
            
            // Crée l'élément HTML pour chaque mois d'événements passés
            for (const [month, events] of Object.entries(pastEventsByMonth)) {
                const monthElement = document.createElement('div');
                monthElement.className = 'calendar-month';
                monthElement.innerHTML = `<h2>${month}</h2>`;
                
                // Crée l'élément HTML pour chaque événement passé (sans bouton convocation)
                events.forEach(event => {
                    const eventElement = createEventElement(event, false);
                    monthElement.appendChild(eventElement);
                });
                
                calendarPastEvents.appendChild(monthElement);
            }
        } else {
            calendarPastEvents.innerHTML = `<div class="no-events"><p>Aucun événement passé pour ${activeTeam === 'all' ? 'les équipes' : `l'équipe ${activeTeam}`}.</p></div>`;
        }
        
        hideLoading();
        calendarEvents.style.display = 'block';
        
        // Affiche ou masque les événements passés selon l'état
        calendarPastEvents.style.display = showPastEvents ? 'block' : 'none';
    }

    /**
     * Regroupe les événements par mois
     * @param {Array} events - Tableau d'événements à regrouper
     * @return {Object} Événements regroupés par mois
     */
    function groupEventsByMonth(events) {
        const eventsByMonth = {};
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        events.forEach(event => {
            const date = new Date(event.start.dateTime || event.start.date);
            const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
            
            if (!eventsByMonth[monthKey]) {
                eventsByMonth[monthKey] = [];
            }
            
            eventsByMonth[monthKey].push(event);
        });
        
        return eventsByMonth;
    }

    /**
     * Crée un élément HTML pour un événement
     * @param {Object} event - Événement à afficher
     * @param {boolean} isUpcoming - Indique si l'événement est à venir
     * @return {HTMLElement} Élément HTML représentant l'événement
     */
    function createEventElement(event, isUpcoming = true) {
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
        calendarLoading.style.display = 'block';
        calendarError.style.display = 'none';
        calendarEvents.style.display = 'none';
    }

    function hideLoading() {
        calendarLoading.style.display = 'none';
    }

    function showError() {
        calendarLoading.style.display = 'none';
        calendarError.style.display = 'block';
        calendarEvents.style.display = 'none';
    }

    // Gestion du bouton des événements passés
    if (pastEventsButton) {
        pastEventsButton.addEventListener('click', function() {
            showPastEvents = !showPastEvents;
            calendarPastEvents.style.display = showPastEvents ? 'block' : 'none';
            pastEventsButton.textContent = showPastEvents ? 'Masquer les événements passés' : 'Voir les événements passés';
        });
    }

    // Charge tous les calendriers au chargement de la page
    loadAllCalendars();
});