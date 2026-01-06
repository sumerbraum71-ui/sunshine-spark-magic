-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can read order messages" ON public.order_messages;
DROP POLICY IF EXISTS "Anyone can insert order messages" ON public.order_messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.order_messages;

-- Create permissive policies
CREATE POLICY "Anyone can read order messages"
ON public.order_messages
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert order messages"
ON public.order_messages
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage messages"
ON public.order_messages
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));