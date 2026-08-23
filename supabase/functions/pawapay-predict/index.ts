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

    let pawapayData = null;
    let success = false;
    let errors = [];
    let isUnconfigured = false;

    // URL 1 expects POST
    try {
      const url = 'https://api.pawapay.cloud/v1/predict-correspondent';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${PAWAPAY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ msisdn })
      });
      const text = await res.text();
      if (res.ok) {
        pawapayData = JSON.parse(text);
        success = true;
      } else {
        if (text.includes("is not configured for this merchant")) {
          isUnconfigured = true;
        }
        errors.push(`URL ${url} Status ${res.status}: ${text}`);
      }
    } catch (e) {
      errors.push(`POST Error: ${e.message}`);
    }

    if (!success) {
      if (isUnconfigured) {
         return new Response(JSON.stringify({ error: "Ce pays n'est pas encore activé sur votre compte marchand PawaPay.", isUnconfigured: true }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      throw new Error(`PawaPay Predict Errors: ${errors.join(' | ')}`);
    }

    return new Response(JSON.stringify(pawapayData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error in pawapay-predict:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
