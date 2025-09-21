/**
 * Gestion des événements et calendriers Google
 * Script pour la page événements.liquid
 */

document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si la configuration du calendrier est disponible
    if (!window.calendarConfig) {
        console.error("Configuration du calendrier non disponible");
        showError();
        return;
    }

    const { apiKey, teams } = window.calendarConfig;
    const tabButtons = document.querySelectorAll('.tab-buttons li');
    const calendarLoading = document.querySelector('.calendar-loading');
    const calendarError = document.querySelector('.calendar-error');
    const calendarEvents = document.querySelector('.calendar-events');

    let activeTeam = 'all';
    let allEvents = [];
    let loadedCalendars = 0;
    
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

        const timeMin = today.toISOString();
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
                    
                    renderEvents();
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
     * Affiche les événements filtrés par équipe
     */
    function renderEvents() {
        // Filtre les événements selon l'équipe sélectionnée
        let filteredEvents = allEvents;
        if (activeTeam !== 'all') {
            filteredEvents = allEvents.filter(event => event.team === activeTeam);
        }
        
        // Efface le contenu précédent
        calendarEvents.innerHTML = '';
        
        // Si aucun événement n'est disponible
        if (filteredEvents.length === 0) {
            calendarEvents.innerHTML = `<div class="no-events"><p>Aucun événement à venir pour ${activeTeam === 'all' ? 'les équipes' : `l'équipe ${activeTeam}`}.</p></div>`;
            hideLoading();
            calendarEvents.style.display = 'block';
            return;
        }
        
        // Regroupe les événements par mois
        const eventsByMonth = groupEventsByMonth(filteredEvents);
        
        // Crée l'élément HTML pour chaque mois
        for (const [month, events] of Object.entries(eventsByMonth)) {
            const monthElement = document.createElement('div');
            monthElement.className = 'calendar-month';
            monthElement.innerHTML = `<h2>${month}</h2>`;
            
            // Crée l'élément HTML pour chaque événement
            events.forEach(event => {
                const eventElement = createEventElement(event);
                monthElement.appendChild(eventElement);
            });
            
            calendarEvents.appendChild(monthElement);
        }
        
        hideLoading();
        calendarEvents.style.display = 'block';
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
     * @return {HTMLElement} Élément HTML représentant l'événement
     */
    function createEventElement(event) {
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
                    <span class="event-team">${event.team}</span>
                    <span class="event-time">${isAllDay ? 'Toute la journée' : timeStr}</span>
                    ${event.location ? `<span class="event-location">${event.location}</span>` : ''}
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            </div>
        `;
        
        return eventElement;
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

    // Charge tous les calendriers au chargement de la page
    loadAllCalendars();
});