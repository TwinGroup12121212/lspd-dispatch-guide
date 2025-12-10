-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create straftat_typ enum
CREATE TYPE public.straftat_typ AS ENUM ('Verbrechen', 'Ordnungswidrigkeit', 'Verstoß');

-- Create kategorien table
CREATE TABLE public.kategorien (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create straftaten table
CREATE TABLE public.straftaten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kategorie_id UUID NOT NULL REFERENCES public.kategorien(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  typ straftat_typ NOT NULL DEFAULT 'Verbrechen',
  geldstrafe INTEGER NOT NULL DEFAULT 0,
  haftzeit INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategorien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.straftaten ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Kategorien policies (everyone can read, only admins can write)
CREATE POLICY "Everyone can view kategorien" ON public.kategorien
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert kategorien" ON public.kategorien
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update kategorien" ON public.kategorien
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete kategorien" ON public.kategorien
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Straftaten policies (everyone can read, only admins can write)
CREATE POLICY "Everyone can view straftaten" ON public.straftaten
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert straftaten" ON public.straftaten
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update straftaten" ON public.straftaten
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete straftaten" ON public.straftaten
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'display_name', new.email));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_straftaten_updated_at
  BEFORE UPDATE ON public.straftaten
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data (kategorien)
INSERT INTO public.kategorien (id, name, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Betäubungsmittelgesetz', 1),
  ('11111111-1111-1111-1111-111111111102', 'Gewalt-, Raub- und Eigentumdelikte', 2),
  ('11111111-1111-1111-1111-111111111103', 'Korruption, Amtsmissbrauch und Amtsanmaßung', 3),
  ('11111111-1111-1111-1111-111111111104', 'Prostitution und Menschenhandel', 4),
  ('11111111-1111-1111-1111-111111111105', 'Verkehrsrecht der Stadt Los Santos', 5),
  ('11111111-1111-1111-1111-111111111106', 'Waffen- und Sprengstoffrecht', 6),
  ('11111111-1111-1111-1111-111111111107', '§ 105 Geschwindigkeitsüberschreitungen Innerorts (max. 115 km/h) Landstraße: - 50 % niedriger', 7);

-- Insert initial straftaten
INSERT INTO public.straftaten (kategorie_id, name, typ, geldstrafe, haftzeit, sort_order) VALUES
  -- Betäubungsmittelgesetz
  ('11111111-1111-1111-1111-111111111101', 'Weiche Drogen', 'Verbrechen', 1000, 10, 1),
  ('11111111-1111-1111-1111-111111111101', 'Klein Handel', 'Verbrechen', 0, 25, 2),
  ('11111111-1111-1111-1111-111111111101', 'Mittlerer Handel', 'Verbrechen', 0, 35, 3),
  ('11111111-1111-1111-1111-111111111101', 'Großhandel', 'Verbrechen', 0, 45, 4),
  ('11111111-1111-1111-1111-111111111101', 'Herstellung/Drogenlabor', 'Verbrechen', 0, 40, 5),
  
  -- Gewalt-, Raub- und Eigentumdelikte
  ('11111111-1111-1111-1111-111111111102', 'Einfache Körperverletzung', 'Verbrechen', 1000, 15, 1),
  ('11111111-1111-1111-1111-111111111102', 'Gefährliche Körperverletzung', 'Verbrechen', 2000, 30, 2),
  ('11111111-1111-1111-1111-111111111102', 'Schwere Körperverletzung', 'Verbrechen', 3000, 40, 3),
  ('11111111-1111-1111-1111-111111111102', 'Fahrlässige Tötung', 'Verbrechen', 3000, 40, 4),
  ('11111111-1111-1111-1111-111111111102', 'Totschlag', 'Verbrechen', 6000, 80, 5),
  ('11111111-1111-1111-1111-111111111102', 'Mord/ versuchter Mord', 'Verbrechen', 0, 120, 6),
  ('11111111-1111-1111-1111-111111111102', 'Einfacher Raub', 'Verbrechen', 3000, 35, 7),
  ('11111111-1111-1111-1111-111111111102', 'Hausraub', 'Verbrechen', 5000, 55, 8),
  ('11111111-1111-1111-1111-111111111102', 'Ladenraub', 'Verbrechen', 4000, 40, 9),
  ('11111111-1111-1111-1111-111111111102', 'Bankraub', 'Verbrechen', 8000, 80, 10),
  ('11111111-1111-1111-1111-111111111102', 'Geldautomatenraub', 'Verbrechen', 5000, 60, 11),
  ('11111111-1111-1111-1111-111111111102', 'Fahrzeugraub', 'Verbrechen', 4500, 45, 12),
  ('11111111-1111-1111-1111-111111111102', 'Einbruchdiebstahl/Tresoraufbruch', 'Verbrechen', 5000, 50, 13),
  
  -- Korruption, Amtsmissbrauch und Amtsanmaßung
  ('11111111-1111-1111-1111-111111111103', 'Vorteilsannahme / Bestechung', 'Verbrechen', 2500, 25, 1),
  ('11111111-1111-1111-1111-111111111103', 'Amtsmissbrauch', 'Verbrechen', 4000, 40, 2),
  ('11111111-1111-1111-1111-111111111103', 'Geheimnisverrat / Informationsverkauf', 'Verbrechen', 5000, 50, 3),
  ('11111111-1111-1111-1111-111111111103', 'Behinderung eines FIB-Verfahrens', 'Verbrechen', 4000, 45, 4),
  
  -- Prostitution und Menschenhandel
  ('11111111-1111-1111-1111-111111111104', 'Unerlaubte Prostitution/ Verstoß gegen Auflagen', 'Verbrechen', 1000, 10, 1),
  ('11111111-1111-1111-1111-111111111104', 'Zwangsprostitution/Menschenhandel', 'Verbrechen', 6000, 70, 2),
  ('11111111-1111-1111-1111-111111111104', 'Zuhälterei/Ausbeutung', 'Verbrechen', 3000, 40, 3),
  
  -- Verkehrsrecht
  ('11111111-1111-1111-1111-111111111105', '§ 103 Fahren ohne Fahrzeugpapiere', 'Ordnungswidrigkeit', 300, 10, 1),
  ('11111111-1111-1111-1111-111111111105', '§ 106 Falschparken', 'Ordnungswidrigkeit', 150, 0, 2),
  ('11111111-1111-1111-1111-111111111105', '§ 108 Gefährdung des Straßenverkehrs', 'Ordnungswidrigkeit', 300, 0, 3),
  ('11111111-1111-1111-1111-111111111105', '§ 111 Unfallflucht', 'Ordnungswidrigkeit', 1000, 10, 4),
  ('11111111-1111-1111-1111-111111111105', '§ 102 Fahren ohne gültigen Führerschein', 'Verstoß', 1000, 10, 5),
  ('11111111-1111-1111-1111-111111111105', '§ 109 Illegale Straßenrennen', 'Verbrechen', 2000, 20, 6),
  ('11111111-1111-1111-1111-111111111105', '§ 110 Fahren unter Drogeneinfluss / Alkohol', 'Verbrechen', 1500, 15, 7),
  
  -- Waffen- und Sprengstoffrecht
  ('11111111-1111-1111-1111-111111111106', 'Unerlaubter Besitz einer Handfeuerwaffe', 'Verbrechen', 2000, 20, 1),
  ('11111111-1111-1111-1111-111111111106', 'Unerlaubtes Führen einer Handfeuerwaffe', 'Verbrechen', 2500, 25, 2),
  ('11111111-1111-1111-1111-111111111106', 'Besitz einer Langwaffe (zivil)', 'Verbrechen', 3000, 35, 3),
  ('11111111-1111-1111-1111-111111111106', 'Handel mit Langwaffen', 'Verbrechen', 4500, 45, 4),
  ('11111111-1111-1111-1111-111111111106', 'Besitz von Sprengstoff', 'Verbrechen', 5000, 50, 5),
  ('11111111-1111-1111-1111-111111111106', 'Vorbereitung eines Anschlags', 'Verbrechen', 0, 70, 6),
  
  -- Geschwindigkeitsüberschreitungen
  ('11111111-1111-1111-1111-111111111107', '1-20 km/h 150-300 $', 'Verbrechen', 150, 0, 1),
  ('11111111-1111-1111-1111-111111111107', '21-40 km/h 300-600 $', 'Verbrechen', 300, 0, 2),
  ('11111111-1111-1111-1111-111111111107', '41-60 km/h 750-1 000 $', 'Verbrechen', 750, 0, 3),
  ('11111111-1111-1111-1111-111111111107', '61-100 km/h 1 250-1 750 $', 'Verbrechen', 1250, 0, 4),
  ('11111111-1111-1111-1111-111111111107', 'über 100 km/h 1 500-2 000 $ (KEINE HE)', 'Verbrechen', 1500, 0, 5);