import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'; // Not working in node. We can use REST API with fetch.
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: txs, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) console.error("Error:", error);
  console.log("Recent Transactions:", txs);
}

check();
