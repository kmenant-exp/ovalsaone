-- Migration: 0002_seed_test_data.sql
-- Description: Insert test data for weekly notification testing
-- Date: 2026-02-01
-- Purpose: Create 20 sample convocation records across 3 tournaments

-- Seed data (appliquer uniquement si la table est vide)
WITH seed(event_name, event_date, first_name, last_name, response, needs_carpool, carpool_seats) AS (
	VALUES
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Pierre', 'Dubois', 'présent', 0, 3),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Marie', 'Martin', 'présent', 1, 0),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Lucas', 'Bernard', 'présent', 0, 2),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Sophie', 'Petit', 'absent', 0, 0),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Thomas', 'Richard', 'présent', 1, 0),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Emma', 'Durand', 'présent', 0, 4),
		('Tournoi Inter-Clubs Lyon', '2026-02-08', 'Hugo', 'Moreau', 'pending', 0, 0),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Léa', 'Laurent', 'présent', 0, 2),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Antoine', 'Simon', 'présent', 1, 0),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Camille', 'Michel', 'présent', 0, 0),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Jules', 'Lefebvre', 'absent', 0, 0),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Chloé', 'Garcia', 'présent', 0, 3),
		('Championnat Régional Villeurbanne', '2026-02-09', 'Nathan', 'Roux', 'pending', 0, 0),
		('Coupe Départementale Caluire', '2026-02-15', 'Inès', 'Blanc', 'présent', 0, 5),
		('Coupe Départementale Caluire', '2026-02-15', 'Maxime', 'Bonnet', 'présent', 1, 0),
		('Coupe Départementale Caluire', 'coupe-15', 'Manon', 'Andre', 'présent', 0, 0),
		('Coupe Départementale Caluire', '2026-02-15', 'Gabriel', 'Rousseau', 'présent', 1, 0),
		('Coupe Départementale Caluire', '2026-02-15', 'Zoé', 'Girard', 'absent', 0, 0),
		('Coupe Départementale Caluire', '2026-02-15', 'Arthur', 'Morel', 'présent', 0, 4),
		('Coupe Départementale Caluire', '2026-02-15', 'Sarah', 'Fournier', 'pending', 0, 0)
)
INSERT INTO convocations (event_name, event_date, first_name, last_name, response, needs_carpool, carpool_seats)
SELECT * FROM seed
WHERE NOT EXISTS (SELECT 1 FROM convocations LIMIT 1);
