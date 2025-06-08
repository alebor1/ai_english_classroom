-- supabase/migrations/20250525000000_create_test_account.sql

-- Create a test user in auth.users (this requires admin privileges)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at)
VALUES (
  gen_random_uuid(),
  'test@edulearn.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"student","level":"intermediate"}',
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Note: The above SQL must be executed by a service role or database admin
-- It cannot be executed via the client SDK with anon key