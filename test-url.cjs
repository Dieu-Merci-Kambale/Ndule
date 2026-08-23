const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xyz.supabase.co', 'eyJ...');

const query = supabase
  .from('transactions')
  .update({ status: 'COMPLETED' })
  .eq('deposit_id', '123')
  .not('status', 'in', '("COMPLETED","APPROVED","SUCCESS","SUCCESSFUL")')
  .select();

console.log(query.url.toString());
