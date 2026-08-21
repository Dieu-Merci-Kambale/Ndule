import fs from 'fs';

async function runTest() {
  const API_KEY = '169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5';
  const API_URL = 'https://api.piapi.ai/api/v1/task';

  const payload = {
    model: "suno",
    task_type: "music",
    input: {
      prompt: "[Verse 1]\nOn a traversé tant de chemins\nLes souvenirs gravés entre nos mains\nAujourd'hui on se pose, on prend le temps\nPour célébrer cet unique moment\n\n[Chorus]\nEt on s'envole ce soir, plus haut que le ciel !\nDans ce rythme Rumba, la vie est si belle",
      tags: "rumba, male vocal",
      title: "Test Chanson",
      make_instrumental: false,
      mv: "chirp-crow"
    }
  };

  console.log("Submitting task to PiAPI...");
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
  if (data.code !== 200 || !data.data || !data.data.task_id) {
    console.error("Failed to create task:", data);
    return;
  }

  const taskId = data.data.task_id;
  console.log("Task created successfully! Task ID:", taskId);

  let status = "pending";
  let attempt = 0;

  while (status !== "completed" && status !== "failed" && attempt < 60) {
    attempt++;
    await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds

    const pollRes = await fetch(`${API_URL}/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'x-api-key': API_KEY
      }
    });

    const pollData = await pollRes.json();
    if (pollData.code === 200 && pollData.data) {
      status = pollData.data.status;
      console.log(`[Attempt ${attempt}] Status: ${status}`);

      if (status === "completed") {
        console.log("SUCCESS! Task completed.");
        const clips = pollData.data.output?.clips;
        if (clips) {
          const clipsArray = Object.values(clips);
          clipsArray.forEach((clip, index) => {
            console.log(`\nClip ${index + 1}:`);
            console.log("Audio URL:", clip.audio_url);
            console.log("Image URL:", clip.image_url);
            console.log("Duration:", clip.metadata?.duration);
          });
        } else {
          console.log("No clips found in output:", pollData.data.output);
        }
      } else if (status === "failed") {
        console.error("Task failed:", pollData.data);
      }
    } else {
      console.log(`[Attempt ${attempt}] Polling error or empty data:`, pollData);
    }
  }

  if (status !== "completed" && status !== "failed") {
    console.log("Polling timed out.");
  }
}

runTest();
