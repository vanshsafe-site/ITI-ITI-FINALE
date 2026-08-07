-- ============================================================================
-- Iti Iti Yogashram — Supabase schema
-- Run this ENTIRE file in your Supabase SQL editor (once).
-- Then create Storage buckets named `blog-images` and `about-images` (public) via the dashboard.
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
  form_id uuid,
  experience text,
  goals text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submission_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists form_id uuid,
  add column if not exists submission_data jsonb default '{}'::jsonb;

grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;

drop policy if exists "applications_self_insert" on public.applications;
create policy "applications_self_insert" on public.applications for insert
  to authenticated with check (user_id = auth.uid() OR user_id IS NULL);

create or replace function public.set_application_user_id()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end $$;

drop trigger if exists applications_set_user_id on public.applications;
create trigger applications_set_user_id
before insert on public.applications
for each row execute function public.set_application_user_id();

drop policy if exists "applications_self_read" on public.applications;
create policy "applications_self_read" on public.applications for select
  to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "applications_self_update" on public.applications;
create policy "applications_self_update" on public.applications for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update" on public.applications for update
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Dynamic form builder tables
create table if not exists public.form_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version int not null default 1,
  schema jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.form_definitions to anon, authenticated;
grant insert, update, delete on public.form_definitions to authenticated;
grant all on public.form_definitions to service_role;
alter table public.form_definitions enable row level security;

drop policy if exists "form_definitions_public_read" on public.form_definitions;
create policy "form_definitions_public_read" on public.form_definitions for select
  to anon, authenticated using (status = 'published' or public.has_role(auth.uid(), 'admin'));
drop policy if exists "form_definitions_admin_write" on public.form_definitions;
create policy "form_definitions_admin_write" on public.form_definitions for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.page_contents (
  id uuid primary key default gen_random_uuid(),
  page text not null unique,
  title text not null,
  content text not null default '',
  profile_image_url text,
  profile_image_position_x int not null default 50 check (profile_image_position_x between 0 and 100),
  profile_image_position_y int not null default 50 check (profile_image_position_y between 0 and 100),
  updated_at timestamptz not null default now()
);

alter table public.page_contents
  add column if not exists profile_image_url text,
  add column if not exists profile_image_position_x int not null default 50 check (profile_image_position_x between 0 and 100),
  add column if not exists profile_image_position_y int not null default 50 check (profile_image_position_y between 0 and 100);

grant select on public.page_contents to anon, authenticated;
grant insert, update, delete on public.page_contents to authenticated;
grant all on public.page_contents to service_role;
alter table public.page_contents enable row level security;

drop policy if exists "page_contents_public_read" on public.page_contents;
create policy "page_contents_public_read" on public.page_contents for select
  to anon, authenticated using (true);
drop policy if exists "page_contents_admin_write" on public.page_contents;
create policy "page_contents_admin_write" on public.page_contents for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.page_contents_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger page_contents_set_updated_at
before update on public.page_contents
for each row execute function public.page_contents_updated_at();

insert into public.page_contents (page, title, content)
values (
  'about',
  'About Me',
  'Yogacharya Nishant Jha is the Founder of Iti Iti Yogashram, a Yoga educator, researcher, artist, and holistic wellness practitioner dedicated to making authentic Yoga accessible worldwide.\n\nWith over 10 years of professional Yoga teaching experience and 7+ years of international online instruction, he has guided students from India, the United States, Canada, Mexico, UAE, Australia, France, and other countries.\n\nHolding an M.A. in Yoga, an M.Sc. in Mathematics, and a B.Ed., Nishant combines analytical thinking with traditional Yogic wisdom. His teaching philosophy is inspired by the principles of "Sthiram Sukham Asanam" and "Samatvam Yoga Uchyate," emphasizing steady, comfortable, balanced progress rather than performance-driven practice.\n\nHe specializes in Ashtanga Yoga (Beginner to Advanced), Hatha Yoga, Yin Yoga, Vinyasa Flow, Pranayama, Meditation, Yoga Nidra, Wall Yoga, Sound Healing, Yoga Philosophy, and Corporate Wellness Programs.\n\nAlongside regular classes, he conducts workshops, wellness camps, school and college programs, private coaching, corporate sessions, International Yoga Day events, and Bhagavad Gita classes.'
)
on conflict (page) do nothing;

create table if not exists public.application_responses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  field_key text not null,
  field_label text,
  value_json jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.application_responses to authenticated;
grant all on public.application_responses to service_role;
alter table public.application_responses enable row level security;

drop policy if exists "application_responses_self_read" on public.application_responses;
create policy "application_responses_self_read" on public.application_responses for select
  to authenticated using (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );
drop policy if exists "application_responses_self_insert" on public.application_responses;
create policy "application_responses_self_insert" on public.application_responses for insert
  to authenticated with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- Seed published registration form
insert into public.form_definitions (
  name,
  slug,
  description,
  status,
  version,
  schema,
  settings
)
values (
  'Registration Form',
  'registration',
  'Full registration form for yoga admissions',
  'published',
  1,
  $$[
    {
      "id": "full_name",
      "key": "full_name",
      "type": "short_text",
      "label": "Full Name",
      "placeholder": "Enter full name",
      "required": true,
      "width": "100%"
    },
    {
      "id": "email_address",
      "key": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "name@example.com",
      "required": true,
      "width": "100%"
    },
    {
      "id": "mobile_number",
      "key": "mobile_number",
      "type": "phone",
      "label": "Mobile Number",
      "placeholder": "Mobile number",
      "required": true,
      "width": "100%"
    },
    {
      "id": "whatsapp_number",
      "key": "whatsapp_number",
      "type": "phone",
      "label": "WhatsApp Number (if different)",
      "placeholder": "WhatsApp number",
      "width": "100%"
    },
    {
      "id": "country",
      "key": "country",
      "type": "short_text",
      "label": "Country",
      "placeholder": "Country",
      "required": true,
      "width": "100%"
    },
    {
      "id": "state",
      "key": "state",
      "type": "short_text",
      "label": "State",
      "placeholder": "State",
      "width": "100%"
    },
    {
      "id": "city",
      "key": "city",
      "type": "short_text",
      "label": "City",
      "placeholder": "City",
      "width": "100%"
    },
    {
      "id": "full_address",
      "key": "full_address",
      "type": "long_text",
      "label": "Full Address",
      "placeholder": "Street / Area / Pin code",
      "required": true,
      "width": "100%"
    },
    {
      "id": "date_of_birth",
      "key": "date_of_birth",
      "type": "date",
      "label": "Date of Birth",
      "placeholder": "Date of birth",
      "width": "100%"
    },
    {
      "id": "age",
      "key": "age",
      "type": "number",
      "label": "Age",
      "placeholder": "Age",
      "required": true,
      "width": "100%"
    },
    {
      "id": "gender",
      "key": "gender",
      "type": "dropdown",
      "label": "Gender",
      "placeholder": "Select gender",
      "required": true,
      "options": ["Female", "Male", "Non-binary", "Prefer not to say"],
      "width": "100%"
    },
    {
      "id": "height",
      "key": "height",
      "type": "number",
      "label": "Height",
      "placeholder": "Height",
      "width": "100%"
    },
    {
      "id": "weight",
      "key": "weight",
      "type": "number",
      "label": "Weight",
      "placeholder": "Weight",
      "width": "100%"
    },
    {
      "id": "occupation",
      "key": "occupation",
      "type": "short_text",
      "label": "Occupation",
      "placeholder": "Occupation",
      "width": "100%"
    },
    {
      "id": "time_zone",
      "key": "time_zone",
      "type": "short_text",
      "label": "Time Zone (Auto Detect)",
      "placeholder": "Auto-detected zone",
      "width": "100%"
    },
    {
      "id": "experience",
      "key": "experience",
      "type": "dropdown",
      "label": "Experience",
      "placeholder": "Select experience",
      "options": ["Never Practiced", "Beginner", "Intermediate", "Advanced"],
      "width": "100%"
    },
    {
      "id": "goals",
      "key": "goals",
      "type": "checkbox",
      "label": "Goals",
      "options": ["Weight Loss", "Flexibility", "Strength", "Balance", "Better Posture", "Stress Relief", "Mental Peace", "Pain Relief", "Injury Recovery", "Improve Health", "Better Sleep", "Meditation", "Other"],
      "width": "100%"
    },
    {
      "id": "areas_of_interest",
      "key": "areas_of_interest",
      "type": "checkbox",
      "label": "Areas of Interest",
      "options": ["Asana", "Pranayama", "Meditation", "Yoga Nidra", "Yin Yoga", "Ashtanga Yoga", "Yoga Philosophy"],
      "width": "100%"
    },
    {
      "id": "stress_level",
      "key": "stress_level",
      "type": "slider",
      "label": "Stress Level (1-10)",
      "placeholder": "1 to 10",
      "width": "100%"
    },
    {
      "id": "physical_activity",
      "key": "physical_activity",
      "type": "slider",
      "label": "Physical Activity",
      "description": "Very Inactive → Very Active",
      "width": "100%"
    },
    {
      "id": "bones_and_joints",
      "key": "bones_and_joints",
      "type": "checkbox",
      "label": "Bones & Joints",
      "options": ["Arthritis", "Cervical", "Back Pain", "Sciatica", "Slipped Disc"],
      "width": "100%"
    },
    {
      "id": "respiratory",
      "key": "respiratory",
      "type": "checkbox",
      "label": "Respiratory",
      "options": ["Asthma", "Bronchitis", "Cold"],
      "width": "100%"
    },
    {
      "id": "digestive",
      "key": "digestive",
      "type": "checkbox",
      "label": "Digestive",
      "options": ["Constipation", "Ulcer", "Digestive Disorder"],
      "width": "100%"
    },
    {
      "id": "hormonal",
      "key": "hormonal",
      "type": "checkbox",
      "label": "Hormonal",
      "options": ["Thyroid", "Diabetes", "Obesity"],
      "width": "100%"
    },
    {
      "id": "blood_pressure",
      "key": "blood_pressure",
      "type": "checkbox",
      "label": "Blood Pressure",
      "options": ["High BP", "Low BP"],
      "width": "100%"
    },
    {
      "id": "mental_health",
      "key": "mental_health",
      "type": "checkbox",
      "label": "Mental Health",
      "options": ["Stress", "Anxiety", "Depression", "Sleep Disorder"],
      "width": "100%"
    },
    {
      "id": "other_conditions",
      "key": "other_conditions",
      "type": "long_text",
      "label": "Other Conditions",
      "placeholder": "Describe any other medical conditions",
      "width": "100%"
    },
    {
      "id": "emergency_contact_name",
      "key": "emergency_contact_name",
      "type": "short_text",
      "label": "Emergency Contact Name",
      "placeholder": "Emergency contact name",
      "width": "100%"
    },
    {
      "id": "emergency_contact_relationship",
      "key": "emergency_contact_relationship",
      "type": "short_text",
      "label": "Emergency Contact Relationship",
      "placeholder": "Relationship",
      "width": "100%"
    },
    {
      "id": "emergency_contact_phone",
      "key": "emergency_contact_phone",
      "type": "phone",
      "label": "Emergency Contact Phone Number",
      "placeholder": "Phone number",
      "width": "100%"
    },
    {
      "id": "preferred_batch",
      "key": "preferred_batch",
      "type": "short_text",
      "label": "Preferred Batch",
      "placeholder": "Preferred batch",
      "width": "100%"
    },
    {
      "id": "preferred_time",
      "key": "preferred_time",
      "type": "short_text",
      "label": "Preferred Time",
      "placeholder": "Preferred time",
      "width": "100%"
    },
    {
      "id": "preferred_language",
      "key": "preferred_language",
      "type": "short_text",
      "label": "Preferred Language",
      "placeholder": "Preferred language",
      "width": "100%"
    },
    {
      "id": "class_mode",
      "key": "class_mode",
      "type": "radio",
      "label": "Class Mode",
      "options": ["Live Only", "Recorded Only", "Both"],
      "width": "100%"
    },
    {
      "id": "how_heard",
      "key": "how_heard",
      "type": "dropdown",
      "label": "How did you hear about us?",
      "options": ["Google", "YouTube", "Instagram", "Facebook", "Friend", "Student Referral", "WhatsApp", "Other"],
      "width": "100%"
    },
    {
      "id": "photo",
      "key": "photo",
      "type": "file_upload",
      "label": "Photo",
      "width": "100%"
    },
    {
      "id": "medical_reports",
      "key": "medical_reports",
      "type": "file_upload",
      "label": "Medical Reports",
      "width": "100%"
    },
    {
      "id": "doctor_recommendation",
      "key": "doctor_recommendation",
      "type": "file_upload",
      "label": "Doctor Recommendation",
      "width": "100%"
    },
    {
      "id": "consent_medical",
      "key": "consent_medical",
      "type": "checkbox",
      "label": "I understand Yoga is not a substitute for medical treatment.",
      "options": ["Yes"],
      "width": "100%"
    },
    {
      "id": "consent_disclosure",
      "key": "consent_disclosure",
      "type": "checkbox",
      "label": "I have disclosed all relevant medical conditions.",
      "options": ["Yes"],
      "width": "100%"
    },
    {
      "id": "consent_privacy",
      "key": "consent_privacy",
      "type": "checkbox",
      "label": "I agree to the privacy policy.",
      "options": ["Yes"],
      "width": "100%"
    },
    {
      "id": "consent_notifications",
      "key": "consent_notifications",
      "type": "checkbox",
      "label": "I agree to receive class notifications.",
      "options": ["Yes"],
      "width": "100%"
    }
  ]$$::jsonb,
  '{"theme":"light","multiStep":false}'::jsonb
)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    version = excluded.version,
    schema = excluded.schema,
    settings = excluded.settings,
    updated_at = now();

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
  is_free boolean not null default false,
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
    or is_free = true
  );
drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write" on public.videos for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Gallery groups and items for public site gallery section
create table if not exists public.gallery_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.gallery_groups to anon, authenticated;
grant all on public.gallery_groups to service_role;
grant insert, update, delete on public.gallery_groups to authenticated;
alter table public.gallery_groups enable row level security;

drop policy if exists "gallery_groups_public_read" on public.gallery_groups;
create policy "gallery_groups_public_read" on public.gallery_groups for select
  to anon, authenticated using (true);
drop policy if exists "gallery_groups_admin_write" on public.gallery_groups;
create policy "gallery_groups_admin_write" on public.gallery_groups for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.gallery_groups(id) on delete set null,
  title text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.gallery_items to anon, authenticated;
grant all on public.gallery_items to service_role;
grant insert, update, delete on public.gallery_items to authenticated;
alter table public.gallery_items enable row level security;

drop policy if exists "gallery_items_public_read" on public.gallery_items;
create policy "gallery_items_public_read" on public.gallery_items for select
  to anon, authenticated using (true);
drop policy if exists "gallery_items_admin_write" on public.gallery_items;
create policy "gallery_items_admin_write" on public.gallery_items for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "videos_active_or_admin_read" on public.videos;
create policy "videos_active_or_admin_read" on public.videos for select
  to authenticated using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active')
    or is_free = true
  );
drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write" on public.videos for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Blog topics (parent/child taxonomy for blog posts)
create table if not exists public.blog_topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.blog_topics(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.blog_topics to anon, authenticated;
grant all on public.blog_topics to service_role;
grant insert, update, delete on public.blog_topics to authenticated;
alter table public.blog_topics enable row level security;

drop policy if exists "blog_topics_public_read" on public.blog_topics;
create policy "blog_topics_public_read" on public.blog_topics for select
  to anon, authenticated using (true);
drop policy if exists "blog_topics_admin_write" on public.blog_topics;
create policy "blog_topics_admin_write" on public.blog_topics for all
  to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category text not null default 'General',
  topic_id uuid references public.blog_topics(id) on delete set null,
  subtopic_id uuid references public.blog_topics(id) on delete set null,
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

-- Storage bucket for application photos only: create via dashboard OR run:
insert into storage.buckets (id, name, public) values ('application-photos', 'application-photos', true)
on conflict (id) do nothing;

-- Storage bucket for application document uploads: create via dashboard OR run:
insert into storage.buckets (id, name, public) values ('application-uploads', 'application-uploads', true)
on conflict (id) do nothing;

drop policy if exists "application_photos_public_read" on storage.objects;
create policy "application_photos_public_read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'application-photos');
drop policy if exists "application_photos_write" on storage.objects;
create policy "application_photos_write" on storage.objects for all
  to authenticated using (bucket_id = 'application-photos')
  with check (bucket_id = 'application-photos');

drop policy if exists "application_uploads_public_read" on storage.objects;
create policy "application_uploads_public_read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'application-uploads');
drop policy if exists "application_uploads_write" on storage.objects;
create policy "application_uploads_write" on storage.objects for all
  to authenticated using (bucket_id = 'application-uploads')
  with check (bucket_id = 'application-uploads');
