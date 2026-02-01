import { Env, getCookie, verifyJWT, jsonResponse, Convocation } from '../_shared';

// Get convocations with filters
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
    const url = new URL(request.url);
    const eventKey = url.searchParams.get('event');
    const response = url.searchParams.get('response');
    
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
    
    const stmt = env.DB.prepare(query);
    const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all<Convocation>();
    
    return jsonResponse({ success: true, data: result.results });
  } catch (err) {
    console.error('Convocations query error:', err);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
};
