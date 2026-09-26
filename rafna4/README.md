# Rafna Investment — Quality Mattresses, Beddings & Households

A secure, production-ready e-commerce experience for **Rafna Investment**
(Kamkunji, Nairobi). Customers browse the collection and order directly via
WhatsApp; the owner manages products and photos from a protected admin console
backed by Supabase.

## Quick start

```bash
npm install
npm run dev
```

Open `/admin` and sign in with the default demo password `Rafna2026!`
(demo mode stores data in your browser).

## Production (Supabase)

1. Copy `.env.example` → `.env` and fill in your Supabase values.
2. Follow **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** — schema, RLS, storage
   bucket and the admin user.
3. `npm run build` and deploy.

## Architecture

- **Storefront** — React + TypeScript + Tailwind. No cart: every product has
  one **Order Now** button that opens a validated order form and hands off to
  WhatsApp (`wa.me/254710565055`) with a pre-filled, URL-encoded message.
- **Catalogue** — `public.products` in Supabase; public read-only via RLS.
- **Categories** — `public.categories`, fully managed from the admin console
  (create / rename / delete). Renames update products automatically; deletes
  never delete products — they move to "Uncategorized". The shop filters,
  homepage cards and footer render from this table, with no hard-coded lists.
- **Media** — `product-images` Storage bucket; admin-only uploads, public read.
- **Admin** — `/admin` guarded by a real auth gate. With Supabase configured,
  sign-in is verified server-side by Supabase Auth and every write is enforced
  again by Postgres RLS (defense in depth). Without Supabase, a clearly
  labelled demo mode (SHA-256 password check, browser storage) keeps the UI
  fully usable for local preview.
