-- FIX FOR SIGNUP RLS ERRORS
-- Run this in the Supabase SQL Editor

-- 1. Fix Tenants Policies
DROP POLICY IF EXISTS "Owners can manage their tenants" ON tenants;
DROP POLICY IF EXISTS "Public can view tenant info" ON tenants;

CREATE POLICY "Allow public select" ON tenants FOR SELECT USING (true);
CREATE POLICY "Allow signup insert" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow owner manage" ON tenants FOR ALL USING (auth.uid() = owner_id);

-- 2. Fix Profiles Policies
DROP POLICY IF EXISTS "Users can manage their profiles" ON profiles;

CREATE POLICY "Allow signup insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow owner manage" ON profiles FOR ALL USING (auth.uid() = id);
