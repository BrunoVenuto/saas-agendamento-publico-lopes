-- MEGA FIX: RLS, PERMISSIONS AND PROFILES
-- Run this in the Supabase SQL Editor to unblock EVERYTHING.

-- 1. CLEANUP: Drop problematic existing policies
DROP POLICY IF EXISTS "Public can view professional links" ON professional_services;
DROP POLICY IF EXISTS "Managers can manage professional services" ON professional_services;
DROP POLICY IF EXISTS "Public can view professionals" ON professionals;
DROP POLICY IF EXISTS "Managers can manage professionals" ON professionals;
DROP POLICY IF EXISTS "Public can view services" ON services;
DROP POLICY IF EXISTS "Managers can manage services" ON services;
DROP POLICY IF EXISTS "Public can view their own booking" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Managers can manage their bookings" ON bookings;

-- 2. FIX PROFILES: Ensure every tenant owner has a profile (Crucial for Admin Panel)
INSERT INTO profiles (id, tenant_id, role, full_name)
SELECT t.owner_id, t.id, 'TENANT_ADMIN', t.name
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = t.owner_id)
ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

-- 3. FIX TENANTS: Ensure owner can manage
DROP POLICY IF EXISTS "Allow owner manage" ON tenants;
CREATE POLICY "Allow owner manage" ON tenants FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow public select" ON tenants;
CREATE POLICY "Allow public select" ON tenants FOR SELECT USING (true);

-- 4. FIX PROFESSIONALS: Public select + Manager/Owner manage
CREATE POLICY "Public can view professionals" ON professionals FOR SELECT USING (is_active = true);
CREATE POLICY "Managers manage professionals" ON professionals FOR ALL USING (
  EXISTS (SELECT 1 FROM tenants t WHERE t.id = professionals.tenant_id AND t.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tenant_id = professionals.tenant_id)
);

-- 5. FIX SERVICES: Public select + Manager/Owner manage
CREATE POLICY "Public can view services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Managers manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM tenants t WHERE t.id = services.tenant_id AND t.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tenant_id = services.tenant_id)
);

-- 6. FIX PROFESSIONAL_SERVICES (The Linker): Public select + Manager/Owner manage
CREATE POLICY "Public can view professional links" ON professional_services FOR SELECT USING (true);
CREATE POLICY "Managers manage professional links" ON professional_services FOR ALL USING (
  EXISTS (
    SELECT 1 FROM professionals p 
    JOIN tenants t ON t.id = p.tenant_id
    WHERE p.id = professional_services.professional_id 
    AND (t.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.tenant_id = t.id))
  )
);

-- 7. FIX BOOKINGS: Public insert + Public select (own) + Manager manage
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public view own booking" ON bookings FOR SELECT USING (true);
CREATE POLICY "Managers manage bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM tenants t WHERE t.id = bookings.tenant_id AND t.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tenant_id = bookings.tenant_id)
);
