import type { PagesFunction } from '@cloudflare/workers-types';

/**
 * Environment variables for the Pages Function
 */
interface Env {
  DB: D1Database;
}

/**
 * Convocation form data model (from frontend)
 */
interface ConvocationForm {
  eventId: string;
  eventDate: string;
  eventName: string;
  equipe: string;
  prenom: string;
  nom: string;
  statut: 'Present' | 'Absent';
  besoinCovoiturage: boolean;
  placesProposees: number;
}

/**
 * API response envelope
 */
interface ApiResponse<T = unknown> {
  Success: boolean;
  Message: string;
  Data?: T;
  Errors?: string[];
}

/**
 * Validation error
 */
interface ValidationError {
  field: string;
  message: string;
}

// =============================================================================
// CORS Headers
// =============================================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// =============================================================================
// Response Helpers
// =============================================================================

function jsonResponse<T>(data: ApiResponse<T>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message: string, status: number = 400, errors?: string[]): Response {
  const body: ApiResponse = {
    Success: false,
    Message: message,
  };
  if (errors) {
    body.Errors = errors;
  }
  return jsonResponse(body, status);
}

function successResponse(message: string, data?: unknown): Response {
  return jsonResponse({
    Success: true,
    Message: message,
    Data: data,
  });
}

// =============================================================================
// Validation
// =============================================================================

const VALIDATION_RULES = {
  prenom: { min: 2, max: 50 },
  nom: { min: 2, max: 50 },
  placesProposees: { min: 0, max: 8 },
};

function validateConvocationForm(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({ field: 'form', message: 'Données invalides' });
    return errors;
  }

  const form = data as Partial<ConvocationForm>;

  // eventName validation
  if (!form.eventName || typeof form.eventName !== 'string' || form.eventName.trim() === '') {
    errors.push({ field: 'eventName', message: "Le nom de l'événement est requis" });
  }

  // eventDate validation
  if (!form.eventDate || typeof form.eventDate !== 'string' || form.eventDate.trim() === '') {
    errors.push({ field: 'eventDate', message: "La date de l'événement est requise" });
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(form.eventDate)) {
      errors.push({ field: 'eventDate', message: 'Format de date invalide (attendu: YYYY-MM-DD)' });
    }
  }

  // Prénom validation
  if (!form.prenom || typeof form.prenom !== 'string' || form.prenom.trim() === '') {
    errors.push({ field: 'prenom', message: 'Le prénom est requis' });
  } else if (form.prenom.length < VALIDATION_RULES.prenom.min || form.prenom.length > VALIDATION_RULES.prenom.max) {
    errors.push({
      field: 'prenom',
      message: `Le prénom doit contenir entre ${VALIDATION_RULES.prenom.min} et ${VALIDATION_RULES.prenom.max} caractères`,
    });
  }

  // Nom validation
  if (!form.nom || typeof form.nom !== 'string' || form.nom.trim() === '') {
    errors.push({ field: 'nom', message: 'Le nom est requis' });
  } else if (form.nom.length < VALIDATION_RULES.nom.min || form.nom.length > VALIDATION_RULES.nom.max) {
    errors.push({
      field: 'nom',
      message: `Le nom doit contenir entre ${VALIDATION_RULES.nom.min} et ${VALIDATION_RULES.nom.max} caractères`,
    });
  }

  // Statut validation
  if (!form.statut || (form.statut !== 'Present' && form.statut !== 'Absent')) {
    errors.push({ field: 'statut', message: 'Le statut doit être "Present" ou "Absent"' });
  }

  // placesProposees validation
  if (form.placesProposees !== undefined && typeof form.placesProposees === 'number') {
    if (form.placesProposees < VALIDATION_RULES.placesProposees.min || form.placesProposees > VALIDATION_RULES.placesProposees.max) {
      errors.push({
        field: 'placesProposees',
        message: `Le nombre de places doit être entre ${VALIDATION_RULES.placesProposees.min} et ${VALIDATION_RULES.placesProposees.max}`,
      });
    }
  }

  return errors;
}

// =============================================================================
// Database Operations
// =============================================================================

async function insertConvocation(db: D1Database, form: ConvocationForm): Promise<number> {
  const response = form.statut === 'Present' ? 'présent' : 'absent';
  const eventDate = form.eventDate.split('T')[0];

  const result = await db
    .prepare(
      `INSERT INTO convocations (event_name, event_date, first_name, last_name, response, needs_carpool, carpool_seats)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id`
    )
    .bind(
      form.eventName.trim(),
      eventDate,
      form.prenom.trim(),
      form.nom.trim(),
      response,
      form.besoinCovoiturage ? 1 : 0,
      form.placesProposees || 0
    )
    .first<{ id: number }>();

  return result?.id || 0;
}

async function updateConvocation(db: D1Database, form: ConvocationForm): Promise<boolean> {
  const response = form.statut === 'Present' ? 'présent' : 'absent';
  const eventDate = form.eventDate.split('T')[0];

  const result = await db
    .prepare(
      `UPDATE convocations 
       SET response = ?, needs_carpool = ?, carpool_seats = ?, updated_at = datetime('now')
       WHERE event_name = ? AND event_date = ? AND first_name = ? AND last_name = ?`
    )
    .bind(
      response,
      form.besoinCovoiturage ? 1 : 0,
      form.placesProposees || 0,
      form.eventName.trim(),
      eventDate,
      form.prenom.trim(),
      form.nom.trim()
    )
    .run();

  return result.meta.changes > 0;
}

async function findExistingConvocation(
  db: D1Database,
  eventName: string,
  eventDate: string,
  firstName: string,
  lastName: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT id FROM convocations 
       WHERE event_name = ? AND event_date = ? AND first_name = ? AND last_name = ?`
    )
    .bind(eventName.trim(), eventDate.split('T')[0], firstName.trim(), lastName.trim())
    .first();

  return result !== null;
}

// =============================================================================
// Request Handlers
// =============================================================================

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    let formData: ConvocationForm;
    try {
      formData = await request.json();
    } catch {
      return errorResponse('Format JSON invalide', 400);
    }

    const validationErrors = validateConvocationForm(formData);
    if (validationErrors.length > 0) {
      return errorResponse(
        'Erreurs de validation',
        400,
        validationErrors.map((e) => `${e.field}: ${e.message}`)
      );
    }

    const exists = await findExistingConvocation(
      env.DB,
      formData.eventName,
      formData.eventDate,
      formData.prenom,
      formData.nom
    );

    if (exists) {
      await updateConvocation(env.DB, formData);
      console.log(`✅ Convocation updated for ${formData.prenom} ${formData.nom} - ${formData.eventName}`);
      return successResponse('Votre réponse a été mise à jour avec succès');
    } else {
      const id = await insertConvocation(env.DB, formData);
      console.log(`✅ Convocation created (id: ${id}) for ${formData.prenom} ${formData.nom} - ${formData.eventName}`);
      return successResponse('Votre réponse a été enregistrée avec succès', { id });
    }
  } catch (error) {
    console.error('❌ Error processing convocation:', error);
    return errorResponse(
      "Une erreur est survenue lors de l'enregistrement de votre réponse",
      500,
      [error instanceof Error ? error.message : 'Erreur inconnue']
    );
  }
};
