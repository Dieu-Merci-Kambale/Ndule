const msisdn = '2416331580';
fetch('https://crjtckwenyijnaygjmwc.supabase.co/functions/v1/pawapay-predict', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sb_publishable_aICqxQniMsI5Od61pHr9iA_VczBWVtD',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ msisdn })
}).then(r => r.text()).then(console.log);
