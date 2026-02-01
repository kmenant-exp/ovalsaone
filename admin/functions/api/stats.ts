import { Env, getCookie, verifyJWT, jsonResponse, Stats } from '../_shared';

// Get stats for an event
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
    
    if (!eventKey) {
      return jsonResponse({ success: true, data: null });
    }
    
    // Parse event_key back to event_name and event_date
    const lastDash = eventKey.lastIndexOf(' - ');
    if (lastDash <= 0) {
      return jsonResponse({ success: false, error: 'Invalid event key' }, 400);
    }
    
    const eventName = eventKey.substring(0, lastDash);
    const eventDate = eventKey.substring(lastDash + 3);
    
    const result = await env.DB.prepare(`
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
      return jsonResponse({ success: true, data: null });
    }
    
    const stats: Stats = {
      total: result.total || 0,
      present: result.present || 0,
      absent: result.absent || 0,
      pending: result.pending || 0,
      needsCarpool: result.needs_carpool || 0,
      seatsOffered: result.seats_offered || 0,
    };
    
    return jsonResponse({ success: true, data: stats });
  } catch (err) {
    console.error('Stats query error:', err);
    return jsonResponse({ success: false, error: 'Database error' }, 500);
  }
};
