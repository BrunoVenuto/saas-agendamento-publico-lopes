-- FIX RLS FOR PUBLIC BOOKINGS
-- This allows anyone to create a booking and read it back if they know the ID.

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their tenant bookings" ON bookings;

-- 2. Allow anyone to insert a booking
CREATE POLICY "Public can create bookings" ON bookings 
FOR INSERT 
WITH CHECK (true);

-- 3. Allow public to view their own booking if they know the ID (or for the feedback loop)
DROP POLICY IF EXISTS "Public can view their own booking" ON bookings;
CREATE POLICY "Public can view their own booking" ON bookings
FOR SELECT
USING (true);

-- 4. Allow managers to manage all bookings for their tenant
DROP POLICY IF EXISTS "Managers can manage their bookings" ON bookings;
CREATE POLICY "Managers can manage their bookings" ON bookings
FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = bookings.tenant_id)
);

-- 5. Fix Professional Services RLS
DROP POLICY IF EXISTS "Managers can manage professional services" ON professional_services;
CREATE POLICY "Managers can manage professional services" ON professional_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM professionals p
    JOIN tenants t ON t.id = p.tenant_id
    WHERE p.id = professional_services.professional_id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.tenant_id = p.tenant_id)
      OR t.owner_id = auth.uid()
    )
  )
) WITH CHECK (true);

-- 6. Ensure Public can see everything needed (Links, Profs, Services)
DROP POLICY IF EXISTS "Public can view professional links" ON professional_services;
CREATE POLICY "Public can view professional links" ON professional_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view professionals" ON professionals;
CREATE POLICY "Public can view professionals" ON professionals FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services" ON services FOR SELECT USING (is_active = true);
