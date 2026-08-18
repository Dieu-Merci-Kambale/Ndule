import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('id, occasion')
    .limit(1);

  if (error) {
    console.error('Error fetching tracks:', error);
  } else {
    console.log('Latest tracks:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkTracks();
