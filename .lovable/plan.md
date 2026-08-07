
## Overview
Rebuild the uploaded single-page site as a multi-page TanStack Start (React) app connected to **your own Supabase project** (URL + anon key you provided). Includes public marketing pages, an application/contact flow, a members-only videos section, a blog with an admin CMS, and an admin panel for site content.

## Public pages (converted from index.html)
- `/` Home (hero, focus areas, offerings/pricing, testimonials, CTA) — pulls **pricing** from Supabase so the admin can edit it live.
- `/about` — teacher / philosophy content.
- `/offerings` — full class list + pricing (live from DB).
- `/contact` — form that inserts into `contact_messages` (admin sees them in dashboard).
- `/apply` — application form (creates a pending `applications` row + auth user via magic link email; account starts inactive).
- `/blog` — list of published posts.
- `/blog/$slug` — single post.
- `/auth` — sign in / sign up (email + password, magic link).

## Member pages (auth required, `_authenticated/`)
- `/dashboard` — status ("pending" vs "active"), profile.
- `/videos` — grid of unlisted YouTube videos. Only visible when profile `status = 'active'` (activated manually by admin after offline conversation). Player uses `react-player` inside a custom overlay wrapper that:
  - Disables right-click, blocks the YouTube logo/title bar (`modestbranding`, `controls=0` with custom controls), disables picture-in-picture, and overlays a transparent shield to prevent easy inspect-copy of the underlying URL.
  - Video IDs are fetched via a Supabase RPC that only returns IDs to active users (RLS). URL is never rendered as a plain `<a>`.
  - Note: with browser devtools nothing is 100% uncapturable, but this raises the bar significantly (unlisted URL + gated fetch + no anchor tag + obfuscated iframe src injection).

## Admin pages (`_authenticated/admin/`, role = `admin`)
- `/admin` — overview.
- `/admin/applications` — list pending users, one-click **Activate** (flips `profiles.status` to `active`).
- `/admin/messages` — contact form submissions.
- `/admin/pricing` — edit price/features of offerings.
- `/admin/videos` — add/edit/delete videos (title, description, YouTube ID, thumbnail).
- `/admin/blog` — rich text editor (Tiptap) to write posts, upload images to Supabase Storage, publish/unpublish.

## Supabase schema (migrations run against your project)
- `profiles` (id → auth.users, full_name, phone, status: `pending|active`, created_at)
- `user_roles` (user_id, role: `admin|user`) + `has_role()` security-definer function
- `applications` (id, user_id, message, experience, goals, status, created_at)
- `contact_messages` (id, name, email, message, created_at)
- `pricing_plans` (id, key, name, price, currency, period, features jsonb, sort_order)
- `videos` (id, title, description, youtube_id, thumbnail_url, sort_order, created_at)
- `blog_posts` (id, slug, title, excerpt, content, cover_image_url, published, published_at, author_id)
- Storage bucket `blog-images` (admin write, public read)

RLS:
- `profiles`: user reads/updates own; admin reads all.
- `applications`, `contact_messages`: user inserts; admin reads all.
- `pricing_plans`, `videos` (metadata), `blog_posts` where `published=true`: public read.
- `videos.youtube_id` gated: view exposes IDs only when `has_role('admin')` OR `profiles.status='active'`.
- Admin-only write on `pricing_plans`, `videos`, `blog_posts`.

First admin user: after you sign up, run a one-time SQL insert to grant `admin` role (I'll tell you the email to use).

## Tech
- TanStack Start (already scaffolded) + React 19.
- `@supabase/supabase-js` client wired to **your** URL/anon key (stored as `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`).
- shadcn/ui components, Tailwind v4 with the exact color palette from your HTML (`--forest`, `--sage`, `--terra`, `--gold`, `--cream`, `--leaf`).
- Fonts: Cormorant Garamond + Jost (via `<link>` in root head).
- `react-player` for the YouTube wrapper, `@tiptap/react` for the blog editor.

## Notes / decisions I'm making
- Using **your** Supabase project (not Lovable Cloud) since you asked. That means I cannot run migrations from here — I'll output the full SQL and you paste it into Supabase SQL editor once. Same for the storage bucket.
- "Contacts stay in sync with the user": the contact form auto-fills from the logged-in profile when signed in, and messages are linked via `user_id`.
- Video anti-scrape is best-effort as described above.

## Deliverable
On approval I'll build all routes, components, Supabase client, auth guards, admin CMS, and hand you the SQL migration + a short setup checklist (paste SQL, create bucket, sign up, grant yourself admin).
