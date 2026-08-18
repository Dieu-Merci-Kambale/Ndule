import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('id, title, audio_url, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching tracks:", error);
  } else {
    console.log("Last 10 tracks:", data);
  }
}

checkTracks();
