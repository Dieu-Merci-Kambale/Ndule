import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking transactions table...");
  const { data, error } = await supabase.from('transactions').select('*');
  if (error) {
    console.error("Error fetching transactions:", error.message);
  } else {
    console.log(`Found ${data.length} rows in transactions table.`);
    console.log(data);
  }
}

check();
