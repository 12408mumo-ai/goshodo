import { createAdminCookie, adminCookieOptions, expiredAdminCookie, hasAdminAccess, cors } from './admin-guard.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method === 'GET') return res.status(200).json({ authenticated: hasAdminAccess(req) });
  if (req.method === 'POST') { const { password } = req.body || {}; if (password !== (process.env.ADMIN_PASSWORD || 'Rafna2026!')) return res.status(401).json({ error: 'Incorrect password' }); res.setHeader('Set-Cookie', `rafna_admin=${encodeURIComponent(createAdminCookie())}; ${adminCookieOptions}`); return res.status(200).json({ authenticated: true }); }
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', `rafna_admin=; ${expiredAdminCookie}`); return res.status(200).json({ authenticated: false }); }
  return res.status(405).json({ error: 'Method not allowed' });
}
