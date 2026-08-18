
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testExplore() {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, profiles!tracks_user_id_fkey(email)')
    .eq('is_public', true);

  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('Trouvé ' + data.length + ' chansons');
  }
}

testExplore();

