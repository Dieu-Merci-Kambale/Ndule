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

    // Appeler l'API PawaPay pour le solde
    const apiUrl = 'https://api.pawapay.cloud/v1/balances'
    
    const pawapayResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      }
    })

    const pawapayData = await pawapayResponse.json()
    console.log("PawaPay Balances:", pawapayData)

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status}`)
    }

    // PawaPay renvoie souvent un tableau par devise/wallet
    // Exemple simplifié, à ajuster selon la structure de la réponse exacte de PawaPay
    let available = 0
    
    if (Array.isArray(pawapayData)) {
       // Convertir le total CDF en USD pour l'affichage (approx 2850 CDF = 1 USD)
       pawapayData.forEach((wallet: any) => {
          if (wallet.currency === 'CDF') {
             available += (Number(wallet.balance) / 2850)
          } else if (wallet.currency === 'USD') {
             available += Number(wallet.balance)
          }
       })
    }

    return new Response(JSON.stringify({ 
      balances: pawapayData,
      availableUsd: Math.round(available * 100) / 100
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
