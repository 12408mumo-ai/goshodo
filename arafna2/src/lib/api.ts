export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  featured: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  product_id: number | null;
  product_title: string;
  quantity: number;
  unit_price: number;
  total: number;
  fulfillment_type: string;
  full_name: string;
  phone: string;
  location: string | null;
  status: string;
  created_at: string;
}

export const WHATSAPP_NUMBER = '254710565055';
export const PHONE_DISPLAY = '0710 565055';
export const EMAIL = 'rafnainvestment@gmail.com';
export const ADDRESS = 'Kamkunji, Nairobi';
export const ADMIN_SESSION_KEY = 'rafna_admin_pw';

export function formatKES(value: number | string): string {
  const n = Number(value) || 0;
  return `KES ${n.toLocaleString('en-KE')}`;
}

export function adminHeaders(): Record<string, string> {
  const pw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_SESSION_KEY) || '' : '';
  return { 'Content-Type': 'application/json', 'x-admin-password': pw };
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export function buildWhatsAppLink(order: {
  product_title: string;
  unit_price: number;
  quantity: number;
  total: number;
  fulfillment_type: string;
  full_name: string;
  phone: string;
  location?: string | null;
}): string {
  const lines = [
    'Hello Rafna Investment! I would like to place an order:',
    '',
    `Product: ${order.product_title}`,
    `Price: ${formatKES(order.unit_price)}`,
    `Quantity: ${order.quantity}`,
    `Total: ${formatKES(order.total)}`,
    `Fulfillment: ${order.fulfillment_type}`,
    `Name: ${order.full_name}`,
    `Phone: ${order.phone}`,
  ];
  if (order.fulfillment_type.toLowerCase().startsWith('delivery') && order.location) {
    lines.push(`Delivery Location: ${order.location}`);
  } else if (order.location) {
    lines.push(`Location: ${order.location}`);
  }
  lines.push('', 'Thank you!');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}
