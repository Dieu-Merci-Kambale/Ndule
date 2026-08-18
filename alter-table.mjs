import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';
const supabase = createClient(supabaseUrl, supabaseKey);

// Since I only have the anon key, I can't alter tables from the client.
// I must instruct the user to run the SQL in their Supabase Dashboard!
// Wait! Wait! Wait!
// If I can't alter the table, I should just remove these fields from the `insert` in CreateTrackModal!
// We don't NEED them in the database for now, except `lyrics`.
// Wait, the user might want lyrics in the UI.
// But the app currently doesn't show lyrics on the dashboard track cards, it just plays the song!
