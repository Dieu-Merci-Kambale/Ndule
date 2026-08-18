async function checkTask() {
  const API_KEY = '169a231d8f16487bc30b0a1221078012fdfbf2ad24926ccc73553cb76f9f80b5';
  const taskId = '0c7527b1-b780-43b8-beb0-3e875e00b66e';
  
  const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
    headers: { 'x-api-key': API_KEY }
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

checkTask();
