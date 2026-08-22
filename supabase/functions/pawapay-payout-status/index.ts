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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('User not authenticated')

    // Verifier si l'utilisateur est admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Unauthorized: Admins only')

    const { payoutId } = await req.json()
    if (!payoutId) {
      throw new Error("Missing payoutId parameter")
    }

    const apiUrl = `https://api.pawapay.io/v2/payouts/${payoutId}`
    
    const pawapayResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      }
    })

    const pawapayData = await pawapayResponse.json()
    
    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status} - ${JSON.stringify(pawapayData)}`)
    }

    // Mettre à jour le statut dans notre DB
    let newStatus = pawapayData[0]?.status || pawapayData.status
    let failureReason = pawapayData[0]?.failureReason || pawapayData.failureReason

    if (newStatus) {
       await supabase
         .from('withdrawals')
         .update({ status: newStatus })
         .eq('id', payoutId)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      status: newStatus,
      failureReason: failureReason,
      raw: pawapayData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error fetching payout status:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
