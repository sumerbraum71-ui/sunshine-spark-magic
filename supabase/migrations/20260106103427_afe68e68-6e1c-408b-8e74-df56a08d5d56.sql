-- Make order_number have a default value so it's not required in inserts
ALTER TABLE public.orders ALTER COLUMN order_number DROP NOT NULL;

-- The trigger will still populate it automatically