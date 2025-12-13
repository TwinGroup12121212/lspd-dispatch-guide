-- Add must_change_password column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Create einheiten (units) table
CREATE TABLE IF NOT EXISTS public.einheiten (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  typ text NOT NULL DEFAULT 'Adam',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on einheiten
ALTER TABLE public.einheiten ENABLE ROW LEVEL SECURITY;

-- RLS policies for einheiten
CREATE POLICY "Authenticated users can view einheiten" ON public.einheiten FOR SELECT USING (true);
CREATE POLICY "Admins can insert einheiten" ON public.einheiten FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update einheiten" ON public.einheiten FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete einheiten" ON public.einheiten FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default units
INSERT INTO public.einheiten (name, typ, sort_order) VALUES
  ('Adam 1', 'Adam', 1),
  ('Adam 2', 'Adam', 2),
  ('Adam 3', 'Adam', 3),
  ('Lincoln 1', 'Lincoln', 4),
  ('Lincoln 2', 'Lincoln', 5),
  ('Lincoln 3', 'Lincoln', 6);

-- Create leitstellenblatt table for persistence
CREATE TABLE IF NOT EXISTS public.leitstellenblatt (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id uuid REFERENCES public.mitarbeiter(id) ON DELETE SET NULL,
  leitstelle_id uuid REFERENCES public.mitarbeiter(id) ON DELETE SET NULL,
  hinweise text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on leitstellenblatt
ALTER TABLE public.leitstellenblatt ENABLE ROW LEVEL SECURITY;

-- RLS policies for leitstellenblatt
CREATE POLICY "Authenticated users can view leitstellenblatt" ON public.leitstellenblatt FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert leitstellenblatt" ON public.leitstellenblatt FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update leitstellenblatt" ON public.leitstellenblatt FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create leitstellenblatt_einheiten junction table
CREATE TABLE IF NOT EXISTS public.leitstellenblatt_einheiten (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leitstellenblatt_id uuid REFERENCES public.leitstellenblatt(id) ON DELETE CASCADE,
  einheit_id uuid REFERENCES public.einheiten(id) ON DELETE CASCADE,
  mitarbeiter_id uuid REFERENCES public.mitarbeiter(id) ON DELETE SET NULL,
  funker_id uuid REFERENCES public.mitarbeiter(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- Enable RLS on leitstellenblatt_einheiten
ALTER TABLE public.leitstellenblatt_einheiten ENABLE ROW LEVEL SECURITY;

-- RLS policies for leitstellenblatt_einheiten
CREATE POLICY "Authenticated users can view leitstellenblatt_einheiten" ON public.leitstellenblatt_einheiten FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert leitstellenblatt_einheiten" ON public.leitstellenblatt_einheiten FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update leitstellenblatt_einheiten" ON public.leitstellenblatt_einheiten FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete leitstellenblatt_einheiten" ON public.leitstellenblatt_einheiten FOR DELETE USING (auth.uid() IS NOT NULL);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.einheiten;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leitstellenblatt;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leitstellenblatt_einheiten;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mitarbeiter;