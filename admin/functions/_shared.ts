// Shared types and utilities for admin functions

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

export interface Convocation {
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

export interface EventOption {
  event_key: string;
  event_name: string;
  event_date: string;
}

export interface Stats {
  total: number;
  present: number;
  absent: number;
  pending: number;
  needsCarpool: number;
  seatsOffered: number;
}

// JWT utilities
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

export async function createJWT(payload: object, secret: string): Promise<string> {
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

export async function verifyJWT(token: string, secret: string): Promise<{ email: string; name: string } | null> {
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

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [cookieName, ...cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue.join('=');
    }
  }
  return null;
}

export function setCookieHeader(name: string, value: string, options: { maxAge?: number; httpOnly?: boolean; secure?: boolean; sameSite?: string; path?: string } = {}): string {
  let cookie = `${name}=${value}`;
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.path) cookie += `; Path=${options.path}`;
  return cookie;
}

export function deleteCookieHeader(name: string, path: string = '/'): string {
  return `${name}=; Max-Age=0; Path=${path}`;
}

export function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function jsonResponse(data: unknown, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}
