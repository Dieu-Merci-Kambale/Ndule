-- Politique pour permettre aux administrateurs de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Politique pour permettre aux administrateurs de voir toutes les chansons
CREATE POLICY "Admins can view all tracks" ON public.tracks
FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Politique pour permettre aux administrateurs de voir toutes les transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
