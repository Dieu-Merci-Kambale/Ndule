import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from('profiles').select('email, id');
  if (error) {
    console.error("Error fetching profiles:", error.message);
  } else {
    console.log(`Found ${data.length} rows in profiles table.`);
    console.log(data);
  }
}

check();
