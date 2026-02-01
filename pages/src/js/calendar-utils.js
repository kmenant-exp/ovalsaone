/**
 * Utilitaires communs pour la gestion des événements Google Calendar
 * Fonctions partagées entre evenements.js et tournaments.js
 */

// Namespace global pour éviter les conflits
window.CalendarUtils = window.CalendarUtils || {};

/**
 * Regroupe les événements qui ont le même nom et la même date
 * @param {Array} events - Liste des événements à regrouper
 * @return {Array} Liste des événements regroupés
 */
window.CalendarUtils.mergeIdenticalEvents = function(events) {
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
};

/**
 * Génère un identifiant unique pour un événement
 * @param {Object} event - Événement Google Calendar
 * @param {string} team - Nom de l'équipe
 * @returns {string} Identifiant unique
 */
window.CalendarUtils.generateEventId = function(event, team) {
    const startDate = new Date(event.start.dateTime || event.start.date);
    const dateStr = startDate.toISOString().split('T')[0];
    const summary = (event.summary || 'event').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    return `${team}_${dateStr}_${summary}`;
};

/**
 * Crée un élément HTML pour un événement/tournoi
 * @param {Object} event - Événement à afficher
 * @param {boolean} isUpcoming - Indique si l'événement est à venir (affiche le bouton convocation)
 * @return {HTMLElement} Élément HTML représentant l'événement
 */
window.CalendarUtils.createEventCard = function(event, isUpcoming = true) {
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
    let teamsString = '';
    
    // Vérifiez si l'événement a été fusionné (possède un tableau d'équipes)
    if (event.teams && event.teams.length > 0) {
        // Pour les événements fusionnés, afficher toutes les équipes concernées
        teamDisplay = event.teams.map(team => `<span class="event-team">${team}</span>`).join('');
        teamsString = event.teams.join(',');
        console.log('Équipes fusionnées pour l\'événement:', event.teams);
        primaryTeam = event.teams[0];
    } else {
        // Pour les événements non fusionnés (vue par équipe), afficher l'équipe unique
        teamDisplay = `<span class="event-team">${event.team}</span>`;
        teamsString = event.team;
        primaryTeam = event.team;
        console.log('Équipe unique pour l\'événement:', event.team);
    }

    // Génère l'identifiant unique de l'événement pour les convocations
    const eventId = window.CalendarUtils.generateEventId(event, primaryTeam);
    const eventDateString = startDate.toISOString().split('T')[0];
    const eventDateTimeString = `${dateStr}${!isAllDay ? ' à ' + timeStr : ' (toute la journée)'}`;

    // Prépare la liste des équipes pour le data-attribute
    //const teamsString = event.teams ? event.teams.join(',') : event.team;

    // Génère le lien Google Maps pour l'adresse
    let locationHtml = '';
    if (event.location) {
        const encodedLocation = encodeURIComponent(event.location);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        locationHtml = `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="event-location">
            <span class="location-icon">📍</span>${event.location}
        </a>`;
    }

    // Bouton de convocation (uniquement pour les événements à venir)
    let convocationButton = '';
    if (isUpcoming) {
        // Préparer les données pour le fichier iCal
        const startISO = startDate.toISOString();
        const endISO = endDate ? endDate.toISOString() : '';
        const location = event.location || '';
        
        // Encoder proprement les caractères spéciaux pour les data attributes
        const escapeHtml = (str) => {
            return str.replace(/&/g, '&amp;')
                     .replace(/"/g, '&quot;')
                     .replace(/'/g, '&#39;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;');
        };
        
        convocationButton = `
            <button class="btn btn-primary btn-convocation" 
                    data-event-id="${eventId}"
                    data-event-summary="${escapeHtml(event.summary || 'Événement')}"
                    data-event-date="${eventDateString}"
                    data-event-datetime="${eventDateTimeString}"
                    data-event-team="${teamsString}"
                    data-event-start="${startISO}"
                    data-event-end="${endISO}"
                    data-event-location="${escapeHtml(location)}">
                <span class="convocation-icon">📋</span>
                <span class="convocation-text">Participation</span>
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
                ${locationHtml}
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
                team: convBtn.dataset.eventTeam,
                startDate: convBtn.dataset.eventStart,
                endDate: convBtn.dataset.eventEnd,
                location: convBtn.dataset.eventLocation || ''
            };
            
            if (window.ConvocationManager) {
                window.ConvocationManager.openModal(eventData);
            }
        });
    }
    
    return eventElement;
};

/**
 * Classe pour gérer le chargement des événements depuis Google Calendar
 */
window.CalendarUtils.CalendarLoader = class {
    /**
     * @param {Object} config - Configuration du loader
     * @param {string} config.apiKey - Clé API Google Calendar
     * @param {Array} config.teams - Liste des équipes avec leurs calendarId
     * @param {Function} config.onLoadStart - Callback appelé au début du chargement
     * @param {Function} config.onLoadComplete - Callback appelé à la fin du chargement avec les événements
     * @param {Function} config.onError - Callback appelé en cas d'erreur
     */
    constructor(config) {
        this.apiKey = config.apiKey;
        this.teams = config.teams;
        this.onLoadStart = config.onLoadStart || (() => {});
        this.onLoadComplete = config.onLoadComplete || (() => {});
        this.onError = config.onError || (() => {});
        
        this.allEvents = [];
        this.loadedCalendars = 0;
    }

    /**
     * Charge les événements de tous les calendriers
     * @param {Object} options - Options de chargement
     * @param {Date} options.timeMin - Date de début
     * @param {Date} options.timeMax - Date de fin
     */
    loadAll(options = {}) {
        this.onLoadStart();
        this.allEvents = [];
        this.loadedCalendars = 0;

        // Charge les événements pour chaque calendrier
        this.teams.forEach(team => {
            this.loadCalendar(team, options);
        });
    }

    /**
     * Charge les événements d'un calendrier spécifique
     * @param {Object} team - Objet contenant le nom et l'ID du calendrier
     * @param {Object} options - Options de chargement
     */
    loadCalendar(team, options = {}) {
        const { timeMin, timeMax } = options;

        // Construit l'URL de l'API Google Calendar
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(team.calendarId)}/events?key=${this.apiKey}&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;

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
                        this.allEvents.push({
                            ...event,
                            team: team.name
                        });
                    });
                }
                
                // Incrémente le compteur de calendriers chargés
                this.loadedCalendars++;
                
                // Si tous les calendriers sont chargés
                if (this.loadedCalendars === this.teams.length) {
                    // Trie les événements par date de début
                    this.allEvents.sort((a, b) => {
                        const dateA = new Date(a.start.dateTime || a.start.date);
                        const dateB = new Date(b.start.dateTime || b.start.date);
                        return dateA - dateB;
                    });
                    
                    this.onLoadComplete(this.allEvents);
                }
            })
            .catch(error => {
                console.error(`Erreur lors du chargement du calendrier ${team.name}:`, error);
                this.loadedCalendars++;
                
                // Si tous les calendriers ont tenté d'être chargés
                if (this.loadedCalendars === this.teams.length) {
                    if (this.allEvents.length === 0) {
                        this.onError(error);
                    } else {
                        this.onLoadComplete(this.allEvents);
                    }
                }
            });
    }
};

/**
 * Regroupe les événements par mois
 * @param {Array} events - Tableau d'événements à regrouper
 * @return {Object} Événements regroupés par mois
 */
window.CalendarUtils.groupEventsByMonth = function(events) {
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
};

/**
 * Génère un fichier iCal/ICS pour ajouter un événement au calendrier
 * @param {Object} eventData - Données de l'événement
 * @param {string} eventData.eventName - Nom de l'événement
 * @param {string} eventData.eventDate - Date de l'événement (format ISO ou date string)
 * @param {string} eventData.location - Lieu de l'événement (optionnel)
 * @param {string} eventData.description - Description de l'événement (optionnel)
 * @param {string} eventData.eventId - ID unique de l'événement
 * @returns {string} URL data: du fichier iCal
 */
window.CalendarUtils.generateICalUrl = function(eventData) {
    const { eventName, eventDate, endDate, location = '', description = '', eventId } = eventData;
    
    // Parse la date de l'événement
    const eventStartDate = new Date(eventDate);
    
    // Vérifie si la date est valide
    if (isNaN(eventStartDate.getTime())) {
        console.error('Date invalide:', eventDate);
        return null;
    }
    
    // Formate la date au format iCal (YYYYMMDDTHHmmss)
    const formatICalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };
    
    // Utilise la date de fin fournie, sinon 2 heures après le début par défaut
    let eventEndDate;
    if (endDate) {
        eventEndDate = new Date(endDate);
        // Si la date de fin est invalide, utilise la date de début + 2h
        if (isNaN(eventEndDate.getTime())) {
            eventEndDate = new Date(eventStartDate.getTime() + 2 * 60 * 60 * 1000);
        }
    } else {
        eventEndDate = new Date(eventStartDate.getTime() + 2 * 60 * 60 * 1000);
    }
    
    // Date actuelle pour DTSTAMP
    const now = new Date();
    
    // Fonction pour échapper les caractères spéciaux selon la RFC 5545
    const escapeICalText = (text) => {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')  // Backslash d'abord
            .replace(/;/g, '\\;')     // Point-virgule
            .replace(/,/g, '\\,')     // Virgule
            .replace(/\n/g, '\\n');   // Retour à la ligne
    };
    
    // Génère le contenu iCal avec échappement des caractères spéciaux
    const icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Oval Saône Rugby//Convocations//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${eventId}@ovalsaone.fr`,
        `DTSTAMP:${formatICalDate(now)}`,
        `DTSTART:${formatICalDate(eventStartDate)}`,
        `DTEND:${formatICalDate(eventEndDate)}`,
        `SUMMARY:${escapeICalText(eventName)}`,
        description ? `DESCRIPTION:${escapeICalText(description)}` : '',
        location ? `LOCATION:${escapeICalText(location)}` : '',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line).join('\r\n');
    
    // Encode en base64 et crée l'URL data:
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
};

/**
 * Télécharge un fichier iCal pour un événement
 * @param {Object} eventData - Données de l'événement
 * @param {string} filename - Nom du fichier à télécharger (optionnel)
 */
window.CalendarUtils.downloadICalFile = function(eventData, filename = 'evenement.ics') {
    const icalUrl = this.generateICalUrl(eventData);
    
    if (!icalUrl) {
        console.error('Impossible de générer le fichier iCal');
        return;
    }
    
    // Crée un lien temporaire et déclenche le téléchargement
    const link = document.createElement('a');
    link.href = icalUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libère l'URL objet après un délai
    setTimeout(() => URL.revokeObjectURL(icalUrl), 100);
};
