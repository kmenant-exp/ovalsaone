/**
 * Gestion des événements et calendriers Google
 * Script pour la page événements.liquid
 */

import { CalendarLoader, mergeIdenticalEvents, createEventCard, groupEventsByMonth } from './calendar-utils.js';

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

    // Initialise le loader de calendrier
    const calendarLoader = new CalendarLoader({
        apiKey,
        teams,
        onLoadStart: showLoading,
        onLoadComplete: (events) => {
            allEvents = events;
            
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
        },
        onError: showError
    });

    /**
     * Charge les événements de tous les calendriers
     */
    function loadAllCalendars() {
        const today = new Date();
        const nextThreeMonths = new Date(today);
        nextThreeMonths.setMonth(today.getMonth() + 3);
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        // On charge les 6 derniers mois et les 3 prochains mois
        calendarLoader.loadAll({
            timeMin: sixMonthsAgo,
            timeMax: nextThreeMonths
        });
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
                    const eventElement = createEventCard(event, true);
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
                    const eventElement = createEventCard(event, false);
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