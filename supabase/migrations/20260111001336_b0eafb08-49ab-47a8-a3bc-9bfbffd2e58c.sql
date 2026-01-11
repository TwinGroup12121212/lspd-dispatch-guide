-- Create document categories table
CREATE TABLE public.dokument_kategorien (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dokument_kategorien ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Authenticated users can view document categories"
  ON public.dokument_kategorien FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage categories
CREATE POLICY "Admins can insert document categories"
  ON public.dokument_kategorien FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update document categories"
  ON public.dokument_kategorien FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete document categories"
  ON public.dokument_kategorien FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id to dokumente table
ALTER TABLE public.dokumente 
ADD COLUMN kategorie_id uuid REFERENCES public.dokument_kategorien(id) ON DELETE SET NULL;

-- Insert default categories
INSERT INTO public.dokument_kategorien (name, sort_order) VALUES
  ('Protokolle von Dienstbesprechungen', 1),
  ('Beschlüsse', 2),
  ('Sonstiges', 99);