-- Drop the existing order_number column and recreate with better format
ALTER TABLE public.orders DROP COLUMN IF EXISTS order_number;

-- Add order_number as text for custom format
ALTER TABLE public.orders ADD COLUMN order_number TEXT;

-- Create a function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 3) AS INTEGER)), 0) + 1
    INTO new_number
    FROM public.orders
    WHERE order_number LIKE year_prefix || '%';
    
    -- Format: YY + 4 digit padded number (e.g., 260001, 260002)
    NEW.order_number := year_prefix || LPAD(new_number::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Update existing orders with order numbers
DO $$
DECLARE
    r RECORD;
    counter INTEGER := 1;
    year_prefix TEXT := TO_CHAR(NOW(), 'YY');
BEGIN
    FOR r IN SELECT id FROM public.orders ORDER BY created_at ASC
    LOOP
        UPDATE public.orders 
        SET order_number = year_prefix || LPAD(counter::TEXT, 4, '0')
        WHERE id = r.id AND order_number IS NULL;
        counter := counter + 1;
    END LOOP;
END $$;

-- Make order_number NOT NULL after populating
ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_unique ON public.orders(order_number);