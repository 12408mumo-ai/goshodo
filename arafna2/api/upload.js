import supabase from './db-client.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Rafna2026!';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { fileName, fileBase64, contentType } = req.body;
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'fileName and fileBase64 are required.' });
    }
    const safe = String(fileName).replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${Date.now()}-${safe}`;
    const buffer = Buffer.from(fileBase64, 'base64');

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType: contentType || 'image/jpeg', upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    return res.status(200).json({ url: urlData.publicUrl, path });
  } catch (err) {
    console.error('API /upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
