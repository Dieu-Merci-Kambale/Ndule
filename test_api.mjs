async function testApi() {
  const API_KEY = "169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5";
  const API_URL = "https://api.piapi.ai/api/v1/task";

  const payload = {
    model: "suno",
    task_type: "music",
    input: {
      prompt: "105 BPM, Afrobeat moderne",
      tags: "afrobeat",
      title: "Test Song",
      make_instrumental: false,
      wait_audio: true,
      mv: "chirp-v3-5"
    }
  };

  console.log("Sending request to PiAPI...");
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
  console.log("Response:", JSON.stringify(data, null, 2));

  if (data?.data?.task_id) {
    console.log(`Polling task ${data.data.task_id}...`);
    const pollResponse = await fetch(`https://api.piapi.ai/api/v1/task/${data.data.task_id}`, {
      headers: { 'x-api-key': API_KEY }
    });
    const pollData = await pollResponse.json();
    console.log("Poll Response:", JSON.stringify(pollData, null, 2));
  }
}

testApi().catch(console.error);
