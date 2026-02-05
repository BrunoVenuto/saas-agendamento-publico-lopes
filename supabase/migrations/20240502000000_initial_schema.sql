-- AGENDIFY - Supabase Schema

-- 1. Tables

-- Tenants (Establishments)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  primary_color TEXT DEFAULT '#be185d',
  logo_url TEXT,
  niche TEXT CHECK (niche IN ('SALON', 'CLINIC', 'PETSHOP', 'PERSONAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

-- Profiles (User specific data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  full_name TEXT,
  role TEXT CHECK (role IN ('TENANT_ADMIN', 'STAFF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professionals
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Services (Many-to-Many)
CREATE TABLE professional_services (
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);

-- Availability (Working Hours)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(professional_id, day_of_week)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  professional_id UUID REFERENCES professionals(id),
  client_name TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS Policies

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Tenants: Owners can manage their tenants, everyone can view public info
CREATE POLICY "Public can view tenant info" ON tenants FOR SELECT USING (true);
CREATE POLICY "Owners can manage their tenants" ON tenants ALL USING (auth.uid() = owner_id);

-- Profiles: Users can manage their own profile
CREATE POLICY "Users can manage their profiles" ON profiles ALL USING (auth.uid() = id);

-- Services: Managers can manage, public can view
CREATE POLICY "Public can view services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage services" ON services ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = services.tenant_id)
);

-- Professionals: Managers can manage, public can view
CREATE POLICY "Public can view professionals" ON professionals FOR SELECT USING (is_active = true);
CREATE POLICY "Managers can manage professionals" ON professionals ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = professionals.tenant_id)
);

-- Professional Services: Same as professionals
CREATE POLICY "Public can view professional services" ON professional_services FOR SELECT USING (true);
CREATE POLICY "Managers can manage professional services" ON professional_services ALL USING (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = professional_services.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
);

-- Availability: Same as professionals
CREATE POLICY "Public can view availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Managers can manage availability" ON availability ALL USING (
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = availability.professional_id AND professionals.tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ))
);

-- Bookings: Managers can manage their tenant bookings, public can create
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their tenant bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = bookings.tenant_id)
);
CREATE POLICY "Users can update their tenant bookings" ON bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = bookings.tenant_id)
);

-- 3. Functions/Triggers (Optional but useful for slot generation logic)
-- We'll handle most slot logic in the service layer for flexibility, 
-- but RLS covers the security part.
