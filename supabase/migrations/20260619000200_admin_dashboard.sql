-- Add is_admin column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Create a helper function to check if a user is an admin (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = $1 AND users.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function to prevent non-service-role users from changing is_admin
CREATE OR REPLACE FUNCTION public.check_user_admin_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_admin <> OLD.is_admin AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to change is_admin status.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function BEFORE UPDATE on public.users
DROP TRIGGER IF EXISTS check_user_admin_update_trigger ON public.users;
CREATE TRIGGER check_user_admin_update_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.check_user_admin_update();

-- Create RLS Policies for products (INSERT, UPDATE, DELETE)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to delete products" ON public.products;

CREATE POLICY "Allow admin to insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to update products" ON public.products
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin to delete products" ON public.products
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Set developer profile as admin for testing
UPDATE public.users SET is_admin = true WHERE email = 'andrestorresgo22@gmail.com';
