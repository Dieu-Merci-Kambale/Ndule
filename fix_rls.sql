-- 1. Supprimer les anciennes politiques (qui causent le bug de déconnexion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all tracks" ON public.tracks;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- 2. Créer une fonction "bouclier" qui vérifie si on est admin sans déclencher de boucle infinie (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recréer les politiques de manière sécurisée en utilisant la fonction
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING ( public.check_is_admin() );

CREATE POLICY "Admins can view all tracks" ON public.tracks
FOR SELECT USING ( public.check_is_admin() );

CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING ( public.check_is_admin() );
