import { buildSession, requireUser, writeJson } from '../../_lib';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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

  return writeJson(res, 200, buildSession(requestedSessionId));
}