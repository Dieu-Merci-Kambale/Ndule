-- Migration pour ajouter les colonnes manquantes à la table tracks
-- À exécuter dans Supabase > SQL Editor

ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS occasion text,
ADD COLUMN IF NOT EXISTS story text,
ADD COLUMN IF NOT EXISTS voice_type text,
ADD COLUMN IF NOT EXISTS lyrics text;
