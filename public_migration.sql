-- 1. Ajouter la colonne is_public à la table tracks
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 2. Créer une nouvelle politique RLS pour permettre à tout le monde de lire les chansons publiques
-- Note: L'ancienne politique 'Les utilisateurs peuvent gérer leurs propres chansons' est pour TOUTES les opérations (all).
-- Nous ajoutons une politique spécifique pour SELECT qui autorise la lecture si is_public = true.
CREATE POLICY "Tout le monde peut voir les chansons publiques"
ON public.tracks
FOR SELECT
USING (is_public = true);
