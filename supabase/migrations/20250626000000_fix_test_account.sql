-- supabase/migrations/20250626000000_fix_test_account.sql

-- First delete the existing test account if it exists
DELETE FROM auth.users WHERE email = 'test@edulearn.com';

-- Create a new test user in auth.users with confirmed email
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  confirmed_at
)
VALUES (
  gen_random_uuid(),
  'test@edulearn.com',
  crypt('Test123!', gen_salt('bf')),
  now(),  -- Set email_confirmed_at to current time
  '',     -- Empty confirmation token '',     -- Empty recovery token '{"provider":"email","providers":["email"]}',
  '{"role":"student","first_name":"Test","last_name":"User","level":"intermediate"}',
  now(),
  now(),  -- Set last sign in time
  now()   -- Set confirmed_at to current time
)
ON CONFLICT (email) DO NOTHING;

-- Make sure the test account has the proper role and profile data
WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test@edulearn.com' LIMIT 1
)
INSERT INTO public.profiles (id, user_id, first_name, last_name, role, level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  'Test',
  'User',
  'student',
  'intermediate',
  now(),
  now()
FROM test_user
ON CONFLICT (user_id) 
DO UPDATE SET
  first_name = 'Test',
  last_name = 'User',
  role = 'student',
  level = 'intermediate',
  updated_at = now();