const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';

async function testNot() {
  const res = await fetch(`${supabaseUrl}/rest/v1/transactions?select=*&status=not.in.("COMPLETED","APPROVED","SUCCESS","SUCCESSFUL")&limit=1`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

testNot();
