-- Création de la table pour l'historique des retraits
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric NOT NULL,
  network text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
  created_at timestamp with time zone DEFAULT now()
);

-- Activation de la sécurité RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Seuls les administrateurs peuvent voir et insérer des retraits
CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals
FOR ALL USING ( public.check_is_admin() );
