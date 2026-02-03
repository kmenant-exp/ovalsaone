/**
 * Gestion de l'affichage des tournois sur la page d'accueil
 * Affiche les tournois des 2 prochaines semaines
 */

document.addEventListener('DOMContentLoaded', () => {
    const tournamentsSection = document.querySelector('.tournois');
    if (!tournamentsSection || !window.calendarConfig || !window.CalendarUtils) {
        return;
    }

    const { apiKey, teams } = window.calendarConfig;
    const tournamentsLoading = document.querySelector('.tournaments-loading');
    const tournamentsError = document.querySelector('.tournaments-error');
    const tournamentsGrid = document.querySelector('.tournaments-grid');
    const noTournaments = document.querySelector('.no-tournaments');

    // Initialise le loader de calendrier
    const calendarLoader = new window.CalendarUtils.CalendarLoader({
        apiKey,
        teams,
        onLoadStart: showLoading,
        onLoadComplete: (allEvents) => {
            // Filtre uniquement les tournois
            const tournaments = filterTournaments(allEvents);
            
            // Affiche les tournois
            renderTournaments(tournaments);
        },
        onError: showError
    });

    /**
     * Charge les événements de tous les calendriers
     */
    function loadAllCalendars() {
        const today = new Date();
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);

        // On charge uniquement les 2 prochaines semaines
        calendarLoader.loadAll({
            timeMin: today,
            timeMax: twoWeeksLater
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
     * Affiche les tournois
     * @param {Array} tournaments - Liste des tournois à afficher
     */
    function renderTournaments(tournaments) {
        // Fusionne les tournois identiques
        const mergedTournaments = window.CalendarUtils.mergeIdenticalEvents(tournaments);
        
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
                const tournamentCard = window.CalendarUtils.createEventCard(tournament, true);
                tournamentsGrid.appendChild(tournamentCard);
            });
            
            hideLoading();
            tournamentsGrid.style.display = 'grid';
            noTournaments.style.display = 'none';
        }
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
