-- Add PayPal-specific columns to the orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paypal_order_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Verify RLS policies exist for orders and order_items
-- (These policies are defined in the init script, but we ensure they are active)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Note: The following policies allow the authenticated user (using their JWT)
-- to read/write their own records, which matches our server-side write pattern:
-- - SELECT on orders: using (auth.uid() = user_id)
-- - INSERT on orders: with check (auth.uid() = user_id)
-- - SELECT on order_items: using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()))
-- - INSERT on order_items: with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()))
