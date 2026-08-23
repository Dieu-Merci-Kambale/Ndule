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

    const body = await req.json()
    console.log("Received payload:", body)
    const { planId, notesAmount, priceUsd, countryIso3, msisdn, correspondent } = body

    if (!correspondent) throw new Error(`Correspondent is missing. Received payload: ${JSON.stringify(body)}`);

    // Calculate local amount based on exchange rates and detect correct currency
    const countryConfig: Record<string, { currency: string, rate: number }> = {
      'BEN': { currency: 'XOF', rate: 600 },
      'SEN': { currency: 'XOF', rate: 600 },
      'BFA': { currency: 'XOF', rate: 600 },
      'CIV': { currency: 'XOF', rate: 600 },
      'GAB': { currency: 'XAF', rate: 600 },
      'MLI': { currency: 'XOF', rate: 600 },
      'CMR': { currency: 'XAF', rate: 600 },
      'COG': { currency: 'XAF', rate: 600 },
      'COD': { currency: 'CDF', rate: 2850 },
      'GHA': { currency: 'GHS', rate: 15 },
      'KEN': { currency: 'KES', rate: 130 },
      'LSO': { currency: 'LSL', rate: 16 },
      'MWI': { currency: 'MWK', rate: 1740 },
      'RWA': { currency: 'RWF', rate: 1350 },
      'ZMB': { currency: 'ZMW', rate: 27 },
      'MOZ': { currency: 'MZN', rate: 64 },
      'UGA': { currency: 'UGX', rate: 3800 },
      'SLE': { currency: 'SLE', rate: 25 },
      'TZA': { currency: 'TZS', rate: 2600 },
      'NGA': { currency: 'NGN', rate: 1500 }
    };
    
    const config = countryConfig[countryIso3] || { currency: 'USD', rate: 1 };
    const amountLocal = Math.round(priceUsd * config.rate).toString();

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

    // 3. Call PawaPay Deposits API for direct USSD Push
    const apiUrl = 'https://api.pawapay.cloud/v1/deposits'

    const pawapayResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      },
      body: JSON.stringify({
        depositId: depositId,
        amount: amountLocal,
        currency: config.currency,
        correspondent: correspondent,
        payer: {
          type: "MSISDN",
          address: { value: msisdn }
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: `Ndule Pack ${planId}`
      })
    })

    const pawapayData = await pawapayResponse.json()
    console.log("PawaPay Response:", pawapayData)

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status} - ${JSON.stringify(pawapayData)}`)
    }

    return new Response(JSON.stringify({ depositId: depositId, status: pawapayData.status || 'PENDING' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error in pawapay-checkout:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
