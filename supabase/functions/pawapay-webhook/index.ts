import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("PawaPay Webhook Payload:", payload)

    // Typically PawaPay sends { depositId, status, ... }
    // Or it might be wrapped in an array if batch
    // We handle the single object case:
    const data = Array.isArray(payload) ? payload[0] : payload;
    const { depositId, status } = data;

    if (!depositId || !status) {
      return new Response("Missing depositId or status", { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // 1. Fetch transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('deposit_id', depositId)
      .single()

    if (txError || !transaction) {
      console.error("Transaction not found for depositId:", depositId)
      return new Response("Transaction not found", { status: 404 })
    }

    // 2. Only process if it is not already completed to avoid double counting
    if (transaction.status === 'COMPLETED' || transaction.status === 'completed') {
      return new Response("Transaction already processed", { status: 200 })
    }

    // 3. Update transaction status
    await supabase
      .from('transactions')
      .update({ status: status })
      .eq('deposit_id', depositId)

    // 4. If status is COMPLETED, add notes
    if (status === 'COMPLETED') {
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
        
        console.log(`Successfully credited ${transaction.notes_amount} to user ${transaction.user_id}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Webhook Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
})
