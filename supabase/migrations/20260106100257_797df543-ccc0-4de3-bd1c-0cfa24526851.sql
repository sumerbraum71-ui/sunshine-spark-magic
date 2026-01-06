-- Add is_read column to order_messages table
ALTER TABLE public.order_messages 
ADD COLUMN is_read boolean NOT NULL DEFAULT false;

-- Allow public to update order_messages (for marking as read)
DROP POLICY IF EXISTS "Anyone can update order messages" ON public.order_messages;

CREATE POLICY "Anyone can update order messages"
ON public.order_messages
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);