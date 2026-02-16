-- 1. REMOVER a política que está causando o loop infinito (Recursion)
-- Essa política tentava olhar para a própria tabela de perfis para dar permissão, gerando o erro 500
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;

-- 2. Manter apenas a política básica (que já deve existir)
-- Isso permite que qualquer usuário (inclusive você) veja o PRÓPRIO perfil sem erro.
-- Se por algum motivo ela não existir, o comando abaixo garante:
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- 3. Garantir que o Super Admin ainda tem acesso às outras tabelas (onde não há recursão)
-- Aqui usamos a função que criamos anteriormente, que é segura para outras tabelas.
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON tenants;
CREATE POLICY "Super admins can manage all tenants" ON tenants FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage all services" ON services;
CREATE POLICY "Super admins can manage all services" ON services FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage all professionals" ON professionals;
CREATE POLICY "Super admins can manage all professionals" ON professionals FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage all bookings" ON bookings;
CREATE POLICY "Super admins can manage all bookings" ON bookings FOR ALL USING (is_super_admin());
