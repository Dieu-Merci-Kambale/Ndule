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

    const { depositId } = await req.json()
    if (!depositId) throw new Error('Missing depositId')

    // 1. Fetch transaction from our DB first to see if it's already completed
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('deposit_id', depositId)
      .eq('user_id', user.id)
      .single()

    if (txError || !transaction) {
      throw new Error('Transaction not found or unauthorized')
    }

    const isSuccessStatus = (s: string) => ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(s?.toUpperCase())
    const isFailedStatus = (s: string) => ['FAILED', 'CANCELLED', 'REJECTED'].includes(s?.toUpperCase())

    if (isSuccessStatus(transaction.status) || isFailedStatus(transaction.status)) {
      return new Response(JSON.stringify({ status: transaction.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Not completed yet? Let's ask PawaPay directly
    const apiUrl = `https://api.pawapay.cloud/v1/deposits/${depositId}`
    const pawapayResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAWAPAY_API_KEY}`
      }
    })

    if (!pawapayResponse.ok) {
      throw new Error(`PawaPay API Error: ${pawapayResponse.status}`)
    }

    const pawapayData = await pawapayResponse.json()
    const newStatus = pawapayData[0]?.status || pawapayData.status // Depending on PawaPay API return format (sometimes it returns array of 1)
    
    if (!newStatus) {
      return new Response(JSON.stringify({ status: 'PENDING' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. If status changed, update DB and credit user
    if (newStatus !== transaction.status) {
      const { data: updatedTx } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('deposit_id', depositId)
        .not('status', 'in', '("COMPLETED","APPROVED","SUCCESS","SUCCESSFUL")')
        .select()
        .maybeSingle()

      if (isSuccessStatus(newStatus) && updatedTx) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('notes_balance')
          .eq('id', transaction.user_id)
          .single()

        if (profile) {
          const newBalance = (profile.notes_balance || 0) + transaction.notes_amount
          await supabase
            .from('profiles')
            .update({ notes_balance: newBalance })
            .eq('id', transaction.user_id)
        }
      }
    }

    return new Response(JSON.stringify({ status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error in pawapay-deposit-status:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
