/**
 * Oval Saône Admin Dashboard - Alpine.js App
 */

function dashboard() {
    return {
        // State
        loading: true,
        user: null,
        events: [],
        convocations: [],
        allConvocations: [],
        stats: null,
        selectedEvent: '',
        selectedStatus: 'all',
        selectedCategory: 'all',
        selectedCarpool: 'all',
        categories: [],

        // Computed
        get carpoolBalance() {
            if (!this.stats) return 0;
            return this.stats.seatsOffered - this.stats.needsCarpool;
        },

        // Lifecycle
        async init() {
            try {
                // Check authentication
                const authRes = await fetch('/auth/me');
                if (!authRes.ok) {
                    window.location.href = '/login.html';
                    return;
                }
                const authData = await authRes.json();
                this.user = authData.user;

                // Load events
                await this.loadEvents();
            } catch (err) {
                console.error('Init error:', err);
                window.location.href = '/login.html';
            } finally {
                this.loading = false;
            }
        },

        // Methods
        async loadEvents() {
            try {
                const res = await fetch('/api/events');
                const data = await res.json();
                if (data.success) {
                    this.events = data.data;
                }
            } catch (err) {
                console.error('Load events error:', err);
            }
        },

        async loadData() {
            if (!this.selectedEvent) {
                this.convocations = [];
                this.stats = null;
                return;
            }

            this.loading = true;
            try {
                await Promise.all([
                    this.loadConvocations(),
                    this.loadStats()
                ]);
            } finally {
                this.loading = false;
            }
        },

        async loadConvocations() {
            if (!this.selectedEvent) return;

            try {
                const params = new URLSearchParams({
                    event: this.selectedEvent
                });
                if (this.selectedStatus !== 'all') {
                    params.set('response', this.selectedStatus);
                }

                const res = await fetch(`/api/convocations?${params}`);
                const data = await res.json();
                if (data.success) {
                    this.allConvocations = data.data;
                    this.updateCategories();
                    this.filterConvocations();
                }
            } catch (err) {
                console.error('Load convocations error:', err);
            }
        },

        async loadStats() {
            if (!this.selectedEvent) return;

            try {
                const params = new URLSearchParams({
                    event: this.selectedEvent
                });

                const res = await fetch(`/api/stats?${params}`);
                const data = await res.json();
                if (data.success) {
                    this.stats = data.data;
                }
            } catch (err) {
                console.error('Load stats error:', err);
            }
        },

        updateCategories() {
            const cats = [...new Set(this.allConvocations.map(c => c.category).filter(c => c))];
            this.categories = cats.sort();
        },

        filterConvocations() {
            let filtered = this.allConvocations;
            
            // Filtre par catégorie
            if (this.selectedCategory !== 'all') {
                filtered = filtered.filter(c => c.category === this.selectedCategory);
            }
            
            // Filtre par covoiturage
            if (this.selectedCarpool === 'need') {
                filtered = filtered.filter(c => c.needs_carpool);
            } else if (this.selectedCarpool === 'offer') {
                filtered = filtered.filter(c => c.carpool_seats > 0);
            }
            
            this.convocations = filtered;
        },

        // Formatters
        formatDate(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr + 'T00:00:00');
                return date.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            } catch {
                return dateStr;
            }
        },

        formatDateTime(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return dateStr;
            }
        },

        normalizeStatus(status) {
            if (!status) return 'pending';
            const s = status.toLowerCase();
            if (s === 'présent' || s === 'present') return 'present';
            if (s === 'absent') return 'absent';
            return 'pending';
        },

        formatStatus(status) {
            const normalized = this.normalizeStatus(status);
            const labels = {
                'present': '✅ Présent',
                'absent': '❌ Absent',
                'pending': '⏳ En attente'
            };
            return labels[normalized] || status;
        },

        // Excel Export
        exportToExcel() {
            if (!this.convocations.length) return;

            // Get current event info for filename
            const currentEvent = this.events.find(e => e.event_key === this.selectedEvent);
            const eventName = currentEvent?.event_name || 'convocations';
            const eventDate = currentEvent?.event_date || new Date().toISOString().split('T')[0];

            // Map convocations to export rows with French labels
            const exportData = this.convocations.map(c => ({
                'Événement': c.event_name || eventName,
                'Date événement': this.formatDate(c.event_date || eventDate),
                'Catégorie': c.category || '',
                'Nom': c.first_name + ' ' + c.last_name,
                'Email': c.email || '',
                'Statut': this.formatStatusText(c.response),
                'Besoin covoiturage': c.needs_carpool ? 'Oui' : 'Non',
                'Places proposées': c.carpool_seats || 0,
                'Date réponse': this.formatDateTime(c.updated_at)
            }));

            // Create worksheet and workbook
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Convocations');

            // Auto-size columns
            const colWidths = [
                { wch: 25 }, // Événement
                { wch: 18 }, // Date événement
                { wch: 12 }, // Catégorie
                { wch: 22 }, // Nom
                { wch: 30 }, // Email
                { wch: 12 }, // Statut
                { wch: 18 }, // Besoin covoiturage
                { wch: 16 }, // Places proposées
                { wch: 18 }  // Date réponse
            ];
            worksheet['!cols'] = colWidths;

            // Generate filename: convocations-{event_name}-{YYYY-MM-DD}.xlsx
            const safeEventName = eventName
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Spaces to dashes
                .toLowerCase()
                .substring(0, 30); // Limit length
            const filename = `convocations-${safeEventName}-${eventDate}.xlsx`;

            // Trigger download
            XLSX.writeFile(workbook, filename);
        },

        formatStatusText(status) {
            const normalized = this.normalizeStatus(status);
            const labels = {
                'present': 'Présent',
                'absent': 'Absent',
                'pending': 'En attente'
            };
            return labels[normalized] || status;
        }
    };
}
