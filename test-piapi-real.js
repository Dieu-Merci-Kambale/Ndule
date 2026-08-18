const url = 'https://api.piapi.ai/api/v1/task';
const key = '169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5';

async function test() {
  const payload = {
    model: "suno",
    task_type: "music_custom",
    input: {
      prompt: "[Verse 1]\nTesting vocal custom mode",
      tags: "congolese rumba, soukous, slow guitar, male vocal, male singer, clear vocals",
      title: "Test Song",
      make_instrumental: false,
      mv: "chirp-crow"
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("STATUS:", response.status);
  console.log("RESPONSE:", text);
}

test();
