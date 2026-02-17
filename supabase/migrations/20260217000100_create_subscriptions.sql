-- 0. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Criar tabela de assinaturas se não existir
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) DEFAULT 39.90,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OVERDUE', 'CANCELLED')),
    last_payment TIMESTAMP WITH TIME ZONE,
    next_payment TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- 2. Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas (usando bloco DO para evitar erro se já existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins podem gerenciar assinaturas') THEN
        CREATE POLICY "Super admins podem gerenciar assinaturas" ON subscriptions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'SUPER_ADMIN'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants podem ver sua própria assinatura') THEN
        CREATE POLICY "Tenants podem ver sua própria assinatura" ON subscriptions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.tenant_id = subscriptions.tenant_id
                )
            );
    END IF;
END
$$;

-- 4. Popular tenants existentes na tabela de assinaturas
INSERT INTO subscriptions (tenant_id, amount, status, last_payment, next_payment)
SELECT 
    id as tenant_id, 
    39.90 as amount, 
    'ACTIVE' as status, 
    NOW() as last_payment, 
    NOW() + INTERVAL '1 month' as next_payment
FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;
