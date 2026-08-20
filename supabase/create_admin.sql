-- ==============================================================================
-- CREATE ADMIN USER WITH AUTH & ROLE IN SUPABASE
-- Run this script directly in your Supabase Project SQL Editor
-- ==============================================================================

-- 1. Ensure required cryptographic extension is active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
  admin_email TEXT := 'admin@shreehari.com';        -- Replace with your admin email
  admin_password TEXT := 'Admin@123456';            -- Replace with your desired strong password
  admin_name TEXT := 'Super Admin';
  admin_phone TEXT := '+919876543210';
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    -- Update existing user's role to admin in profiles
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = admin_email;

    -- Update raw app meta data
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'admin'),
        raw_user_meta_data = jsonb_build_object('name', admin_name, 'role', 'admin'),
        encrypted_password = crypt(admin_password, gen_salt('bf')),
        email_confirmed_at = NOW()
    WHERE email = admin_email;

    RAISE NOTICE 'Existing user % updated to admin role.', admin_email;
  ELSE
    -- Insert new admin user into Supabase Auth system
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_admin_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'admin'),
      jsonb_build_object('name', admin_name, 'role', 'admin'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insert into public.profiles with role 'admin'
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      mobile,
      "companyName",
      created_at,
      updated_at
    ) VALUES (
      new_admin_id,
      admin_name,
      admin_email,
      'admin',
      admin_phone,
      'Shree Hari Pooja Samagri',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = NOW();

    RAISE NOTICE 'Admin user % created successfully with role admin.', admin_email;
  END IF;
END $$;
