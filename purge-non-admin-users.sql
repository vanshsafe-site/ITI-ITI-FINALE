-- Remove all non-admin Supabase auth users and their related application data.
-- Run this in the Supabase SQL editor for your project.

WITH admin_users AS (
  SELECT user_id
  FROM public.user_roles
  WHERE role = 'admin'
), deleted_users AS (
  DELETE FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM admin_users)
  RETURNING id, email
)
SELECT * FROM deleted_users;
