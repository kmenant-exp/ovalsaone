import { Env, getCookie, verifyJWT, jsonResponse } from '../_shared';

// Check authentication status
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = getCookie(request, 'session');
  
  if (!session) {
    return jsonResponse({ authenticated: false }, 401);
  }
  
  const user = await verifyJWT(session, env.JWT_SECRET);
  
  if (!user) {
    return jsonResponse({ authenticated: false }, 401);
  }
  
  return jsonResponse({ authenticated: true, user });
};
