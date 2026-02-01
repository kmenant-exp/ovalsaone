import { Env, getCookie, verifyJWT, jsonResponse, EventOption } from '../_shared';

// Get distinct events for dropdown
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // Auth check
  const session = getCookie(request, 'session');
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const user = await verifyJWT(session, env.JWT_SECRET);
  if (!user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }
  
  try {
    const result = await env.DB.prepare(`
      SELECT DISTINCT 
        event_name || ' - ' || event_date as event_key,
        event_name,
        event_date
      FROM convocations
      ORDER BY event_date DESC, event_name ASC
    `).all<EventOption>();
    
    return jsonResponse({ success: true, data: result.results });
  } catch (err) {
    console.error('Events query error:', err);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
};
