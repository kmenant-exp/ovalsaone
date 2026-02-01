import { Env, getBaseUrl, createJWT, setCookieHeader } from '../_shared';

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

// Handle OAuth callback
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const baseUrl = getBaseUrl(request);
  
  if (error || !code) {
    return Response.redirect(`${baseUrl}/login.html?error=auth_failed`, 302);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return Response.redirect(`${baseUrl}/login.html?error=token_failed`, 302);
    }
    
    const tokens: GoogleTokenResponse = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userResponse.ok) {
      return Response.redirect(`${baseUrl}/login.html?error=user_info_failed`, 302);
    }
    
    const userInfo: GoogleUserInfo = await userResponse.json();
    
    // Check if user is in admin_users table
    const adminUser = await env.DB.prepare(
      'SELECT email, name FROM admin_users WHERE email = ?'
    ).bind(userInfo.email).first();
    
    if (!adminUser) {
      return Response.redirect(`${baseUrl}/login.html?error=not_authorized`, 302);
    }
    
    // Create JWT session token (24 hour expiry)
    const jwt = await createJWT(
      {
        email: userInfo.email,
        name: userInfo.name || adminUser.name,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      env.JWT_SECRET
    );
    
    // Set cookie and redirect to dashboard
    const cookie = setCookieHeader('session', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${baseUrl}/`,
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    console.error('Auth callback error:', err);
    return Response.redirect(`${baseUrl}/login.html?error=server_error`, 302);
  }
};
