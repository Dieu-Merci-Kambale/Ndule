const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';

async function check() {
  const res = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&order=created_at.desc&limit=5`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
