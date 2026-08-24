import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('tracks').select('*').limit(1);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  }
}
checkSchema();
