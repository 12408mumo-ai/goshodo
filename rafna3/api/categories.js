import supabase from './db-client.js';
import { cors, hasAdminAccess } from './admin-guard.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'GET') { const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true }); if (error) throw error; return res.status(200).json(data); }
    if (!hasAdminAccess(req)) return res.status(401).json({ error: 'Admin access required' });
    if (req.method === 'POST') { const name = String(req.body?.name || '').trim(); if (!name) return res.status(400).json({ error: 'Category name is required.' }); const { data, error } = await supabase.from('categories').insert({ name }).select('*').single(); if (error) throw error; return res.status(201).json(data); }
    if (req.method === 'DELETE') { const id = Number(req.body?.id); if (!id) return res.status(400).json({ error: 'Category ID is required.' }); const { data: category, error: findError } = await supabase.from('categories').select('*').eq('id', id).single(); if (findError) throw findError; const { data: used, error: checkError } = await supabase.from('products').select('id').eq('category', category.name).limit(1); if (checkError) throw checkError; if (used?.length) return res.status(409).json({ error: 'This category is in use by products. Reassign them before deleting.' }); const { error } = await supabase.from('categories').delete().eq('id', id); if (error) throw error; return res.status(200).json({ ok: true }); }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('Categories API error:', err); return res.status(500).json({ error: err.message || 'Unable to process categories.' }); }
}
