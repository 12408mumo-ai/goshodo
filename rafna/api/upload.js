import supabase from './db-client.js';

const ADMIN_KEY = 'Rafna2026!';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const safeName = String(fileName).toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const path = `products/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType: contentType || 'image/jpeg', upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
