import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

serve(async () => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(1)
    const depositId = data[0].deposit_id
    const pawapayKey = Deno.env.get('PAWAPAY_API_KEY')
    
    const pawaRes = await fetch(`https://api.pawapay.cloud/v1/deposits/${depositId}`, {
      headers: { 'Authorization': `Bearer ${pawapayKey}` }
    })
    const pawaData = await pawaRes.json()
    
    return new Response(JSON.stringify({ transaction: data[0], pawapay: pawaData }), { headers: { 'Content-Type': 'application/json' }})
})
