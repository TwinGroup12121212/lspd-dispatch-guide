-- Create dokumente table for storing document links
CREATE TABLE public.dokumente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  created_by_name text NOT NULL
);

-- Enable RLS
ALTER TABLE public.dokumente ENABLE ROW LEVEL SECURITY;

-- Everyone can view documents
CREATE POLICY "Authenticated users can view documents"
  ON public.dokumente FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert documents
CREATE POLICY "Admins can insert documents"
  ON public.dokumente FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update documents
CREATE POLICY "Admins can update documents"
  ON public.dokumente FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON public.dokumente FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_dokumente_created_at ON public.dokumente(created_at DESC);