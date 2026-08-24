import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('tracks').select('*').not('audio_url', 'is', null).limit(10);
console.log('Data:', JSON.stringify(data, null, 2));
console.log('Error:', error);
