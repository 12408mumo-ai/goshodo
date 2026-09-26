# Rafna Investment — Supabase & Production Setup

The site runs in a **secure demo mode** out of the box (products stored in the
browser, demo admin session). Connect Supabase to switch to the production
architecture: a live products table, durable image storage, and real
server-verified admin authentication.

## 1 — Create the Supabase project

1. Sign in at <https://supabase.com> → **New project** (any name/region).
2. Wait for provisioning, then open **SQL Editor**.

## 2 — Run the schema

1. Open [`supabase/schema.sql`](./supabase/schema.sql) and paste it into a new
   SQL query.
2. If your admin email differs from `rafnainvestment@gmail.com`, replace it in
   the four policies before running.
3. **Run** — this creates:
   - `public.products` table (with length/range checks), RLS enabled
   - Public **read-only** policy; insert/delete limited to the admin user
   - `product-images` storage bucket (public read, admin-only write)

## 3 — Create the admin user

1. **Authentication → Users → Add User**
2. Email: `rafnainvestment@gmail.com`
3. Password: `Rafna2026!` (initial default — change it after first sign-in via
   Authentication → Users → … → Send password recovery, or set a new one in the
   dashboard)
4. ✔ Tick **Auto Confirm User**.

Supabase Auth now verifies the password **server-side** and issues a
short-lived JWT (auto-refreshing session). Every insert/delete is re-checked by
Postgres Row Level Security — the anon key in the browser cannot write.

## 4 — Configure environment variables

Copy `.env.example` → `.env` locally, and set the same three variables in your
hosting dashboard (Vercel → Project → Settings → Environment Variables):

| Variable               | Where to find it                          |
| ---------------------- | ----------------------------------------- |
| `VITE_SUPABASE_URL`    | Project Settings → API → Project URL      |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` |
| `VITE_ADMIN_EMAIL`     | The email from step 3                     |

Redeploy after changing env vars (Vite embeds `VITE_*` at build time).

> ⚠️ Never put the **service-role** key anywhere in this app — it bypasses RLS.

## Security notes

- **Authorization lives in Postgres (RLS)** — client code is only a courtesy.
- Login throttling is enforced twice: client-side lockout after 5 failed
  attempts and Supabase Auth's built-in server-side rate limiting.
- Image uploads are validated (type + 8 MB cap) client-side and constrained to
  the admin user by storage policies server-side.
- Sessions use Supabase's signed, expiring JWTs with automatic refresh;
  signing out revokes the session locally. Demo mode sessions expire after 2 h.

## Migrating an existing database (categories update)

The app now manages categories in a `public.categories` table (admin CRUD
from the dashboard; safe product reassignment to "Uncategorized" on delete).
If you ran the schema before this feature shipped, **re-run
[`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor** — it is
idempotent and will:

- create `public.categories` with public-read / admin-write RLS policies
- seed the three default collections (skipped if present)
- drop the old hard-coded category CHECK on `products`
- grant the admin **category-column-only** UPDATE on `products` (least
  privilege) so renames/deletions can safely reassign products
