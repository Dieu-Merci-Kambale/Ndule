import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env' });
// Or if you don't have .env locally, I can just ask for the last withdrawal from the DB to get the payoutId, then call PawaPay.
// Let's just write a script that queries Supabase to get the last withdrawal's ID, then we will tell the user we need to check the status.
