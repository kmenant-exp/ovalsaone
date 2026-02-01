import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

// Types
interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

interface Convocation {
  id: number;
  event_name: string;
  event_date: string;
  first_name: string;
  last_name: string;
  email: string;
  response: string;
  needs_carpool: number;
  carpool_seats: number;
  created_at: string;
  updated_at: string;
}

interface EventOption {
  event_key: string;
  event_name: string;
  event_date: string;
}

interface Stats {
  total: number;
  present: number;
  absent: number;
  pending: number;
  needsCarpool: number;
  seatsOffered: number;
}

// JWT utilities (simple implementation)
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

async function createJWT(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${data}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<{ email: string; name: string } | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    
    const data = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = Uint8Array.from(base64UrlDecode(encodedSignature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(data));
    
    if (!isValid) return null;
    
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Get base URL for redirects
function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

// ============= AUTH ROUTES =============

// Redirect to Google OAuth consent screen
app.get('/auth/google', (c) => {
  const baseUrl = getBaseUrl(c.req.raw);
  const redirectUri = `${baseUrl}/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Handle OAuth callback
app.get('/auth/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');
  const baseUrl = getBaseUrl(c.req.raw);
  
  if (error || !code) {
    return c.redirect('/login.html?error=auth_failed');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return c.redirect('/login.html?error=token_failed');
    }
    
    const tokens: GoogleTokenResponse = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userResponse.ok) {
      return c.redirect('/login.html?error=user_info_failed');
    }
    
    const userInfo: GoogleUserInfo = await userResponse.json();
    
    // Check if user is in admin_users table
    const adminUser = await c.env.DB.prepare(
      'SELECT email, name FROM admin_users WHERE email = ?'
    ).bind(userInfo.email).first();
    
    if (!adminUser) {
      return c.redirect('/login.html?error=not_authorized');
    }
    
    // Create JWT session token (24 hour expiry)
    const jwt = await createJWT(
      {
        email: userInfo.email,
        name: userInfo.name || adminUser.name,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      c.env.JWT_SECRET
    );
    
    // Set cookie and redirect to dashboard
    setCookie(c, 'session', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    
    return c.redirect('/');
  } catch (err) {
    console.error('Auth callback error:', err);
    return c.redirect('/login.html?error=server_error');
  }
});

// Logout
app.get('/auth/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' });
  return c.redirect('/login.html');
});

// Check auth status
app.get('/auth/me', async (c) => {
  const session = getCookie(c, 'session');
  
  if (!session) {
    return c.json({ authenticated: false }, 401);
  }
  
  const user = await verifyJWT(session, c.env.JWT_SECRET);
  
  if (!user) {
    return c.json({ authenticated: false }, 401);
  }
  
  return c.json({ authenticated: true, user });
});

// ============= AUTH MIDDLEWARE =============

app.use('/api/*', async (c, next) => {
  const session = getCookie(c, 'session');
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const user = await verifyJWT(session, c.env.JWT_SECRET);
  
  if (!user) {
    return c.json({ error: 'Invalid session' }, 401);
  }
  
  // Store user in context for later use
  c.set('user' as never, user);
  
  await next();
});

// ============= API ROUTES =============

// Get distinct events for dropdown
app.get('/api/events', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT DISTINCT 
        event_name || ' - ' || event_date as event_key,
        event_name,
        event_date
      FROM convocations
      ORDER BY event_date DESC, event_name ASC
    `).all<EventOption>();
    
    return c.json({ success: true, data: result.results });
  } catch (err) {
    console.error('Events query error:', err);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Get convocations with filters
app.get('/api/convocations', async (c) => {
  try {
    const eventKey = c.req.query('event');
    const response = c.req.query('response');
    
    let query = 'SELECT * FROM convocations WHERE 1=1';
    const params: string[] = [];
    
    if (eventKey) {
      // Parse event_key back to event_name and event_date
      const lastDash = eventKey.lastIndexOf(' - ');
      if (lastDash > 0) {
        const eventName = eventKey.substring(0, lastDash);
        const eventDate = eventKey.substring(lastDash + 3);
        query += ' AND event_name = ? AND event_date = ?';
        params.push(eventName, eventDate);
      }
    }
    
    if (response && response !== 'all') {
      // Handle both 'présent' and 'present' variants
      if (response === 'present') {
        query += " AND (response = 'présent' OR response = 'present')";
      } else {
        query += ' AND response = ?';
        params.push(response);
      }
    }
    
    query += ' ORDER BY last_name ASC, first_name ASC';
    
    const stmt = c.env.DB.prepare(query);
    const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all<Convocation>();
    
    return c.json({ success: true, data: result.results });
  } catch (err) {
    console.error('Convocations query error:', err);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Get stats for an event
app.get('/api/stats', async (c) => {
  try {
    const eventKey = c.req.query('event');
    
    if (!eventKey) {
      return c.json({ success: true, data: null });
    }
    
    // Parse event_key back to event_name and event_date
    const lastDash = eventKey.lastIndexOf(' - ');
    if (lastDash <= 0) {
      return c.json({ success: false, error: 'Invalid event key' }, 400);
    }
    
    const eventName = eventKey.substring(0, lastDash);
    const eventDate = eventKey.substring(lastDash + 3);
    
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN response IN ('présent', 'present') THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN response = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN response = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN needs_carpool = 1 THEN 1 ELSE 0 END) as needs_carpool,
        SUM(carpool_seats) as seats_offered
      FROM convocations
      WHERE event_name = ? AND event_date = ?
    `).bind(eventName, eventDate).first<{
      total: number;
      present: number;
      absent: number;
      pending: number;
      needs_carpool: number;
      seats_offered: number;
    }>();
    
    if (!result) {
      return c.json({ success: true, data: null });
    }
    
    const stats: Stats = {
      total: result.total || 0,
      present: result.present || 0,
      absent: result.absent || 0,
      pending: result.pending || 0,
      needsCarpool: result.needs_carpool || 0,
      seatsOffered: result.seats_offered || 0,
    };
    
    return c.json({ success: true, data: stats });
  } catch (err) {
    console.error('Stats query error:', err);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Export for Cloudflare Pages Functions
export const onRequest: PagesFunction<Env> = async (context) => {
  const response = await app.fetch(context.request, context.env, context);

  if (response.status === 404) {
    return context.next();
  }

  return response;
};

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: () => Promise<Response>;
}) => Response | Promise<Response>;
