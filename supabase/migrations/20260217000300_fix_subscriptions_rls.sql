-- Reset RLS policies for subscriptions table to avoid conflicts
-- Drop English policies (from previous versions)
DROP POLICY IF EXISTS "Super admins can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Tenants can view their own subscription" ON subscriptions;

-- Drop Portuguese policies (to recreate them cleanly)
DROP POLICY IF EXISTS "Super admins podem gerenciar assinaturas" ON subscriptions;
DROP POLICY IF EXISTS "Tenants podem ver sua própria assinatura" ON subscriptions;

-- Re-create policies
-- 1. Super Admin: Full access (Select, Insert, Update, Delete)
CREATE POLICY "Super admins podem gerenciar assinaturas" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'SUPER_ADMIN'
        )
    );

-- 2. Tenants: Read-only access to their own subscription
CREATE POLICY "Tenants podem ver sua própria assinatura" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = subscriptions.tenant_id
        )
    );
