import crypto from 'crypto';
const secret = () => process.env.ADMIN_PASSWORD || 'Rafna2026!';
function sign(value) { return crypto.createHmac('sha256', secret()).update(value).digest('hex'); }
export function createAdminCookie() { const value = `${Date.now()}.${crypto.randomBytes(16).toString('hex')}`; return `${value}.${sign(value)}`; }
export function hasAdminAccess(req) { const cookie = req.headers.cookie || ''; const match = cookie.match(/(?:^|;\s*)rafna_admin=([^;]+)/); if (!match) return false; const parts = decodeURIComponent(match[1]).split('.'); if (parts.length !== 3) return false; const [timestamp, nonce, signature] = parts; const value = `${timestamp}.${nonce}`; const age = Date.now() - Number(timestamp); if (!Number.isFinite(age) || age < 0 || age > 8 * 60 * 60 * 1000) return false; const expected = sign(value); return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); }
export const adminCookieOptions = 'Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=28800';
export const expiredAdminCookie = 'Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0';
export function cors(req, res) { res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Credentials', 'true'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); if (req.method === 'OPTIONS') { res.status(204).end(); return true; } return false; }
