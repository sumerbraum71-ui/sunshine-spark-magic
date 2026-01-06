-- Add order_number column to orders table
ALTER TABLE public.orders ADD COLUMN order_number SERIAL;

-- Create unique index on order_number
CREATE UNIQUE INDEX idx_orders_order_number ON public.orders(order_number);