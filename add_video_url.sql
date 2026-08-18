-- 1. Ajouter la colonne video_url à la table tracks
ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS video_url text;
