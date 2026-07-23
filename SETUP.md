# Iti Iti Yogashram — Setup

## 1. Run the SQL

Open your Supabase project → SQL Editor → paste the full contents of
`SUPABASE_SETUP.sql` and run it once. This creates:

- `profiles`, `user_roles`, `applications`, `contact_messages`,
  `pricing_plans`, `videos`, `blog_posts`
- Row-level security policies
- A trigger that auto-creates a profile when a user signs up
- One default pricing plan
- Storage bucket `blog-images` (public read, admin write)

## 2. Configure auth

In Supabase → **Authentication → URL Configuration**, add your site URL(s)
(the Lovable preview URL and any custom domain) to **Site URL** and
**Redirect URLs**.

Optionally disable "Confirm email" while testing so new applicants can sign in
immediately (Auth → Providers → Email).

## 3. Create yourself as admin

1. Go to `/apply` (or `/auth`) in the app and sign up.
2. Back in the SQL editor, run:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR_EMAIL_HERE';
```

3. Refresh the app — you'll see the **Admin** link in the nav.

## 4. Set your first pricing plan / videos / blog posts

Everything is editable at `/admin`:

- **Applications** — approve pending users (they can then access `/videos`).
- **Messages** — view contact-form submissions.
- **Pricing** — shown on `/` and `/offerings`.
- **Videos** — add YouTube video IDs (use **Unlisted** videos on YouTube).
- **Blog** — write posts, upload images, publish.

## About the video protection

The `/videos` page:

- Only renders to signed-in users whose `profiles.status = 'active'`.
- Row-level security on the `videos` table also blocks the query for
  non-active users at the database level.
- The player uses `youtube-nocookie.com` with minimal chrome, disables
  right-click, blocks the YouTube logo/branding hot-zones, and never renders
  the video URL as an anchor.
- **Reality check:** in any browser, a determined user with devtools can still
  read the iframe `src`. Combined with unlisted YouTube URLs this raises the
  bar significantly, but nothing is 100% uncapturable. For stronger DRM you
  would need a paid service like Vimeo Pro's domain-locked embeds or
  Cloudflare Stream signed URLs.

## Local dev

The Supabase URL / anon key are stored in `.env` (already filled with the
values you provided) and read via `import.meta.env.VITE_SUPABASE_*`.
