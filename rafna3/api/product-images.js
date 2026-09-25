import supabase from './db-client.js';
import { cors, hasAdminAccess } from './admin-guard.js';
import crypto from 'crypto';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!hasAdminAccess(req)) return res.status(401).json({ error: 'Admin access required' });
  try { const { fileName, fileBase64, contentType } = req.body || {}; if (!fileBase64 || !contentType?.startsWith('image/')) return res.status(400).json({ error: 'Choose a valid image.' }); const buffer = Buffer.from(fileBase64, 'base64'); if (buffer.length > 8 * 1024 * 1024) return res.status(413).json({ error: 'Image must be smaller than 8 MB.' }); const extension = String(fileName || '').split('.').pop().replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'jpg'; const path = `${crypto.randomUUID()}.${extension}`; const { error } = await supabase.storage.from('product-images').upload(path, buffer, { contentType, upsert: false }); if (error) throw error; const { data } = supabase.storage.from('product-images').getPublicUrl(path); return res.status(200).json({ url: data.publicUrl }); } catch (err) { console.error('Product image upload error:', err); return res.status(500).json({ error: err.message || 'Image upload failed.' }); }
}
