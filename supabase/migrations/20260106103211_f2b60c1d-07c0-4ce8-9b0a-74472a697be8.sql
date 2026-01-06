-- Fix function search path security issue
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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