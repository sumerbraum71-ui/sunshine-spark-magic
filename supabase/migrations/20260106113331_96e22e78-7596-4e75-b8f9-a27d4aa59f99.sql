-- Add is_blocked column to tokens table
ALTER TABLE public.tokens 
ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;