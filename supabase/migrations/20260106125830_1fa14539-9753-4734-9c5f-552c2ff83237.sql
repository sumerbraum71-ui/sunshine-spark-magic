-- Drop existing restrictive policies and create new ones that use has_permission

-- Orders policies
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Users with permission can manage orders" 
ON public.orders 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'orders'))
WITH CHECK (has_permission(auth.uid(), 'orders'));

-- Products policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Users with permission can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'products'))
WITH CHECK (has_permission(auth.uid(), 'products'));

-- Product options policies
DROP POLICY IF EXISTS "Admins can manage product options" ON public.product_options;
CREATE POLICY "Users with permission can manage product options" 
ON public.product_options 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'products'))
WITH CHECK (has_permission(auth.uid(), 'products'));

-- Tokens policies
DROP POLICY IF EXISTS "Admins can manage tokens" ON public.tokens;
CREATE POLICY "Users with permission can manage tokens" 
ON public.tokens 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'tokens'))
WITH CHECK (has_permission(auth.uid(), 'tokens'));

-- Refund requests policies
DROP POLICY IF EXISTS "Admins can manage refund requests" ON public.refund_requests;
CREATE POLICY "Users with permission can manage refunds" 
ON public.refund_requests 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'refunds'))
WITH CHECK (has_permission(auth.uid(), 'refunds'));

-- Stock items policies
DROP POLICY IF EXISTS "Admins can manage stock items" ON public.stock_items;
CREATE POLICY "Users with permission can manage stock items" 
ON public.stock_items 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'products'))
WITH CHECK (has_permission(auth.uid(), 'products'));

-- Coupons policies
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Users with permission can manage coupons" 
ON public.coupons 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'coupons'))
WITH CHECK (has_permission(auth.uid(), 'coupons'));

-- Order messages policies
DROP POLICY IF EXISTS "Admins can manage messages" ON public.order_messages;
CREATE POLICY "Users with permission can manage messages" 
ON public.order_messages 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'orders'))
WITH CHECK (has_permission(auth.uid(), 'orders'));

-- User permissions policies (only admins or users can manage)
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.user_permissions;
CREATE POLICY "Users with permission can manage user permissions" 
ON public.user_permissions 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'users'))
WITH CHECK (has_permission(auth.uid(), 'users'));

-- User roles policies
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all user roles" ON public.user_roles;

CREATE POLICY "Users with permission can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_permission(auth.uid(), 'users'))
WITH CHECK (has_permission(auth.uid(), 'users'));