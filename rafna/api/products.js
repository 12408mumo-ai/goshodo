import supabase from './db-client.js';

const ADMIN_KEY = 'Rafna2026!';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
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
      const { title, category, price, description, image_url } = req.body || {};
      if (!title || !category || !price || !image_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: String(title).trim(),
          category: String(category).trim(),
          price: numericPrice,
          description: description ? String(description).trim() : '',
          image_url,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title, category, price, description, image_url } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing product id' });
      if (!title || !category || !price || !image_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      const { data, error } = await supabase
        .from('products')
        .update({
          title: String(title).trim(),
          category: String(category).trim(),
          price: numericPrice,
          description: description ? String(description).trim() : '',
          image_url,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing product id' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
