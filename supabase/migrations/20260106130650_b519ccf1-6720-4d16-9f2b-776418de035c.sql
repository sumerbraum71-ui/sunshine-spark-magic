-- Create custom admin users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public to read for login verification
CREATE POLICY "Public can verify credentials"
ON public.admin_users
FOR SELECT
USING (true);

-- Insert admin user "boom" with password "boom"
INSERT INTO public.admin_users (username, password, is_admin)
VALUES ('boom', 'boom', true);