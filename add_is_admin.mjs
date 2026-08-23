import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  // Let's try to select is_admin from profiles to see if it exists
  const { data, error } = await supabase.from('profiles').select('is_admin').limit(1);
  if (error) {
    console.log("Error selecting is_admin:", error.message);
  } else {
    console.log("is_admin exists:", data);
  }
}

checkSchema();
