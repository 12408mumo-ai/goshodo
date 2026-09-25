import supabase from './db-client.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Rafna2026!';

function isAdmin(req) {
  return req.headers['x-admin-password'] === ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-password');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { name, image_url } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Category name is required.' });
      }
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: String(name).trim(), image_url: image_url ? String(image_url).trim() : null })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, name, image_url } = req.body;
      if (!id) return res.status(400).json({ error: 'Category id is required.' });
      const patch = {};
      if (name !== undefined) patch.name = String(name).trim();
      if (image_url !== undefined) patch.image_url = image_url ? String(image_url).trim() : null;
      const { data, error } = await supabase
        .from('categories')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Category id is required.' });
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /categories error:', err);
    res.status(500).json({ error: err.message });
  }
}
