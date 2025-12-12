-- Create table for storing employees (Mitarbeiter) in the database
CREATE TABLE public.mitarbeiter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dienstnummer TEXT NOT NULL,
  rang TEXT NOT NULL,
  abteilung TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktiv',
  geraete TEXT,
  qualifikationen TEXT,
  notizen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mitarbeiter ENABLE ROW LEVEL SECURITY;

-- Everyone can view mitarbeiter (authenticated users)
CREATE POLICY "Authenticated users can view mitarbeiter"
ON public.mitarbeiter
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert mitarbeiter"
ON public.mitarbeiter
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mitarbeiter"
ON public.mitarbeiter
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mitarbeiter"
ON public.mitarbeiter
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_mitarbeiter_updated_at
BEFORE UPDATE ON public.mitarbeiter
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for strafkatalog locks (real-time editing lock)
CREATE TABLE public.strafkatalog_lock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '120 seconds')
);

-- Enable RLS
ALTER TABLE public.strafkatalog_lock ENABLE ROW LEVEL SECURITY;

-- Everyone can view the lock status
CREATE POLICY "Authenticated users can view lock"
ON public.strafkatalog_lock
FOR SELECT
TO authenticated
USING (true);

-- Everyone can insert/update/delete their own lock
CREATE POLICY "Users can manage their own lock"
ON public.strafkatalog_lock
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all locks
CREATE POLICY "Admins can manage all locks"
ON public.strafkatalog_lock
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Enable realtime for the lock table
ALTER PUBLICATION supabase_realtime ADD TABLE public.strafkatalog_lock;