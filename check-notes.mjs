import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotes() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  console.log('Profiles:');
  console.log(JSON.stringify(data, null, 2));
}

checkNotes();
