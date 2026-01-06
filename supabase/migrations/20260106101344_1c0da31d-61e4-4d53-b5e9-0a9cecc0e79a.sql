-- Create refund_requests table
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_value text NOT NULL,
  order_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  admin_note text
);

-- Enable RLS
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert refund requests
CREATE POLICY "Public can insert refund requests"
ON public.refund_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to read their refund requests by token
CREATE POLICY "Public can read refund requests"
ON public.refund_requests
FOR SELECT
TO public
USING (true);

-- Admins can manage all refund requests
CREATE POLICY "Admins can manage refund requests"
ON public.refund_requests
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));