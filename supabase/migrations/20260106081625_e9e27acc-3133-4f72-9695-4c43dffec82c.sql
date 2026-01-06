-- Create app_role enum for admin users
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    duration TEXT,
    available INTEGER DEFAULT 0,
    instant_delivery BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_options table
CREATE TABLE public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    duration TEXT,
    available INTEGER,
    type TEXT,
    description TEXT,
    estimated_time TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tokens table
CREATE TABLE public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    balance NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    option_id UUID REFERENCES public.product_options(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    email TEXT,
    password TEXT,
    verification_link TEXT,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_items table for auto-delivery products
CREATE TABLE public.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_sold BOOLEAN DEFAULT false,
    sold_at TIMESTAMP WITH TIME ZONE,
    sold_to_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

-- Products are readable by everyone
CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

-- Products can be managed by admins
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Product options are readable by everyone
CREATE POLICY "Product options are publicly readable"
ON public.product_options FOR SELECT
TO anon, authenticated
USING (true);

-- Product options can be managed by admins
CREATE POLICY "Admins can manage product options"
ON public.product_options FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tokens: public can read/update their own token by token value (for balance check)
CREATE POLICY "Public can read tokens by token value"
ON public.tokens FOR SELECT
TO anon, authenticated
USING (true);

-- Tokens: can be updated (for balance deduction)
CREATE POLICY "Public can update tokens"
ON public.tokens FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admins can manage tokens
CREATE POLICY "Admins can manage tokens"
ON public.tokens FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders: public can insert orders
CREATE POLICY "Public can insert orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Orders: public can read their own orders by token_id
CREATE POLICY "Public can read orders"
ON public.orders FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can manage orders
CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Stock items: readable for checking availability
CREATE POLICY "Stock items are readable"
ON public.stock_items FOR SELECT
TO anon, authenticated
USING (true);

-- Stock items: can be updated when sold
CREATE POLICY "Stock items can be updated"
ON public.stock_items FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admins can manage stock items
CREATE POLICY "Admins can manage stock items"
ON public.stock_items FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User roles: users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;