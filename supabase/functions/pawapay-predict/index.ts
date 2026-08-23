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
    const PAWAPAY_API_KEY = Deno.env.get('PAWAPAY_API_KEY')
    if (!PAWAPAY_API_KEY) throw new Error('PAWAPAY_API_KEY not set')

    const body = await req.json()
    const { msisdn } = body

    if (!msisdn) throw new Error("msisdn is required");

    // We first try the known prediction endpoint
    let apiUrl = `https://api.pawapay.cloud/v1/widget/predict-correspondent?msisdn=${msisdn}`
    let pawapayResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      }
    })

    let pawapayData = await pawapayResponse.json()

    // If endpoint doesn't exist (404), maybe try v2
    if (pawapayResponse.status === 404) {
      apiUrl = `https://api.pawapay.cloud/v2/predict-provider?phoneNumber=${msisdn}`
      pawapayResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAWAPAY_API_KEY}`
        }
      })
      pawapayData = await pawapayResponse.json()
    }

    console.log("Predict Response:", pawapayData)

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay Predict Error: ${pawapayResponse.status} - ${JSON.stringify(pawapayData)}`)
    }

    return new Response(JSON.stringify(pawapayData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error in pawapay-predict:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
