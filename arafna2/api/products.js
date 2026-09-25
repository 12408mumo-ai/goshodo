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
      const { category, featured, limit } = req.query;
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      if (featured === 'true') query = query.eq('featured', true);
      if (limit) query = query.limit(parseInt(limit, 10));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { title, category, price, description, image_url, featured } = req.body;
      if (!title || !category || price === undefined || !image_url) {
        return res.status(400).json({ error: 'Title, category, price and image are required.' });
      }
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: String(title).trim(),
          category: String(category).trim(),
          price: Number(price),
          description: String(description || '').trim(),
          image_url: String(image_url).trim(),
          featured: Boolean(featured),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, title, category, price, description, image_url, featured } = req.body;
      if (!id) return res.status(400).json({ error: 'Product id is required.' });
      const patch = {};
      if (title !== undefined) patch.title = String(title).trim();
      if (category !== undefined) patch.category = String(category).trim();
      if (price !== undefined) patch.price = Number(price);
      if (description !== undefined) patch.description = String(description).trim();
      if (image_url !== undefined) patch.image_url = String(image_url).trim();
      if (featured !== undefined) patch.featured = Boolean(featured);
      const { data, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product id is required.' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /products error:', err);
    res.status(500).json({ error: err.message });
  }
}
