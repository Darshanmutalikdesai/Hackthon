import { requireUser } from '../../../_lib';

const MESSAGE = `You showed strong discipline today in your trading session. Your plan adherence was solid, and the biggest win was how often you waited for your setup instead of forcing a trade.

One area to improve is staying consistent after a small loss. Your next step is to keep execution calm and protect the plan when the market moves fast.`;

function sendEvent(res: any, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const auth = requireUser(req);
  if ('status' in auth) {
    res.status(auth.status).json({ message: auth.message });
    return;
  }

  const { sessionId } = req.query;
  const requestedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  if (!requestedSessionId) {
    res.status(400).json({ message: 'Session ID is required' });
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const tokens = MESSAGE.match(/\S+\s*/g) || [MESSAGE];

  for (let index = 0; index < tokens.length; index += 1) {
    sendEvent(res, 'token', { token: tokens[index], index, sessionId: requestedSessionId });
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  sendEvent(res, 'done', { fullMessage: MESSAGE, sessionId: requestedSessionId });
  res.end();
}