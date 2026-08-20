

async function test() {
  const url = process.env.VITE_SUNO_API_URL;
  const key = process.env.SUNO_API_KEY;

  const payload = {
    model: "suno",
    task_type: "music",
    customMode: true,
    input: {
      prompt: "[Verse 1]\nTest custom lyrics here",
      tags: "pop, vocal",
      title: "Test",
      make_instrumental: false,
      mv: "chirp-crow"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("PIAPI RESPONSE HTTP STATUS:", response.status);
  console.log("PIAPI RESPONSE TEXT:", text);
}

test();
