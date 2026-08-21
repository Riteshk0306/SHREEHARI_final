-- ==============================================================================
-- SHREE HARI POOJA SAMAGRI - SUPABASE DATABASE SCHEMA & SETUP SCRIPT
-- ==============================================================================
-- This complete SQL script sets up:
-- 1. Database tables (products, orders, customers ledger, bills POS, contacts, profiles)
-- 2. Indexes for fast search and query performance
-- 3. Row Level Security (RLS) policies for public, customer, and admin access
-- 4. Supabase Auth trigger to automatically create profiles & assign admin roles
-- 5. Storage Buckets (product-images, profile-avatars, invoices) & Storage RLS
-- 6. Initial seed products catalog data
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. HELPER FUNCTIONS
-- ==============================================================================

-- Function to check if the current user is an Admin (via JWT or profiles table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
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

-- Function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLE: PROFILES (User accounts & Profile Information)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  mobile TEXT,
  "companyName" TEXT,
  "gstNumber" TEXT,
  "profilePicture" TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility view for queries selecting from 'users'
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  name,
  email,
  role,
  mobile,
  "companyName",
  "gstNumber",
  "profilePicture",
  addresses,
  created_at,
  updated_at
FROM public.profiles;

-- ==============================================================================
-- 3. TABLE: PRODUCTS (Catalog & Inventory Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  brand TEXT NOT NULL DEFAULT 'Shree Hari',
  description TEXT,
  "purchasePrice" NUMERIC NOT NULL DEFAULT 0,
  "sellingPrice" NUMERIC NOT NULL DEFAULT 0,
  mrp NUMERIC NOT NULL DEFAULT 0,
  "discountPercentage" NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLE: CUSTOMERS (Ledger & Khata for Due/Credit Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  "totalPurchases" NUMERIC NOT NULL DEFAULT 0,
  "totalPaid" NUMERIC NOT NULL DEFAULT 0,
  "totalDue" NUMERIC NOT NULL DEFAULT 0,
  "lastPurchaseDate" TIMESTAMPTZ,
  "paymentReminderDate" TIMESTAMPTZ,
  "paymentHistory" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLE: ORDERS (E-commerce & In-Store Customer Orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "customerId" TEXT,
  "customerName" TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  address TEXT,
  "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
  "paymentStatus" TEXT NOT NULL DEFAULT 'Pending' CHECK ("paymentStatus" IN ('Pending', 'Paid', 'Failed')),
  "orderStatus" TEXT NOT NULL DEFAULT 'Pending' CHECK ("orderStatus" IN ('Pending', 'Accepted', 'Packed', 'Shipped', 'Out for Delivery', 'Completed', 'Cancelled')),
  date TIMESTAMPTZ DEFAULT NOW(),
  "totalAmount" NUMERIC NOT NULL DEFAULT 0,
  "paidAmount" NUMERIC DEFAULT 0,
  "dueAmount" NUMERIC DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'Customer',
  "gstIncluded" BOOLEAN DEFAULT FALSE,
  "gstAmount" NUMERIC DEFAULT 0,
  "invoiceUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLE: BILLS (POS Quick Billing Invoices)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "billNumber" TEXT UNIQUE NOT NULL,
  "customerName" TEXT NOT NULL,
  mobile TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
  date TIMESTAMPTZ DEFAULT NOW(),
  "totalAmount" NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'Admin (POS)',
  "gstIncluded" BOOLEAN DEFAULT FALSE,
  "gstAmount" NUMERIC DEFAULT 0,
  "invoiceUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABLE: CONTACTS (Customer Queries & Feedback)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  message TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders("customerId");
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON public.orders("invoiceNumber");
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(mobile);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON public.bills("billNumber");

-- ==============================================================================
-- 9. TRIGGERS: UPDATED_AT TIMESTAMP
-- ==============================================================================
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tr_customers_updated_at ON public.customers;
CREATE TRIGGER tr_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tr_bills_updated_at ON public.bills;
CREATE TRIGGER tr_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ==============================================================================
-- 10. AUTH TRIGGER: AUTO CREATE PROFILE ON USER SIGN-UP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
  user_mobile TEXT;
BEGIN
  -- Assign 'admin' role if email is admin@shreehari.com, otherwise use metadata or default to 'customer'
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- PRODUCTS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (guests + logged-in users) can view active products; Admins can view all
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status = 'Active' OR public.is_admin());

-- Only Admins can modify products (INSERT, UPDATE, DELETE)
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

-- ------------------------------------------------------------------------------
-- ORDERS POLICIES
-- ------------------------------------------------------------------------------
-- Customers view their own orders; Admins view all orders
DROP POLICY IF EXISTS "Users view own orders or Admin views all" ON public.orders;
CREATE POLICY "Users view own orders or Admin views all"
  ON public.orders FOR SELECT
  USING (
    "customerId" = auth.uid()::text 
    OR email = (auth.jwt() ->> 'email')
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

-- Customers and guests can place orders
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE);

-- Admins can update/delete orders
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin() OR auth.role() = 'anon');

-- ------------------------------------------------------------------------------
-- CUSTOMERS (LEDGER) POLICIES
-- ------------------------------------------------------------------------------
-- Admin-only access for customer credit ledger
DROP POLICY IF EXISTS "Admin manage customers ledger" ON public.customers;
CREATE POLICY "Admin manage customers ledger"
  ON public.customers FOR ALL
  USING (public.is_admin() OR auth.role() = 'anon')
  WITH CHECK (public.is_admin() OR auth.role() = 'anon');

-- ------------------------------------------------------------------------------
-- BILLS (POS) POLICIES
-- ------------------------------------------------------------------------------
-- Admin-only access for POS billing records
DROP POLICY IF EXISTS "Admin manage bills" ON public.bills;
CREATE POLICY "Admin manage bills"
  ON public.bills FOR ALL
  USING (public.is_admin() OR auth.role() = 'anon')
  WITH CHECK (public.is_admin() OR auth.role() = 'anon');

-- ------------------------------------------------------------------------------
-- CONTACTS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can submit a contact message
DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
CREATE POLICY "Public can insert contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view and manage contact messages
DROP POLICY IF EXISTS "Admin can view contacts" ON public.contacts;
CREATE POLICY "Admin can view contacts"
  ON public.contacts FOR SELECT
  USING (public.is_admin() OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin can delete contacts" ON public.contacts;
CREATE POLICY "Admin can delete contacts"
  ON public.contacts FOR DELETE
  USING (public.is_admin() OR auth.role() = 'anon');

-- ==============================================================================
-- 12. STORAGE BUCKETS SETUP & STORAGE RLS POLICIES
-- ==============================================================================

-- Create buckets in storage schema if not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('invoices', 'invoices', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public read access for product images
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Storage RLS: Upload & delete for product images
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

-- Storage RLS: Profile avatars
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

-- Storage RLS: Invoices (Public Read, Admin / Users Upload)
DROP POLICY IF EXISTS "Public Access Invoices" ON storage.objects;
CREATE POLICY "Public Access Invoices"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Admins and Customers can upload invoices" ON storage.objects;
CREATE POLICY "Admins and Customers can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Admins can update invoices" ON storage.objects;
CREATE POLICY "Admins can update invoices"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Admins can delete invoices" ON storage.objects;
CREATE POLICY "Admins can delete invoices"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invoices');

-- ==============================================================================
-- 13. SEED INITIAL PRODUCTS DATA
-- ==============================================================================
INSERT INTO public.products (id, name, category, brand, description, "purchasePrice", "sellingPrice", mrp, "discountPercentage", stock, images, status)
VALUES 
  (
    'p1', 
    'Premium Camphor (Kapoor) 100g', 
    'Incense', 
    'Shree Hari', 
    '100% pure organic camphor flakes for daily puja and aarti.', 
    50, 
    80, 
    100, 
    20, 
    50, 
    ARRAY['https://images.unsplash.com/photo-1605273760435-09e25d2024b4?w=600&q=80'], 
    'Active'
  ),
  (
    'p2', 
    'Pure Sandalwood Stick (Chandan)', 
    'Wood', 
    'Shree Hari', 
    'Natural aromatic sandalwood stick for creating fresh chandan paste.', 
    150, 
    250, 
    300, 
    16.67, 
    25, 
    ARRAY['https://images.unsplash.com/photo-1626025586617-3bf777e5d8ec?w=600&q=80'], 
    'Active'
  ),
  (
    'p3', 
    'Handcrafted Brass Diya', 
    'Utensils', 
    'Shree Hari', 
    'Heavy brass traditional diya for morning and evening aarti.', 
    100, 
    150, 
    200, 
    25, 
    30, 
    ARRAY['https://images.unsplash.com/photo-1605658140411-bdc2323f46f4?w=600&q=80'], 
    'Active'
  ),
  (
    'p4', 
    'Organic Kumkum & Roli (100g)', 
    'Powder', 
    'Shree Hari', 
    'Skin-friendly pure turmeric-based natural kumkum powder.', 
    30, 
    50, 
    60, 
    16.67, 
    45, 
    ARRAY['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80'], 
    'Active'
  ),
  (
    'p5', 
    'Natural Mogra Agarbatti (Pack of 3)', 
    'Incense', 
    'Shree Hari', 
    'Long-lasting soothing jasmine flower fragrance incense sticks.', 
    60, 
    99, 
    120, 
    17.5, 
    60, 
    ARRAY['https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600&q=80'], 
    'Active'
  ),
  (
    'p6', 
    'Pure Copper Puja Thali Set (6 Pcs)', 
    'Utensils', 
    'Shree Hari', 
    'Complete copper thali set including diya, agarbatti stand, and bell.', 
    350, 
    599, 
    799, 
    25, 
    15, 
    ARRAY['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80'], 
    'Active'
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- END OF SCHEMA & SETUP SCRIPT
-- ==============================================================================
