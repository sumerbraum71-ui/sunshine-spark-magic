-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can read own permissions" ON public.user_permissions;

-- Create policy that allows users to read their own permissions
CREATE POLICY "Users can read own permissions"
ON public.user_permissions
FOR SELECT
USING (user_id = auth.uid());