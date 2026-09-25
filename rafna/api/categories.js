import supabase from './db-client.js';

const ADMIN_KEY = 'Rafna2026!';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Mutations require the admin key
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const { name } = req.body || {};
      const trimmed = name ? String(name).trim() : '';
      if (!trimmed) return res.status(400).json({ error: 'Category name is required' });

      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', trimmed)
        .limit(1);
      if (checkError) throw checkError;
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'That category already exists' });
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({ name: trimmed })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing category id' });
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
