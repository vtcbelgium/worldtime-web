// Deliberately tiny stateless endpoint: no database, user tracking or third-party calls.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (method === 'HEAD') return res.status(200).end();
  return res.status(200).json({ unixMs: Date.now(), source: 'server' });
}
