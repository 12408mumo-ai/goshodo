export const BRAND_NAME = 'Rafna Investment';
export const WHATSAPP_NUMBER = '254710565055';
export const PHONE_DISPLAY = '0710 565055';
export const EMAIL = 'rafnainvestment@gmail.com';
export const LOCATION = 'Kamkunji, Nairobi';

export const CATEGORIES = ['Orthopaedic Mattresses', 'Beddings', 'Households'] as const;

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  created_at?: string;
}

export const formatKES = (price: number) =>
  `KES ${Number(price).toLocaleString('en-KE')}`;

export const waChatLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
