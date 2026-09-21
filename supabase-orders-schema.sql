-- =========================================================================
-- MANI MINARS - ORDERS MANAGEMENT SYSTEM SCHEMA FOR SUPABASE
-- Run this complete script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    -- Primary identifier
    order_id TEXT PRIMARY KEY,
    id TEXT, -- Synced alias for client backward compatibility

    -- Customer Information
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    customer JSONB, -- Nested customer object

    -- Bag & Products Information
    products_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,

    -- Financial Breakdown (PKR)
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,

    -- Payment & Verification Proof
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    payment_reference TEXT, -- Bank transaction reference or TID
    payment_proof_url TEXT, -- Screenshot URL or Base64 data
    payment_proof_image TEXT,
    payment_status TEXT DEFAULT 'pending',

    -- Logistics & Order Status
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    shipping_tier TEXT DEFAULT 'standard',
    coupon_code TEXT,
    tracking_number TEXT,
    courier TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON public.orders (payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_city ON public.orders (city);

-- 3. Automatic Synchronization & Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_order_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize primary identifiers
    IF NEW.order_id IS NULL AND NEW.id IS NOT NULL THEN
        NEW.order_id := NEW.id;
    END IF;
    IF NEW.id IS NULL AND NEW.order_id IS NOT NULL THEN
        NEW.id := NEW.order_id;
    END IF;

    -- Synchronize totals
    IF NEW.total_amount IS NULL OR NEW.total_amount = 0 THEN
        IF NEW.total IS NOT NULL AND NEW.total > 0 THEN
            NEW.total_amount := NEW.total;
        END IF;
    END IF;
    IF NEW.total IS NULL OR NEW.total = 0 THEN
        IF NEW.total_amount IS NOT NULL AND NEW.total_amount > 0 THEN
            NEW.total := NEW.total_amount;
        END IF;
    END IF;

    -- Synchronize products payload
    IF NEW.products_json IS NULL OR NEW.products_json = '[]'::jsonb THEN
        IF NEW.items IS NOT NULL AND NEW.items != '[]'::jsonb THEN
            NEW.products_json := NEW.items;
        END IF;
    END IF;
    IF NEW.items IS NULL OR NEW.items = '[]'::jsonb THEN
        IF NEW.products_json IS NOT NULL AND NEW.products_json != '[]'::jsonb THEN
            NEW.items := NEW.products_json;
        END IF;
    END IF;

    -- Synchronize payment proof screenshot
    IF NEW.payment_proof_url IS NULL AND NEW.payment_proof_image IS NOT NULL THEN
        NEW.payment_proof_url := NEW.payment_proof_image;
    END IF;
    IF NEW.payment_proof_image IS NULL AND NEW.payment_proof_url IS NOT NULL THEN
        NEW.payment_proof_image := NEW.payment_proof_url;
    END IF;

    -- Always update the updated_at timestamp
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_orders ON public.orders;
CREATE TRIGGER trigger_sync_orders
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_sync();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- SELECT: Allow storefront and admin dashboard to read orders
DROP POLICY IF EXISTS "Allow public read access on orders" ON public.orders;
CREATE POLICY "Allow public read access on orders"
    ON public.orders
    FOR SELECT
    USING (true);

-- INSERT: Allow checkout page to insert newly placed orders
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

-- UPDATE: Allow admin panel to update order statuses (Approve, Reject, Dispatch, etc.)
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders"
    ON public.orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- DELETE: Allow admin panel to remove test or cancelled orders
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders"
    ON public.orders
    FOR DELETE
    USING (true);

-- 6. Enable Full Replication for Supabase Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 7. Add Table to Supabase Realtime Publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table is already in publication
    END;
END $$;
