import { buildUserMetrics, requireUser, writeJson } from '../../../_lib';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return writeJson(res, 405, { message: 'Method not allowed' });
  }

  const auth = requireUser(req);
  if ('status' in auth) {
    return writeJson(res, auth.status, { message: auth.message });
  }

  const { userId } = req.query;
  const requestedUserId = Array.isArray(userId) ? userId[0] : userId;

  if (requestedUserId !== auth.userId) {
    return writeJson(res, 403, { message: 'Forbidden: Cannot access another user\'s data' });
  }

  return writeJson(res, 200, buildUserMetrics(auth.userId));
}