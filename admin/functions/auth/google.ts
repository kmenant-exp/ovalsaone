import { Env, getBaseUrl } from '../_shared';

// Redirect to Google OAuth consent screen
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
};
