-- Create messages table for order chat
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read messages
CREATE POLICY "Anyone can read order messages"
ON public.order_messages
FOR SELECT
USING (true);

-- Anyone can insert messages
CREATE POLICY "Anyone can insert order messages"
ON public.order_messages
FOR INSERT
WITH CHECK (true);

-- Admins can manage all messages
CREATE POLICY "Admins can manage messages"
ON public.order_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for order_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;