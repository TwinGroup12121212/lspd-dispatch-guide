-- Add notizen column to straftaten table for additional notes/information
ALTER TABLE public.straftaten ADD COLUMN IF NOT EXISTS notizen text;