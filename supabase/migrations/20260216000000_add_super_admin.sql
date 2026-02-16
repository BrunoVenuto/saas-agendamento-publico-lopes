-- Add SUPER_ADMIN to allowed roles
ALTER TABLE profiles 
DROP CONSTRAINT profiles_role_check,
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF'));

-- Update RLS Policies for SUPER_ADMIN access

-- Tenants: Super admins can see and manage all tenants
CREATE POLICY "Super admins can manage all tenants" 
ON tenants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'SUPER_ADMIN'
  )
);

-- Profiles: Super admins can see all profiles
CREATE POLICY "Super admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'SUPER_ADMIN'
  )
);

-- Services: Super admins can see all services
CREATE POLICY "Super admins can view all services" 
ON services 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'SUPER_ADMIN'
  )
);

-- Professionals: Super admins can see all professionals
CREATE POLICY "Super admins can view all professionals" 
ON professionals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'SUPER_ADMIN'
  )
);

-- Bookings: Super admins can see all bookings
CREATE POLICY "Super admins can view all bookings" 
ON bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'SUPER_ADMIN'
  )
);
