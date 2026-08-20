/**
 * MusicGenerationService.js
 * 
 * Service backend-like pour gérer la connexion à l'API de génération musicale (Suno / Replicate).
 * Pour l'instant, il mock l'API pour permettre au frontend de se brancher sur des appels asynchrones réalistes.
 */
import { supabase } from '../lib/supabaseClient';

class MusicGenerationService {
  constructor() {
    this.PROVIDER = 'suno'; // 'suno', 'replicate', or 'mock'
  }

  buildMusicalTags(styleId, voiceId) {
    const basePrompts = {
      'rumba': 'rumba',
      'afrobeat': 'afrobeat',
      'ndombolo': 'soukous',
      'mutuashi': 'african',
      'gospel': 'gospel',
      'sebene': 'sebene',
      'zouk': 'zouk',
      'bongo': 'bongo'
    };

    const styleStr = basePrompts[styleId] || styleId;

    let voiceStr = 'vocal';
    if (voiceId === 'homme') voiceStr = 'male vocal';
    if (voiceId === 'femme') voiceStr = 'female vocal';
    if (voiceId === 'duo') voiceStr = 'vocal duet';

    return `${styleStr}, ${voiceStr}`;
  }

  /**
   * Lance la génération de la musique
   * @param {Object} params - Les paramètres de création
   */
  async generateTrack(params, onProgress) {
    console.log('[MusicService] Démarrage de la génération avec la vraie API...', params);

    // Le prompt contient les paroles, on retire la ligne de Titre pour ne pas perturber Suno
    let prompt = params.description;
    if (prompt.startsWith('Titre :')) {
      prompt = prompt.split('\n').slice(1).join('\n').trim();
    }

    // Les tags contiennent la description musicale
    const tags = this.buildMusicalTags(params.style, params.voice);

    try {
      // 1. Début de la progression
      onProgress(10);

      const finalPayload = {
        model: "suno",
        task_type: "music",
        customMode: true,
        input: {
          prompt: prompt,
          tags: tags,
          title: params.title || 'Nouvelle Chanson',
          make_instrumental: false,
          mv: "chirp-crow"
        }
      };

      onProgress(30);

      // Appel sécurisé à la Edge Function Supabase (qui gère la clé API et la déduction de note)
      const { data, error } = await supabase.functions.invoke('piapi-proxy', {
        body: { action: 'create', payload: finalPayload }
      });

      // PiAPI retourne souvent les erreurs sous forme { code: 401, message: "..." }
      if (error || data?.error || (data?.code && data.code !== 200)) {
        console.error("Erreur API/Proxy:", error || data?.error || data?.message);
        throw new Error(data?.error || data?.message || "Erreur lors de l'appel au service musical");
      }

      console.log("[MusicService] Réponse Edge Function reçue:", data);

      // 2. Gestion asynchrone (Polling) pour PiAPI
      let generatedClips = [];

      if (data?.data?.task_id) {
        const taskId = data.data.task_id;
        onProgress(50);
        let status = 'pending';
        let pollCount = 0;

        while (status !== 'completed' && status !== 'failed' && pollCount < 40) {
          await new Promise(r => setTimeout(r, 4000)); // Poll every 4 seconds
          pollCount++;

          try {
            const { data: pollData, error: pollError } = await supabase.functions.invoke('piapi-proxy', {
              body: { action: 'get', taskId }
            });

            if (!pollError && pollData?.data) {
              status = pollData.data.status;
              console.log(`[MusicService] Statut (essai ${pollCount}): ${status}`);

              if (status === 'completed' && pollData.data.output && pollData.data.output.clips) {
                const clips = Object.values(pollData.data.output.clips);
                if (clips.length > 0) {
                  generatedClips = clips;
                }
              }
            }
          } catch (e) {
            console.warn("Erreur de polling:", e);
          }

          if (pollCount % 2 === 0) {
            onProgress(Math.min(90, 50 + pollCount));
          }
        }
      }

      onProgress(100);

      if (generatedClips.length > 0) {
        return generatedClips.map((clip, index) => ({
          id: `track_${Date.now()}_${index}`,
          title: params.title + (index > 0 ? ` (Version ${index + 1})` : ''),
          style: params.style,
          audioUrl: clip.audio_url,
          coverUrl: clip.image_url,
          duration: clip.metadata?.duration ? Math.floor(clip.metadata.duration/60) + ':' + String(Math.floor(clip.metadata.duration%60)).padStart(2, '0') : '2:00',
          createdAt: new Date().toISOString()
        }));
      }

      // Fallback
      return [{
        id: `track_${Date.now()}`,
        title: params.title || 'Nouvelle Chanson IA',
        style: params.style,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop',
        duration: '3:45',
        createdAt: new Date().toISOString()
      }];

    } catch (error) {
      console.error("[MusicService] Échec de la génération:", error);
      
      // Propage l'erreur à l'interface utilisateur au lieu de générer une fausse musique
      if (error.message.includes("insufficient credits") || error.message.includes("Fonds insuffisants")) {
        throw new Error("Vous n'avez pas assez de Notes (crédits) pour générer cette chanson. Veuillez recharger votre compte.");
      }
      
      throw new Error("La génération de la musique a échoué. Veuillez réessayer. Détail: " + error.message);
    }
  }
}

export const musicService = new MusicGenerationService();
