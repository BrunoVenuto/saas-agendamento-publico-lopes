-- RLS FIX: Use a SECURITY DEFINER function to avoid recursion and ensure role checks always work.

-- 1. Create a helper function to get the current user's role securely
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 2. Drop existing policies on subscriptions to clean slate
DROP POLICY IF EXISTS "Super admins can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Tenants can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Super admins podem gerenciar assinaturas" ON subscriptions;
DROP POLICY IF EXISTS "Tenants podem ver sua própria assinatura" ON subscriptions;

-- 3. Recreate policies using the secure function
-- Super Admin: Full Access
CREATE POLICY "Super admins manage subscriptions" ON subscriptions
FOR ALL
USING (
  get_my_role() = 'SUPER_ADMIN'
);

-- Tenants: View Only their own subscription
CREATE POLICY "Tenants view own subscription" ON subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.tenant_id = subscriptions.tenant_id
  )
);
