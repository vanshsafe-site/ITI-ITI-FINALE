-- ============================================================================
-- Iti Iti Yogashram — Supabase schema
-- Run this ENTIRE file in your Supabase SQL editor (once).
-- Then create a Storage bucket named `blog-images` (public) via the dashboard.
-- ============================================================================

-- Roles enum + user_roles table
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read" on public.user_roles for select
  to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write" on public.user_roles for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  status text not null default 'pending' check (status in ('pending','active')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select
  to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles for insert
  to authenticated with check (id = auth.uid());
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  experience text,
  goals text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;

drop policy if exists "applications_self_insert" on public.applications;
create policy "applications_self_insert" on public.applications for insert
  to authenticated with check (user_id = auth.uid());
drop policy if exists "applications_self_read" on public.applications;
create policy "applications_self_read" on public.applications for select
  to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update" on public.applications for update
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;

drop policy if exists "contact_public_insert" on public.contact_messages;
create policy "contact_public_insert" on public.contact_messages for insert
  to anon, authenticated with check (true);
drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Pricing plans (public read, admin write)
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  currency text not null default '₹',
  period text not null default 'month',
  features jsonb not null default '[]'::jsonb,
  badge text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.pricing_plans to anon, authenticated;
grant all on public.pricing_plans to service_role;
grant insert, update, delete on public.pricing_plans to authenticated;
alter table public.pricing_plans enable row level security;

drop policy if exists "pricing_public_read" on public.pricing_plans;
create policy "pricing_public_read" on public.pricing_plans for select
  to anon, authenticated using (true);
drop policy if exists "pricing_admin_write" on public.pricing_plans;
create policy "pricing_admin_write" on public.pricing_plans for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Videos (metadata public; youtube_id visible only to active members or admins)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_id text not null,
  thumbnail_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.videos to authenticated;
grant all on public.videos to service_role;
grant insert, update, delete on public.videos to authenticated;
alter table public.videos enable row level security;

drop policy if exists "videos_active_or_admin_read" on public.videos;
create policy "videos_active_or_admin_read" on public.videos for select
  to authenticated using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
  );
drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write" on public.videos for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to service_role;
grant insert, update, delete on public.blog_posts to authenticated;
alter table public.blog_posts enable row level security;

drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts for select
  to anon, authenticated using (published = true or public.has_role(auth.uid(), 'admin'));
drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Seed one default pricing plan
insert into public.pricing_plans (name, price, currency, period, features, badge, sort_order)
select 'Monthly Plan', 1500, '₹', 'month',
  '["Live online & offline classes","Pre-recorded video library","5 flexible batches daily","1 hr 15 min per session","International-friendly"]'::jsonb,
  'Most Popular', 0
where not exists (select 1 from public.pricing_plans);

-- ============================================================================
-- AFTER RUNNING: sign up in the app, then run this ONE line to make yourself admin:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'YOUR_EMAIL_HERE';
-- ============================================================================

-- Storage bucket for blog images: create via dashboard OR run:
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'blog-images');
drop policy if exists "blog_images_admin_write" on storage.objects;
create policy "blog_images_admin_write" on storage.objects for all
  to authenticated using (bucket_id = 'blog-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'blog-images' and public.has_role(auth.uid(), 'admin'));
