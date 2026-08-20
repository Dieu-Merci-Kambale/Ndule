/**
 * LyricsGenerationService.js
 * 
 * Ce service se connecte à une API LLM (Google Gemini ou OpenAI ChatGPT) pour générer 
 * des paroles de chanson structurées de qualité professionnelle.
 */

import { supabase } from '../lib/supabaseClient';

class LyricsGenerationService {
  constructor() {
    this.GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    this.OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  }

  buildPrompt(occasion, story, style) {
    return `Tu es un auteur-compositeur expert et récompensé. Ta mission est d'écrire les paroles complètes d'une chanson exceptionnelle de style "${style}" pour l'occasion suivante : "${occasion}".
L'histoire ou le sujet de la chanson est : "${story}".

RÈGLES IMPORTANTES : 
1. LONGUEUR OPTIMALE : La chanson DOIT contenir environ 150 à 200 mots (idéal pour l'IA musicale).
2. STRUCTURE DIRECTE : Commence IMMÉDIATEMENT par un [Verse 1]. N'utilise JAMAIS de balise [Intro] ou [Outro], car cela force l'IA à créer un instrumental.
3. BALISES EN ANGLAIS : Utilise uniquement [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge].
4. LANGUE : La chanson DOIT être DANS LA MÊME LANGUE que l'histoire (Français, Lingala, Swahili, etc.). Si l'histoire mélange deux langues, fais de même.
5. STRICTEMENT AUCUN COMMENTAIRE : Tu es un générateur de texte brut. Ne mets aucun texte d'introduction (ex: "Voici votre chanson"). Commence IMMÉDIATEMENT ta réponse par "Titre : ". Tout mot qui n'est pas une parole de la chanson fera planter le système.
Format de réponse attendu :
Titre : [Nom de la chanson créatif]

[Verse 1]
...
`;
  }

  async generateLyrics(occasion, story, style) {
    try {
      const prompt = this.buildPrompt(occasion, story, style);
      
      if (!this.GEMINI_KEY) {
        throw new Error("Clé API Gemini (VITE_GEMINI_API_KEY) manquante. Veuillez l'ajouter dans Vercel.");
      }
      
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_KEY}`;

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

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Erreur Gemini API");
      }

      if (data?.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error("Réponse inattendue de Gemini");

    } catch (err) {
      console.error("Erreur lors de la génération de paroles :", err);
      return this.generateFallbackLyrics(occasion, story, style);
    }
  }

  generateFallbackLyrics(occasion, story, style) {
    // Si l'utilisateur n'a pas encore configuré sa clé API, on fournit un texte robuste
    const cleanStory = story.length > 30 ? story.substring(0, 50) + "..." : story;
    
    return `Titre : Magie de l'Instant (${occasion})

[Intro]
(Musique douce qui monte en intensité)
Yeah... C'est pour toi.
Écoute bien ça.

[Couplet 1]
On a traversé tant de chemins
Les souvenirs gravés entre nos mains
Aujourd'hui on se pose, on prend le temps
Pour célébrer cet unique moment
Tu m'as raconté ton histoire, écoute bien :
"${cleanStory}"

[Refrain]
Et on s'envole ce soir, plus haut que le ciel !
Dans ce rythme ${style}, la vie est si belle
Peu importe demain, l'important c'est nous
Laisse la musique nous rendre un peu fous !

[Couplet 2]
Les mots parfois manquent pour tout exprimer
Mais la mélodie vient nous rattraper
Chaque note qui résonne est une promesse
De transformer nos doutes en allégresse
Garde le sourire, regarde devant toi
La vie est une danse, fais-en ton choix.

[Refrain]
Et on s'envole ce soir, plus haut que le ciel !
Dans ce rythme ${style}, la vie est si belle
Peu importe demain, l'important c'est nous
Laisse la musique nous rendre un peu fous !

[Pont]
(Solo instrumental entraînant)
Ne t'arrête pas, laisse le groove t'emporter
C'est notre hymne, notre réalité
Plus rien ne compte quand les basses résonnent
C'est la victoire que nos cœurs couronnent !

[Refrain]
Et on s'envole ce soir, plus haut que le ciel !
Dans ce rythme ${style}, la vie est si belle
Peu importe demain, l'important c'est nous
Laisse la musique nous rendre un peu fous !

[Outro]
Ouais... Plus haut que le ciel.
Merci d'être là.
(La musique s'estompe doucement...)`;
  }
}

export const lyricsService = new LyricsGenerationService();
