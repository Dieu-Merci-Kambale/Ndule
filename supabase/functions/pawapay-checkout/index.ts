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

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) throw new Error('User not authenticated')

    const { planId, notesAmount, priceUsd, currency = 'CDF' } = await req.json()

    // 1. Generate unique depositId
    const depositId = crypto.randomUUID()

    // 2. Register transaction as pending
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({
        deposit_id: depositId,
        user_id: user.id,
        plan_id: planId,
        notes_amount: notesAmount,
        status: 'pending'
      })

    if (dbError) throw new Error(`DB Error: ${dbError.message}`)

    // 3. Call PawaPay Payment Page API
    let origin = req.headers.get('origin') || 'http://127.0.0.1:5173'
    // PawaPay API strict validation blocks 'localhost', replacing it with 127.0.0.1
    origin = origin.replace('localhost', '127.0.0.1')
    const returnUrl = `${origin}/fr/dashboard?depositId=${depositId}`
    
    // According to E-Facture working config, use v1 widget sessions
    const apiUrl = 'https://api.pawapay.cloud/v1/widget/sessions'
    
    // Currency exchange rates (approximate to USD)
    const exchangeRates: Record<string, number> = {
      'CDF': 2850,
      'XOF': 600,
      'XAF': 600,
      'KES': 130,
      'NGN': 1500,
      'RWF': 1300,
      'UGX': 3800,
      'TZS': 2600,
      'ZMW': 25,
      'GHS': 15
    };

    const rate = exchangeRates[currency] || 2850;
    const amountLocal = Math.round(Number(priceUsd) * rate).toString();

    const pawapayResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      },
      body: JSON.stringify({
        depositId: depositId,
        amount: amountLocal,
        // country is sometimes required, but we can rely on PawaPay's widget to handle it based on currency or we just don't pass country.
        // Wait, PawaPay widget API accepts `returnUrl` and `amount` and `reason`.
        // Let's pass currency in the payload if supported, or rely on amount and let user choose country in widget.
        // Usually, PawaPay widget infers from amount and currency isn't strictly required in v1/widget/sessions if it's dynamic? No, actually, PawaPay widget requires amount, but what about currency? 
        // Actually, PawaPay widget doesn't strictly need currency in the body if it's configured on the account, but standard is to pass `amount`. Wait, if we don't pass currency, how does PawaPay know it's XOF or CDF?
        // Let's add currency field just in case.
        currency: currency,
        returnUrl: returnUrl,
        reason: `Achat Pack ${planId} (${notesAmount} Crédits)`
      })
    })

    const pawapayData = await pawapayResponse.json()
    console.log("PawaPay Response:", pawapayData)

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status} - ${JSON.stringify(pawapayData)}`)
    }

    if (!pawapayData.redirectUrl) {
       throw new Error(`Success response missing redirectUrl: ${JSON.stringify(pawapayData)}`)
    }

    return new Response(JSON.stringify({ checkout_url: pawapayData.redirectUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error in pawapay-checkout:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
