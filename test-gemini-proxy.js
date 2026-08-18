

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Authenticating as a test user or anonymously...");
  // We need a valid session to call the Edge Function.
  // Wait, I can just call the Edge Function directly without auth, but it will throw 401.
  // Let me just authenticate using a fake account or sign up a fake user, then call it.
  
  const email = `test_${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("Signed up user:", authData.user?.id);

  console.log("Calling gemini-proxy...");
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { prompt: "Dis bonjour" }
  });

  console.log("Response data:", data);
  console.log("Response error:", error);
}

test();
