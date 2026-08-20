
async function testPiAPI() {
  const API_KEY = '169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5';
  const API_URL = 'https://api.piapi.ai/api/v1/task';

  const payload = {
    model: "suno",
    task_type: "music",
    input: {
      prompt: "[Verse 1]\nTest custom lyrics",
      tags: "Afrobeat",
      title: "Test Song",
      make_instrumental: false,
      custom_mode: true,
      wait_audio: true,
      mv: "chirp-crow"
    }
  };

  console.log("Sending request to PiAPI...");
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

testPiAPI();
