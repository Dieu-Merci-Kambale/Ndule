async function test() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `Tu es un auteur-compositeur expert et récompensé. Ta mission est d'écrire les paroles complètes d'une chanson exceptionnelle de style "Rumba" pour l'occasion suivante : "Chanson d'amour".
L'histoire ou le sujet de la chanson est : "Love declaration to wife Kanyere from Alexandre Muhindo".

RÈGLES IMPORTANTES :
1. LONGUEUR OBLIGATOIRE : La chanson DOIT être très longue (au minimum 250 à 300 mots). Tu dois écrire au moins 2 très longs couplets, 3 refrains complets, et un pont détaillé. Ne fais jamais de chanson courte.
2. Utilise une structure musicale claire avec des balises en ANGLAIS entre crochets : [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus], [Outro].
3. Les paroles de la chanson doivent être rédigées DANS LA MÊME LANGUE que l'histoire fournie.
4. Les paroles doivent rimer, avoir un rythme naturel et transmettre une émotion forte.
5. STRICTEMENT AUCUN COMMENTAIRE : Ne génère surtout pas de résumé, ni de liste de vérification de tes contraintes, ni d'introduction. Commence IMMÉDIATEMENT ta réponse par "Titre : ". Tout mot qui n'est pas une parole de la chanson fera planter le système.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8192,
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
