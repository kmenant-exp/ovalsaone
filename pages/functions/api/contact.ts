import type { PagesFunction, EventContext } from '@cloudflare/workers-types';

/**
 * Environment variables for the Pages Function
 */
interface Env {
  RESEND_API_KEY: string;
  SMTP_FROM: string;
  CONTACT_EMAIL: string;
}

/**
 * Contact form data model
 */
interface ContactForm {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  sujet: string;
  message: string;
  dateEnvoi?: string;
  source?: string;
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

function successResponse(message: string): Response {
  return jsonResponse({
    Success: true,
    Message: message,
  });
}

// =============================================================================
// Validation
// =============================================================================

const VALIDATION_RULES = {
  nom: { min: 2, max: 50, required: true },
  prenom: { min: 2, max: 50, required: true },
  email: { required: true },
  telephone: { required: false },
  sujet: { min: 5, max: 100, required: true },
  message: { min: 10, max: 1000, required: true },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

function validateContactForm(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({ field: 'form', message: 'Données invalides' });
    return errors;
  }

  const form = data as Partial<ContactForm>;

  // Nom validation
  if (!form.nom || typeof form.nom !== 'string' || form.nom.trim() === '') {
    errors.push({ field: 'nom', message: 'Le nom est requis' });
  } else if (form.nom.length < VALIDATION_RULES.nom.min || form.nom.length > VALIDATION_RULES.nom.max) {
    errors.push({
      field: 'nom',
      message: `Le nom doit contenir entre ${VALIDATION_RULES.nom.min} et ${VALIDATION_RULES.nom.max} caractères`,
    });
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

  // Email validation
  if (!form.email || typeof form.email !== 'string' || form.email.trim() === '') {
    errors.push({ field: 'email', message: "L'email est requis" });
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.push({ field: 'email', message: "L'email n'est pas valide" });
  }

  // Téléphone validation (optional)
  if (form.telephone && typeof form.telephone === 'string' && form.telephone.trim() !== '') {
    if (!PHONE_REGEX.test(form.telephone.replace(/\s/g, ''))) {
      errors.push({ field: 'telephone', message: "Le numéro de téléphone n'est pas valide" });
    }
  }

  // Sujet validation
  if (!form.sujet || typeof form.sujet !== 'string' || form.sujet.trim() === '') {
    errors.push({ field: 'sujet', message: 'Le sujet est requis' });
  } else if (form.sujet.length < VALIDATION_RULES.sujet.min || form.sujet.length > VALIDATION_RULES.sujet.max) {
    errors.push({
      field: 'sujet',
      message: `Le sujet doit contenir entre ${VALIDATION_RULES.sujet.min} et ${VALIDATION_RULES.sujet.max} caractères`,
    });
  }

  // Message validation
  if (!form.message || typeof form.message !== 'string' || form.message.trim() === '') {
    errors.push({ field: 'message', message: 'Le message est requis' });
  } else if (form.message.length < VALIDATION_RULES.message.min || form.message.length > VALIDATION_RULES.message.max) {
    errors.push({
      field: 'message',
      message: `Le message doit contenir entre ${VALIDATION_RULES.message.min} et ${VALIDATION_RULES.message.max} caractères`,
    });
  }

  return errors;
}

// =============================================================================
// Email Service
// =============================================================================

const RESEND_API_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createContactEmailHtml(form: ContactForm): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const messageHtml = form.message.replace(/\n/g, '<br>');
  const telephone = form.telephone || 'Non renseigné';

  return `
    <h2>Nouveau message de contact - Site Oval Saône</h2>
    <h3>Informations du contact :</h3>
    <ul>
      <li><strong>Nom :</strong> ${escapeHtml(form.nom)}</li>
      <li><strong>Prénom :</strong> ${escapeHtml(form.prenom)}</li>
      <li><strong>Email :</strong> ${escapeHtml(form.email)}</li>
      <li><strong>Téléphone :</strong> ${escapeHtml(telephone)}</li>
      <li><strong>Sujet :</strong> ${escapeHtml(form.sujet)}</li>
    </ul>
    
    <h3>Message :</h3>
    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f1a;">
      ${messageHtml}
    </div>
    
    <hr>
    <p><small>Message envoyé depuis le site web de l'Oval Saône le ${dateStr}</small></p>
  `;
}

async function sendContactEmail(form: ContactForm, env: Env): Promise<void> {
  // Check if API key is configured
  if (!env.RESEND_API_KEY) {
    // Development mode: log instead of sending
    console.log('=== EMAIL SIMULATION ===');
    console.log(`From: Oval Saône Website <${env.SMTP_FROM}>`);
    console.log(`To: ${env.CONTACT_EMAIL}`);
    console.log(`Reply-To: ${form.prenom} ${form.nom} <${form.email}>`);
    console.log(`Subject: [Contact] ${form.sujet}`);
    console.log(`Body: ${createContactEmailHtml(form)}`);
    console.log('========================');
    return;
  }

  // Send via Resend API
  const response = await fetch(RESEND_API_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Oval Saône Website <${env.SMTP_FROM}>`,
      to: [env.CONTACT_EMAIL],
      reply_to: form.email,
      subject: `[Contact] ${form.sujet}`,
      html: createContactEmailHtml(form),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  console.log(`Email de contact envoyé pour ${form.prenom} ${form.nom}`);
}

// =============================================================================
// Pages Function Handlers
// =============================================================================

/**
 * Handle OPTIONS preflight request
 */
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
};

/**
 * Handle POST request for contact form
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Traitement du formulaire de contact');

  try {
    const { request, env } = context;

    // Parse request body
    const body = await request.text();

    if (!body) {
      return errorResponse('Corps de la requête vide');
    }

    let formData: unknown;
    try {
      formData = JSON.parse(body);
    } catch {
      return errorResponse('Format JSON invalide');
    }

    // Validate form data
    const validationErrors = validateContactForm(formData);
    if (validationErrors.length > 0) {
      return errorResponse(
        'Données invalides',
        400,
        validationErrors.map((e) => e.message)
      );
    }

    const contactForm = formData as ContactForm;

    // Send email
    await sendContactEmail(contactForm, env);

    console.log(`Email de contact envoyé pour ${contactForm.prenom} ${contactForm.nom}`);

    return successResponse('Votre message a été envoyé avec succès. Nous vous contacterons bientôt.');
  } catch (error) {
    console.error('Erreur lors du traitement du formulaire de contact:', error);
    return errorResponse('Une erreur interne est survenue. Veuillez réessayer plus tard.', 500);
  }
};
