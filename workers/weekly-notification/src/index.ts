/**
 * Weekly Notification Worker
 * Cloudflare Worker with Cron Trigger
 * Sends weekly convocation notifications every Thursday at 8:00 AM
 */

export interface Env {
  // D1 Database
  DB: D1Database;

  // Resend API
  RESEND_API_KEY: string;
  SMTP_FROM: string;

  // Notification recipients (semicolon-separated)
  NOTIFICATION_EMAILS: string;
}

export interface Convocation {
  id: number;
  event_name: string;
  event_date: string;
  first_name: string;
  last_name: string;
  email: string;
  response: string;
  needs_carpool: number; // 0 or 1 in SQLite
  carpool_seats: number;
  category: string | null;
  created_at: string;
  updated_at: string;
}

interface EventSummary {
  eventName: string;
  eventDate: string;
  category: string;
  totalResponses: number;
  nombrePresents: number;
  nombreAbsents: number;
  besoinCovoiturage: number;
  placesProposees: number;
}

// =============================================================================
// D1 Database Service
// =============================================================================

async function getUpcomingConvocations(db: D1Database): Promise<Convocation[]> {
  const today = new Date().toISOString().split('T')[0];
  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`📊 Querying D1 for convocations between ${today} and ${inSevenDays}...`);

  const { results } = await db
    .prepare(
      `SELECT * FROM convocations 
       WHERE event_date >= ? AND event_date <= ? 
       ORDER BY event_date, last_name`
    )
    .bind(today, inSevenDays)
    .all<Convocation>();

  const convocations = results || [];
  console.log(`✅ Found ${convocations.length} convocation(s)`);
  return convocations;
}

// =============================================================================
// Email Service
// =============================================================================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function generateEventSummaries(convocations: Convocation[]): EventSummary[] {
  const grouped = new Map<string, Convocation[]>();

  for (const conv of convocations) {
    const key = `${conv.event_name}|${conv.event_date}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(conv);
  }

  const summaries: EventSummary[] = [];
  for (const [key, group] of grouped) {
    const [eventName, eventDate] = key.split('|');
    // Get unique categories for this event (excluding nulls)
    const categories = [...new Set(group.map((c) => c.category).filter((c) => c))];
    summaries.push({
      eventName,
      eventDate,
      category: categories.join(', '),
      totalResponses: group.length,
      nombrePresents: group.filter((c) => c.response.toLowerCase() === 'présent' || c.response.toLowerCase() === 'present').length,
      nombreAbsents: group.filter((c) => c.response.toLowerCase() === 'absent').length,
      besoinCovoiturage: group.filter((c) => c.needs_carpool === 1).length,
      placesProposees: group.reduce((sum, c) => sum + (c.carpool_seats || 0), 0),
    });
  }

  return summaries.sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.eventName.localeCompare(b.eventName));
}

function generateHtmlEmail(convocations: Convocation[]): string {
  const eventSummaries = generateEventSummaries(convocations);
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #0066cc; margin-bottom: 10px; }
        h3 { color: #0066cc; margin-top: 30px; margin-bottom: 10px; font-size: 1.2em; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th { background-color: #0066cc; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #666; font-style: italic; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .badge-present { background-color: #d4edda; color: #155724; }
        .badge-absent { background-color: #f8d7da; color: #721c24; }
        .badge-maybe { background-color: #fff3cd; color: #856404; }
        .covoiturage-yes { color: #28a745; font-weight: bold; }
        .covoiturage-no { color: #999; }
    </style>
</head>
<body>
    <h2>🏉 Convocations de la semaine</h2>
    <p>Voici les convocations pour les événements des 7 prochains jours :</p>

    <h3>📊 Synthèse par événement</h3>
    <table>
        <thead>
            <tr>
                <th>Événement</th>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Total</th>
                <th>✅ Présents</th>
                <th>❌ Absents</th>
                <th>🚗 Besoin covoiturage</th>
                <th>🪑 Places proposées</th>
            </tr>
        </thead>
        <tbody>`;

  for (const summary of eventSummaries) {
    html += `
            <tr>
                <td><strong>${escapeHtml(summary.eventName)}</strong></td>
                <td>${escapeHtml(summary.category) || ''}</td>
                <td>${formatDate(summary.eventDate)}</td>
                <td>${summary.totalResponses}</td>
                <td>${summary.nombrePresents}</td>
                <td>${summary.nombreAbsents}</td>
                <td>${summary.besoinCovoiturage}</td>
                <td>${summary.placesProposees}</td>
            </tr>`;
  }

  html += `
        </tbody>
    </table>

    <h3>📋 Détail des réponses</h3>
    <table>
        <thead>
            <tr>
                <th>Événement</th>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>Covoiturage</th>
                <th>Places</th>
            </tr>
        </thead>
        <tbody>`;

  for (const conv of convocations) {
    const responseLower = conv.response.toLowerCase();
    const statutClass =
      responseLower === 'présent' || responseLower === 'present' ? 'badge-present' : responseLower === 'absent' ? 'badge-absent' : 'badge-maybe';

    const covoiturageClass = conv.needs_carpool === 1 ? 'covoiturage-yes' : 'covoiturage-no';
    const covoiturageText = conv.needs_carpool === 1 ? 'Oui' : 'Non';

    html += `
            <tr>
                <td><strong>${escapeHtml(conv.event_name)}</strong></td>
                <td>${conv.category ? escapeHtml(conv.category) : ''}</td>
                <td>${formatDate(conv.event_date)}</td>
                <td>${escapeHtml(conv.first_name)}</td>
                <td>${escapeHtml(conv.last_name)}</td>
                <td><span class='badge ${statutClass}'>${escapeHtml(conv.response)}</span></td>
                <td class='${covoiturageClass}'>${covoiturageText}</td>
                <td>${conv.carpool_seats || 0}</td>
            </tr>`;
  }

  html += `
        </tbody>
    </table>
    <p class='footer'>Email généré automatiquement le ${dateStr}</p>
</body>
</html>`;

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function sendNotificationEmail(convocations: Convocation[], env: Env): Promise<void> {
  if (convocations.length === 0) {
    console.log('ℹ️ No convocations to send - skipping email');
    return;
  }

  const recipients = env.NOTIFICATION_EMAILS?.split(';')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (!recipients || recipients.length === 0) {
    console.log('⚠️ NOTIFICATION_EMAILS not configured - no recipients');
    return;
  }

  const htmlBody = generateHtmlEmail(convocations);
  const subject = `Convocations de la semaine - ${new Date().toLocaleDateString('fr-FR')}`;

  // Check if Resend API key is configured
  if (!env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY not configured - logging email content instead:');
    console.log(`From: ${env.SMTP_FROM}`);
    console.log(`To: ${recipients.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log('Body: [HTML content]');
    return;
  }

  // Send via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Oval Saône Convocations <${env.SMTP_FROM}>`,
      to: recipients,
      subject: subject,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Resend API error: ${error}`);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  console.log(`✅ Email sent successfully to ${recipients.length} recipient(s)`);
}

// =============================================================================
// Worker Entry Point
// =============================================================================

export default {
  /**
   * Cron Trigger Handler
   * Schedule: Every Thursday at 8:00 AM UTC
   * Cron expression: "0 8 * * 4" (minute, hour, day-of-month, month, day-of-week)
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`🕒 Weekly notification triggered at: ${new Date().toISOString()}`);
    console.log(`Cron pattern: ${event.cron}`);

    try {
      // Step 1: Query upcoming convocations from D1 database
      console.log('📊 Fetching upcoming convocations...');
      const convocations = await getUpcomingConvocations(env.DB);

      if (convocations.length === 0) {
        console.log('ℹ️ No convocations found for the next 7 days - skipping email');
        return;
      }

      console.log(`✅ Found ${convocations.length} convocation(s)`);

      // Step 2: Generate HTML and send email
      console.log('📧 Sending notification email...');
      await sendNotificationEmail(convocations, env);

      console.log('✅ Weekly notification completed successfully');
    } catch (error) {
      console.error(`❌ Error in weekly notification:`, error);
      throw error;
    }
  },

  /**
   * HTTP Handler for manual testing
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Manual trigger endpoint (protected by secret header)
    if (url.pathname === '/trigger' && request.method === 'POST') {
      const authHeader = request.headers.get('X-Trigger-Secret');
      const expectedSecret = env.RESEND_API_KEY?.substring(0, 16); // Use first 16 chars of API key as simple auth

      if (!authHeader || authHeader !== expectedSecret) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const convocations = await getUpcomingConvocations(env.DB);
        await sendNotificationEmail(convocations, env);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Email sent with ${convocations.length} convocation(s)`,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', worker: 'weekly-notification' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
