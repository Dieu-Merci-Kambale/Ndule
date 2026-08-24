/**
 * LyricsGenerationService.js
 * 
 * Ce service se connecte à PiAPI (Suno) pour générer des paroles
 * via leur modèle interne spécialisé (facturé $0.02 par génération).
 */

import { supabase } from '../lib/supabaseClient';

class LyricsGenerationService {
  buildPrompt(occasion, story, style) {
    return `Style: ${style}. Occasion: ${occasion}. Sujet: ${story}.`;
  }

  async generateLyrics(occasion, story, style) {
    try {
      const prompt = this.buildPrompt(occasion, story, style);
      
      console.log("Demande de paroles via PiAPI...", { prompt });

      // 1. Initialiser la tâche PiAPI via notre proxy
      const { data: initData, error: initError } = await supabase.functions.invoke('piapi-proxy', {
        body: { 
          action: 'generate_lyrics', 
          payload: {
            model: "suno",
            task_type: "lyrics",
            input: { prompt }
          }
        }
      });

      if (initError) {
        let errorMsg = initError.message;
        if (initError.context && typeof initError.context.json === 'function') {
           const errBody = await initError.context.json().catch(() => null);
           if (errBody && errBody.error) errorMsg = errBody.error;
        }
        throw new Error("ERREUR_API_PIAPI: " + errorMsg);
      }

      if (initData?.error || (initData?.code && initData.code !== 200)) {
        throw new Error("ERREUR_API_PIAPI: " + (initData?.error || initData?.message || "Erreur inconnue"));
      }

      const taskId = initData?.data?.task_id;
      if (!taskId) {
        throw new Error("ERREUR_API_PIAPI: Aucun task_id retourné par PiAPI");
      }

      // 2. Polling (attendre que PiAPI génère les paroles)
      let status = 'pending';
      let pollCount = 0;
      let lyricsResult = null;

      while (status !== 'completed' && status !== 'failed' && pollCount < 20) { // Max ~40s
        await new Promise(r => setTimeout(r, 2000)); // Poll every 2 seconds
        pollCount++;

        try {
          const { data: pollData, error: pollError } = await supabase.functions.invoke('piapi-proxy', {
            body: { action: 'get', taskId }
          });

          if (!pollError && pollData?.data) {
            status = pollData.data.status;
            
            if (status === 'completed' && pollData.data.output) {
              // PiAPI renvoie les paroles générées (soit dans 'text', soit 'title' et 'text')
              const output = pollData.data.output;
              let title = output.title ? `Titre : ${output.title}\n\n` : '';
              lyricsResult = `${title}${output.text || ''}`;
            }
          }
        } catch (e) {
          console.warn("Erreur de polling PiAPI (Paroles):", e);
        }
      }

      if (lyricsResult) {
        return lyricsResult;
      }

      throw new Error("ERREUR_API_PIAPI: Délai d'attente dépassé ou génération échouée.");

    } catch (err) {
      console.error("Erreur lors de la génération de paroles :", err);
      // Afficher l'erreur pour comprendre pourquoi ça échoue
      alert("Erreur Lyrics: " + err.message);
      return this.generateFallbackLyrics(occasion, story, style);
    }
  }

  generateFallbackLyrics(occasion, story, style) {
    const cleanStory = story.length > 30 ? story.substring(0, 50) + "..." : story;
    
    return `Titre : Magie de l'Instant (${occasion})

[Verse 1]
On a traversé tant de chemins
Les souvenirs gravés entre nos mains
Aujourd'hui on se pose, on prend le temps
Pour célébrer cet unique moment
Tu m'as raconté ton histoire, écoute bien :
"${cleanStory}"

[Chorus]
Et on s'envole ce soir, plus haut que le ciel !
Dans ce rythme ${style}, la vie est si belle
Peu importe demain, l'important c'est nous
Laisse la musique nous rendre un peu fous !

[Verse 2]
Les mots parfois manquent pour tout exprimer
Mais la mélodie vient nous rattraper
Chaque note qui résonne est une promesse
De transformer nos doutes en allégresse
Garde le sourire, regarde devant toi
La vie est une danse, fais-en ton choix.

[Chorus]
Et on s'envole ce soir, plus haut que le ciel !
Dans ce rythme ${style}, la vie est si belle
Peu importe demain, l'important c'est nous
Laisse la musique nous rendre un peu fous !

[Bridge]
(Solo instrumental entraînant)
Ne t'arrête pas, laisse le groove t'emporter
C'est notre hymne, notre réalité
Plus qu'une simple fête, c'est ce qu'on se donne
C'est la victoire que nos cœurs couronnent !

[Outro]
Ouais... Plus haut que le ciel.
Merci d'être là.
(La musique s'estompe doucement...)`;
  }
}

export const lyricsService = new LyricsGenerationService();
