import supabase from './db-client.js';
import { cors, hasAdminAccess } from './admin-guard.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'GET') { const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true }); if (error) throw error; return res.status(200).json(data); }
    if (!hasAdminAccess(req)) return res.status(401).json({ error: 'Admin access required' });
    if (req.method === 'POST') { const { title, category, price, description, image_url } = req.body || {}; if (!title || !category || !description || !image_url || !(Number(price) > 0)) return res.status(400).json({ error: 'Complete all product fields.' }); const { data, error } = await supabase.from('products').insert({ title, category, price: Number(price), description, image_url }).select('*').single(); if (error) throw error; return res.status(201).json(data); }
    if (req.method === 'PUT') { const { id, title, category, price, description, image_url } = req.body || {}; if (!id || !title || !category || !description || !image_url || !(Number(price) > 0)) return res.status(400).json({ error: 'Complete all product fields.' }); const { data, error } = await supabase.from('products').update({ title, category, price: Number(price), description, image_url }).eq('id', id).select('*').single(); if (error) throw error; return res.status(200).json(data); }
    if (req.method === 'DELETE') { const { id } = req.body || {}; if (!id) return res.status(400).json({ error: 'Product ID is required.' }); const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error; return res.status(200).json({ ok: true }); }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('Products API error:', err); return res.status(500).json({ error: err.message || 'Unable to process products.' }); }
}
