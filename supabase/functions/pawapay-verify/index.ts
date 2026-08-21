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
    const { depositId } = await req.json()
    if (!depositId) throw new Error('Missing depositId')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const PAWAPAY_API_KEY = Deno.env.get('PAWAPAY_API_KEY')

    if (!PAWAPAY_API_KEY) throw new Error('PAWAPAY_API_KEY not set')

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // 1. Fetch transaction from DB
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('deposit_id', depositId)
      .single()

    if (txError || !transaction) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const isSuccessStatus = (status: string) => ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(status?.toUpperCase());

    // If already processed, just return success
    if (isSuccessStatus(transaction.status)) {
      return new Response(JSON.stringify({ success: true, status: transaction.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Interrogate PawaPay for the real status
    const apiUrl = 'https://api.pawapay.cloud/v1' // Assuming E-Facture used v1
    const response = await fetch(`${apiUrl}/deposits/${depositId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PAWAPAY_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to check PawaPay status: ${response.statusText}`)
    }

    const data = await response.json()
    const pawaStatus = Array.isArray(data) ? data[0]?.status : data?.status

    if (!pawaStatus) {
      return new Response(JSON.stringify({ error: "Invalid status from PawaPay" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Update transaction status ATOMICALLY to prevent double crediting
    const { data: updatedTx } = await supabase
      .from('transactions')
      .update({ status: pawaStatus })
      .eq('deposit_id', depositId)
      .eq('status', 'pending') // Prevent race conditions
      .select()
      .single()

    // 4. If status is a success AND we actually updated it (it was pending before), add notes
    if (isSuccessStatus(pawaStatus) && updatedTx) {
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

    return new Response(JSON.stringify({ success: true, status: pawaStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Verification Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
