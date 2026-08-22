-- Ajouter la colonne is_admin à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Si tu as déjà un compte créé et que tu veux te promouvoir en administrateur, 
-- utilise cette commande en remplaçant l'adresse email par la tienne :
-- UPDATE public.profiles SET is_admin = true WHERE email = 'ton-email@gmail.com';
