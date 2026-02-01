import { Env, getBaseUrl, deleteCookieHeader } from '../_shared';

// Logout - clear session cookie
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const baseUrl = getBaseUrl(request);
  
  const cookie = deleteCookieHeader('session', '/');
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${baseUrl}/login.html`,
      'Set-Cookie': cookie,
    },
  });
};
