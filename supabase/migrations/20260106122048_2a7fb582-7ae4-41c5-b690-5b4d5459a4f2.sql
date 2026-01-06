-- Create user_permissions table for granular permissions
CREATE TABLE public.user_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    can_manage_orders boolean DEFAULT false,
    can_manage_products boolean DEFAULT false,
    can_manage_tokens boolean DEFAULT false,
    can_manage_refunds boolean DEFAULT false,
    can_manage_users boolean DEFAULT false,
    can_manage_coupons boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies using has_role function
CREATE POLICY "Admins can manage permissions"
ON public.user_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own permissions"
ON public.user_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Create function to check specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Admins have all permissions
    IF has_role(_user_id, 'admin') THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    RETURN (
        SELECT 
            CASE _permission
                WHEN 'orders' THEN COALESCE(can_manage_orders, false)
                WHEN 'products' THEN COALESCE(can_manage_products, false)
                WHEN 'tokens' THEN COALESCE(can_manage_tokens, false)
                WHEN 'refunds' THEN COALESCE(can_manage_refunds, false)
                WHEN 'users' THEN COALESCE(can_manage_users, false)
                WHEN 'coupons' THEN COALESCE(can_manage_coupons, false)
                ELSE false
            END
        FROM public.user_permissions
        WHERE user_id = _user_id
    );
END;
$$;

-- Create trigger to auto-create permissions when user_role is added
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_permissions (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_role_created
    AFTER INSERT ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();