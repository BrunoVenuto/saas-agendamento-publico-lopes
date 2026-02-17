-- RLS FIX for Tenants Table
-- This script ensures Super Admins can update the 'is_active' status on the tenants table.

-- 1. Helper Function: Get Role Securely (if not exists)
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

-- 2. Drop existing policies on tenants
DROP POLICY IF EXISTS "Allow owner manage" ON tenants;
DROP POLICY IF EXISTS "Allow public select" ON tenants;
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON tenants;

-- 3. Recreate Policies for Tenants

-- Public Read Access: Everyone can see basic tenant info (needed for landing pages)
CREATE POLICY "Public can view active tenants" 
ON tenants FOR SELECT 
USING (true);

-- Owner Access: Owners can manage their own tenant
CREATE POLICY "Owners can manage their own tenant" 
ON tenants 
FOR ALL 
USING (auth.uid() = owner_id);

-- Super Admin Access: Full control (Update is_active, Delete, etc.)
CREATE POLICY "Super admins can manage all tenants" 
ON tenants 
FOR ALL 
USING (
  get_my_role() = 'SUPER_ADMIN'
);
