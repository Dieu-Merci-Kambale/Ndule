const key = '169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5';

async function test() {
  // PiAPI doesn't have a standard "list tasks" endpoint documented publicly easily, 
  // but we can query by task_id if we have one. We don't have the user's task_ids.
  // Wait, let's create a real task right now, with the exact payload!
  // And let's POLL it to see if it generates an instrumental!

  const payload = {
    model: "suno",
    task_type: "music",
    customMode: true,
    input: {
      prompt: "[Verse 1]\nTesting vocal custom mode",
      tags: "pop",
      title: "Test Song",
      make_instrumental: false,
      mv: "chirp-crow"
    }
  };

  console.log("Submitting task...");
  const response = await fetch('https://api.piapi.ai/api/v1/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key },
    body: JSON.stringify(payload)
  });

  const resData = await response.json();
  const taskId = resData.data.task_id;
  console.log("Task ID:", taskId);
  console.log("Parsed Input:", JSON.stringify(resData.data.input, null, 2));
}

test();
