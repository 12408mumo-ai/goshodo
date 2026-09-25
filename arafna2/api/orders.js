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
    if (req.method === 'POST') {
      const { product_id, product_title, quantity, unit_price, total, fulfillment_type, full_name, phone, location } = req.body;
      if (!product_title || !full_name || !phone || !fulfillment_type) {
        return res.status(400).json({ error: 'Missing required order fields.' });
      }
      const { data, error } = await supabase
        .from('orders')
        .insert({
          product_id: product_id || null,
          product_title: String(product_title),
          quantity: Number(quantity) || 1,
          unit_price: Number(unit_price) || 0,
          total: Number(total) || 0,
          fulfillment_type: String(fulfillment_type),
          full_name: String(full_name).trim(),
          phone: String(phone).trim(),
          location: location ? String(location).trim() : null,
          status: 'new',
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id || !status) return res.status(400).json({ error: 'id and status are required.' });
      const { data, error } = await supabase
        .from('orders')
        .update({ status: String(status) })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required.' });
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /orders error:', err);
    res.status(500).json({ error: err.message });
  }
}
