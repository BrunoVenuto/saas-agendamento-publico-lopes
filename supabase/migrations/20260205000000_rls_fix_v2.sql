-- RLS FIX AND DATA RECOVERY v2
-- This script ensures all users have a profile and tenant, and fixes RLS permissions.

-- 1. Ensure RLS policies are permissive enough for management
DROP POLICY IF EXISTS "Managers can manage services" ON services;
CREATE POLICY "Managers can manage services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = services.tenant_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = services.tenant_id)
);

DROP POLICY IF EXISTS "Managers can manage professionals" ON professionals;
CREATE POLICY "Managers can manage professionals" ON professionals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = professionals.tenant_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = professionals.tenant_id)
);

DROP POLICY IF EXISTS "Managers can manage professional services" ON professional_services;
CREATE POLICY "Managers can manage professional services" ON professional_services FOR ALL USING (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = professional_services.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
) WITH CHECK (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = professional_services.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Managers can manage availability" ON availability;
CREATE POLICY "Managers can manage availability" ON availability FOR ALL USING (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = availability.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
) WITH CHECK (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = availability.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
);

-- 2. Data Recovery: Fix users with null tenant_id in profiles
-- In many cases, the tenant exists but the profile link is broken.
UPDATE profiles
SET tenant_id = tenants.id
FROM tenants
WHERE profiles.tenant_id IS NULL AND profiles.id = tenants.owner_id;

-- 3. Data Recovery: If a tenant exists but profile is missing, create it
INSERT INTO profiles (id, tenant_id, role, full_name)
SELECT t.owner_id, t.id, 'TENANT_ADMIN', t.name
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = t.owner_id)
ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;
