import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Calling gemini-proxy...");
  const prompt = `Tu es un auteur-compositeur expert et récompensé. Ta mission est d'écrire les paroles complètes d'une chanson exceptionnelle de style "Rumba" pour l'occasion suivante : "Chanson d'amour".
L'histoire ou le sujet de la chanson est : "Love declaration to wife Kanyere from Alexandre Muhindo".

RÈGLES IMPORTANTES :
1. La chanson doit être suffisamment longue pour durer entre 3 et 5 minutes (min. 250 mots).
2. Utilise une structure musicale claire avec des balises en ANGLAIS entre crochets : [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus], [Outro].
3. Les paroles de la chanson doivent être rédigées DANS LA MÊME LANGUE que l'histoire fournie.
4. Les paroles doivent rimer, avoir un rythme naturel et transmettre une émotion forte.
5. STRICTEMENT AUCUN COMMENTAIRE : Ne génère surtout pas de résumé, ni de liste de vérification de tes contraintes, ni d'introduction. Commence IMMÉDIATEMENT ta réponse par "Titre : ". Tout mot qui n'est pas une parole de la chanson fera planter le système.`;

  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { prompt }
  });

  if (error) {
    console.error("Error calling proxy:", error);
    return;
  }
  
  if (data?.error) {
    console.error("Proxy returned error:", data.error);
    return;
  }

  console.log("RESPONSE DATA:", JSON.stringify(data, null, 2));
  console.log("EXTRACTED TEXT:", data.candidates[0].content.parts[0].text);
}

test();
