const key = process.env.GEMINI_API_KEY;

async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  const names = data.models
    ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name);
  console.log(JSON.stringify(names, null, 2));
}

test();
