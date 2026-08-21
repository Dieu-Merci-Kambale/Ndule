import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

serve(async (req) => {
  try {
    const body = await req.json()
    const { depositId, status } = body

    if (!depositId) {
      return new Response(JSON.stringify({ error: "Missing depositId" }), { status: 400 })
    }

    console.log("Webhook PawaPay reçu:", depositId, status)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const isSuccessStatus = (s: string) => ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(s?.toUpperCase());

    // 1. Fetch transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('deposit_id', depositId)
      .single()

    if (txError || !transaction) {
      console.error("Transaction non trouvée pour depositId:", depositId)
      return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404 })
    }

    // 2. Ignore if already processed
    if (isSuccessStatus(transaction.status)) {
      console.log("Transaction déjà traitée.")
      return new Response(JSON.stringify({ success: true, message: "Already processed" }), { status: 200 })
    }

    // 3. Update transaction status ATOMICALLY to prevent double crediting
    const { data: updatedTx } = await supabase
      .from('transactions')
      .update({ status: status })
      .eq('deposit_id', depositId)
      .not('status', 'in', '("COMPLETED","APPROVED","SUCCESS","SUCCESSFUL")')
      .select()
      .maybeSingle()

    // 4. If success AND we actually updated it, credit user
    if (isSuccessStatus(status) && updatedTx) {
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
        
        console.log(`Crédits ajoutés pour l'utilisateur ${transaction.user_id}: +${transaction.notes_amount}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    console.error("Webhook Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
