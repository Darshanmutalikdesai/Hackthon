import { requireUser, writeJson } from '../../../_lib';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return writeJson(res, 405, { message: 'Method not allowed' });
  }

  const auth = requireUser(req);
  if ('status' in auth) {
    return writeJson(res, auth.status, { message: auth.message });
  }

  const { sessionId } = req.query;
  const requestedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  if (!requestedSessionId) {
    return writeJson(res, 400, { message: 'Session ID is required' });
  }

  const savedAt = new Date().toISOString();
  const debriefId = `debrief-${requestedSessionId}`;

  return writeJson(res, 201, {
    debriefId,
    sessionId: requestedSessionId,
    savedAt,
  });
}