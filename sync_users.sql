-- 1. Créer une fonction pour copier automatiquement les nouveaux inscrits
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, is_admin)
  VALUES (NEW.id, NEW.email, 5, false) -- On donne 5 crédits par défaut
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le déclencheur (Trigger) sur la table système auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Récupérer TOUS les anciens inscrits et les insérer dans profiles
INSERT INTO public.profiles (id, email, credits, is_admin)
SELECT id, email, 5, false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
