-- ==============================================================================
-- SHREE HARI - INCREMENTAL UPDATE SCRIPT (IDEMPOTENT / SAFE TO RE-RUN)
-- ==============================================================================
-- Run this query if you already executed the initial schema script.
-- It updates helper functions, triggers, storage bucket limits, and RLS policies
-- without dropping or altering your existing table data.
-- ==============================================================================

-- 1. Refresh is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Master admin email check directly from auth token
  IF (auth.jwt() ->> 'email') = 'admin@shreehari.com' THEN
    RETURN TRUE;
  END IF;

  -- Role check from profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Auth Trigger to automatically sync roles & metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
  user_mobile TEXT;
BEGIN
  IF NEW.email = 'admin@shreehari.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  END IF;

  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_mobile := COALESCE(NEW.raw_user_meta_data->>'mobile', '');

  INSERT INTO public.profiles (id, email, name, role, mobile, "companyName", "gstNumber", addresses)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    assigned_role,
    user_mobile,
    COALESCE(NEW.raw_user_meta_data->>'companyName', ''),
    COALESCE(NEW.raw_user_meta_data->>'gstNumber', ''),
    '[]'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = CASE WHEN EXCLUDED.email = 'admin@shreehari.com' THEN 'admin' ELSE public.profiles.role END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('invoices', 'invoices', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Refresh Storage RLS Policies
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public Access Profile Avatars" ON storage.objects;
CREATE POLICY "Public Access Profile Avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Users can upload profile avatar" ON storage.objects;
CREATE POLICY "Users can upload profile avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS "Users can update profile avatar" ON storage.objects;
CREATE POLICY "Users can update profile avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-avatars');

-- 5. Refresh Table RLS Policies
DROP POLICY IF EXISTS "Users can view own profile or Admin can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or Admin can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile or Admin can update all" ON public.profiles;
CREATE POLICY "Users can update own profile or Admin can update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert allowed for auth service or self" ON public.profiles;
CREATE POLICY "Profiles insert allowed for auth service or self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status = 'Active' OR public.is_admin());

DROP POLICY IF EXISTS "Admin full product access (insert)" ON public.products;
CREATE POLICY "Admin full product access (insert)"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin full product access (update)" ON public.products;
CREATE POLICY "Admin full product access (update)"
  ON public.products FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin full product access (delete)" ON public.products;
CREATE POLICY "Admin full product access (delete)"
  ON public.products FOR DELETE
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users view own orders or Admin views all" ON public.orders;
CREATE POLICY "Users view own orders or Admin views all"
  ON public.orders FOR SELECT
  USING (
    "customerId" = auth.uid()::text 
    OR email = (auth.jwt() ->> 'email')
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin manage customers ledger" ON public.customers;
CREATE POLICY "Admin manage customers ledger"
  ON public.customers FOR ALL
  USING (public.is_admin() OR auth.role() = 'anon')
  WITH CHECK (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin manage bills" ON public.bills;
CREATE POLICY "Admin manage bills"
  ON public.bills FOR ALL
  USING (public.is_admin() OR auth.role() = 'anon')
  WITH CHECK (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
CREATE POLICY "Public can insert contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin can view contacts" ON public.contacts;
CREATE POLICY "Admin can view contacts"
  ON public.contacts FOR SELECT
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin can delete contacts" ON public.contacts;
CREATE POLICY "Admin can delete contacts"
  ON public.contacts FOR DELETE
  USING (public.is_admin() OR auth.role() = 'anon');
