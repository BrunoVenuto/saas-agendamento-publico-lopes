-- 1. Add is_active column to tenants table if it doesn't exist
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Helper Function: Get Role Securely
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 3. Update Policies for Tenants
DROP POLICY IF EXISTS "Allow owner manage" ON tenants;
DROP POLICY IF EXISTS "Allow public select" ON tenants;
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "Owners can manage their own tenant" ON tenants;
DROP POLICY IF EXISTS "Public can view active tenants" ON tenants;

-- Public Read Access: Everyone can see basic tenant info
CREATE POLICY "Public can view active tenants" 
ON tenants FOR SELECT 
USING (true);

-- Owner Access: Owners can manage their own tenant
CREATE POLICY "Owners can manage their own tenant" 
ON tenants 
FOR ALL 
USING (auth.uid() = owner_id);

-- Super Admin Access: Full control 
CREATE POLICY "Super admins can manage all tenants" 
ON tenants 
FOR ALL 
USING (
  get_my_role() = 'SUPER_ADMIN'
);
