

const SUPABASE_URL = 'https://crjtckwenyijnaygjmwc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';

async function testPredict() {
  const msisdn = '243832238566';
  console.log('Testing msisdn:', msisdn);
  
  const res = await fetch(`${SUPABASE_URL}/functions/v1/pawapay-predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ msisdn })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testPredict();
