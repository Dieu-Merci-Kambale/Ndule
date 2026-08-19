import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

serve(async () => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: pendingTxs } = await supabase.from('transactions').select('*').eq('status', 'pending')
    const pawapayKey = Deno.env.get('PAWAPAY_API_KEY')
    const results = []
    
    for (const tx of pendingTxs || []) {
        const pawaRes = await fetch(`https://api.pawapay.cloud/v1/deposits/${tx.deposit_id}`, {
            headers: { 'Authorization': `Bearer ${pawapayKey}` }
        })
        const pawaData = await pawaRes.json()
        const pawaStatus = Array.isArray(pawaData) ? pawaData[0]?.status : pawaData?.status
        
        if (pawaStatus === 'COMPLETED' || pawaStatus === 'SUCCESSFUL') {
            await supabase.from('transactions').update({ status: pawaStatus }).eq('deposit_id', tx.deposit_id)
            const { data: profile } = await supabase.from('profiles').select('notes_balance').eq('id', tx.user_id).single()
            if (profile) {
                const newBalance = (profile.notes_balance || 0) + tx.notes_amount
                await supabase.from('profiles').update({ notes_balance: newBalance }).eq('id', tx.user_id)
            }
            results.push({ id: tx.id, updatedTo: pawaStatus, added: tx.notes_amount })
        } else {
            results.push({ id: tx.id, statusRemains: pawaStatus })
        }
    }
    
    return new Response(JSON.stringify({ processed: results }), { headers: { 'Content-Type': 'application/json' }})
})
