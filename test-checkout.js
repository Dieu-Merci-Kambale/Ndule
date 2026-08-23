const supabaseUrl = 'https://crjtckwenyijnaygjmwc.supabase.co';
const supabaseKey = 'sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD';

async function testCheckout() {
  console.log("Testing pawapay-checkout edge function...");
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/pawapay-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}` // using anon key, wait, auth requires a user token
      },
      body: JSON.stringify({ planId: 'decouverte', notesAmount: 2, priceUsd: 1, currency: 'CDF' })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testCheckout();
