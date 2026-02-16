-- 1. Primeiro, removemos as políticas problemáticas que causaram a recursão
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;

-- 2. Criamos uma função auxiliar que ignora o RLS (SECURITY DEFINER)
-- Isso evita o erro de recursão infinita (Infinite Recursion)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizamos as políticas para usar a função
-- Para profiles, o Super Admin agora pode ver tudo
CREATE POLICY "Super admins can view all profiles" 
ON profiles 
FOR SELECT 
USING (is_super_admin());

-- 4. Opcional: Atualizar as outras tabelas para usar a função (mais limpo e performático)
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON tenants;
CREATE POLICY "Super admins can manage all tenants" ON tenants FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can view all services" ON services;
CREATE POLICY "Super admins can view all services" ON services FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can view all professionals" ON professionals;
CREATE POLICY "Super admins can view all professionals" ON professionals FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can view all bookings" ON bookings;
CREATE POLICY "Super admins can view all bookings" ON bookings FOR SELECT USING (is_super_admin());
