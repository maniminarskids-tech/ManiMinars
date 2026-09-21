-- ==============================================================================
-- MANI & MINARS KIDS WEAR - SUPABASE PRODUCTS SCHEMA & REALTIME SETUP
-- Run this SQL in your Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    is_new BOOLEAN DEFAULT FALSE,
    is_sale BOOLEAN DEFAULT FALSE,
    age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'juniors')),
    category TEXT NOT NULL,
    sizes JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT DEFAULT '',
    details JSONB DEFAULT '[]'::jsonb,
    fabric TEXT DEFAULT '100% Breathable Cotton',
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 12,
    stock_quantity INTEGER DEFAULT 15,
    low_stock_threshold INTEGER DEFAULT 5,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create index for high-performance category & ageGroup filtering
CREATE INDEX IF NOT EXISTS idx_products_age_group ON public.products(age_group);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (public, customers, visitors) to read the product catalog
DROP POLICY IF EXISTS "Public can view all active products" ON public.products;
CREATE POLICY "Public can view all active products" 
ON public.products 
FOR SELECT 
USING (true);

-- Allow inserting new products (for admin portal)
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
CREATE POLICY "Allow insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

-- Allow updating products (for admin edits and stock reduction on order placement)
DROP POLICY IF EXISTS "Allow update products" ON public.products;
CREATE POLICY "Allow update products" 
ON public.products 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow deleting products (for admin portal)
DROP POLICY IF EXISTS "Allow delete products" ON public.products;
CREATE POLICY "Allow delete products" 
ON public.products 
FOR DELETE 
USING (true);

-- 5. Enable Supabase Realtime Publication for instant multi-device synchronization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- ==============================================================================
-- 6. Create Orders Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    payment_proof_image TEXT,
    payment_status TEXT DEFAULT 'pending',
    shipping_tier TEXT DEFAULT 'standard',
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    tracking_number TEXT,
    courier TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for high-performance order retrieval & status queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Enable Row Level Security (RLS) on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" 
ON public.orders 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
CREATE POLICY "Allow insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update orders" ON public.orders;
CREATE POLICY "Allow update orders" 
ON public.orders 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete orders" ON public.orders;
CREATE POLICY "Allow delete orders" 
ON public.orders 
FOR DELETE 
USING (true);

-- Enable Supabase Realtime for orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
