-- ═══════════════════════════════════════════════════════════════════════════
-- Rafna Investment · Supabase schema, Row Level Security & storage policies
-- Run this once in:  Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- The only account allowed to write. Must match VITE_ADMIN_EMAIL and the
-- email of the user created under Authentication → Users.
-- (Change here + in env vars if the owner email ever changes.)

-- ─── 1. Products table ──────────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 2 and 120),
  -- Free text, validated by the app against the managed categories table.
  -- (Old fixed-list CHECK is dropped in section 4 for existing deployments.)
  category    text not null check (char_length(category) between 2 and 60),
  price       numeric(12, 2) not null check (price > 0 and price <= 5000000),
  description text not null default '' check (char_length(description) <= 1000),
  -- Production stores persistent HTTPS URLs (Supabase Storage public URLs),
  -- NEVER base64 data URIs — the length cap enforces this deliberately.
  image_url   text not null check (char_length(image_url) <= 2000),
  created_at  timestamptz not null default now()
);

-- ─── 2. Row Level Security ──────────────────────────────────────────────────
-- RLS is the real authorization layer: even if someone tampers with the
-- browser bundle, Postgres still rejects unauthorized writes.
alter table public.products enable row level security;

-- Public (anon + authenticated) may ONLY read products for the shop.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (true);

-- Only the authenticated admin user may insert products.
drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

-- Only the authenticated admin user may delete products.
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

-- NOTE: no UPDATE policy is defined → updates are denied for everyone.
-- Add one explicitly if editing is ever needed.

-- ─── 3. Storage bucket for product photos ───────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone may READ product images (public shop), nothing more.
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only the authenticated admin may upload product images.
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com'
  );

-- Only the authenticated admin may delete product images.
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com'
  );

-- ─── 4. Categories table (managed from the admin dashboard) ─────────────────
-- Existing deployments: this section also migrates products to free-text
-- categories. Re-running the whole script is safe (idempotent).
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 2 and 60),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Public may read category names (shop filters, footer, homepage).
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (true);

-- Only the authenticated admin may create / rename / delete categories.
drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

-- Seed the original three collections (skipped if they already exist).
insert into public.categories (name) values
  ('Orthopaedic Mattresses'),
  ('Beddings'),
  ('Households')
on conflict (name) do nothing;

-- ─── 5. Products ↔ categories hardening ─────────────────────────────────────
-- Drop the old hard-coded category list so admin-managed names are accepted.
alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (char_length(category) between 2 and 60);

-- Least privilege for the safe-reassignment flow (rename / delete category):
-- the admin may UPDATE ONLY the category column of products — nothing else.
revoke update on public.products from authenticated, anon;
grant update (category) on public.products to authenticated;

drop policy if exists "products_admin_reassign_category" on public.products;
create policy "products_admin_reassign_category"
  on public.products for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'rafnainvestment@gmail.com');

-- ═══════════════════════════════════════════════════════════════════════════
-- After running this script:
--   1. Authentication → Users → Add User
--        email:    rafnainvestment@gmail.com
--        password: Rafna2026!   (initial default — change after first login)
--      ✔ tick "Auto Confirm User"
--   2. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_ADMIN_EMAIL
--      in your hosting environment, then redeploy.
--
-- Upgrading an existing database? Simply re-run this whole file — it is
-- idempotent and will add the categories table, seed the defaults, relax
-- the old category CHECK, and add the safe reassignment policy.
-- ═══════════════════════════════════════════════════════════════════════════
