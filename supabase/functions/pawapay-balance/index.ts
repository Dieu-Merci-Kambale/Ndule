import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const PAWAPAY_API_KEY = Deno.env.get('PAWAPAY_API_KEY')

    if (!PAWAPAY_API_KEY) throw new Error('PAWAPAY_API_KEY not set')

    // Verifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('User not authenticated')

    // Verifier si l'utilisateur est admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Unauthorized: Admins only')

    // Tester plusieurs endpoints pour trouver le bon
    const urlsToTest = [
      'https://api.pawapay.io/wallet-balances',
      'https://api.pawapay.cloud/wallet-balances',
      'https://api.pawapay.io/v1/wallet-balances',
      'https://api.pawapay.cloud/v1/wallet-balances',
      'https://api.pawapay.io/v2/wallet-balances',
      'https://api.pawapay.cloud/v2/wallet-balances',
      'https://api.pawapay.io/v1/balances',
      'https://api.pawapay.cloud/v1/balances'
    ];
    
    let successData = null;
    let results = {};

    for (const apiUrl of urlsToTest) {
      try {
        const pawapayResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PAWAPAY_API_KEY}`
          }
        });

        results[apiUrl] = pawapayResponse.status;

        if (pawapayResponse.ok) {
          successData = await pawapayResponse.json();
          break; // On a trouvé le bon !
        }
      } catch (e) {
        results[apiUrl] = 'Network Error';
      }
    }

    if (!successData) {
      return new Response(JSON.stringify({ 
        error: `Aucun endpoint n'a fonctionné. Résultats: ${JSON.stringify(results)}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    let availableCdf = 0
    let availableUsd = 0
    
    const walletsArray = Array.isArray(successData) ? successData : (successData.balances || [])
    
    walletsArray.forEach((wallet: any) => {
      if (wallet.currency === 'CDF') {
         availableCdf += Number(wallet.balance || 0)
      } else if (wallet.currency === 'USD') {
         availableUsd += Number(wallet.balance || 0)
      }
    })
    
    // Si on a des CDF, on ajoute leur équivalent en USD au total USD (approx 2850)
    // Et inversement pour le total CDF global
    let totalUsd = availableUsd + (availableCdf / 2850)
    let totalCdf = availableCdf + (availableUsd * 2850)

    return new Response(JSON.stringify({ 
      balances: successData,
      availableUsd: Math.round(totalUsd * 100) / 100,
      availableCdf: Math.round(totalCdf)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error fetching balance:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
