import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { v4 as uuidv4 } from "https://deno.land/std@0.168.0/uuid/mod.ts"

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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('User not authenticated')

    // Verifier si l'utilisateur est admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Unauthorized: Admins only')

    const { amount, network, phone } = await req.json()
    if (!amount || !network || !phone) {
      throw new Error("Missing required parameters (amount, network, phone)")
    }

    // Convertir USD en CDF pour PawaPay
    const amountCdf = Math.round(Number(amount) * 2850).toString()
    
    // Mapping des réseaux pour DRC
    const correspondentMap: Record<string, string> = {
      'ORANGE': 'ORANGE_CD',
      'MTN': 'MTN_MOMO_CD',
      'AIRTEL': 'AIRTEL_OAPI_CD',
      'MPESA': 'VODACOM_MPESA_CD'
    }
    
    const correspondent = correspondentMap[network] || 'ORANGE_CD'
    const payoutId = uuidv4()

    const apiUrl = 'https://api.pawapay.cloud/v1/payouts'
    
    const pawapayResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      },
      body: JSON.stringify({
        payoutId: payoutId,
        amount: amountCdf,
        currency: "CDF",
        correspondent: correspondent,
        recipient: {
          type: "MSISDN",
          address: phone.replace('+', '') // S'assurer que le numéro est au format requis (sans le + ou avec, selon l'API PawaPay)
        },
        statementDescription: "Retrait Ndule Admin"
      })
    })

    const pawapayData = await pawapayResponse.json()
    console.log("PawaPay Payout Response:", pawapayData)

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status} - ${JSON.stringify(pawapayData)}`)
    }

    // Enregistrer la transaction dans la table withdrawals
    const { error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        id: payoutId, // Utiliser le même ID pour pouvoir le suivre plus tard avec le webhook de payout
        amount: Number(amount),
        network: network,
        phone: phone,
        status: pawapayData.status || 'PENDING'
      })

    if (insertError) {
      console.error("Failed to insert withdrawal to DB", insertError)
      // On ne jette pas d'erreur car le payout a reussi chez PawaPay.
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payoutId: payoutId,
      status: pawapayData.status 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error initiating payout:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
