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
      let finalAudioUrl = null;
      let finalCoverUrl = null;

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
                  finalAudioUrl = clips[0].audio_url;
                  finalCoverUrl = clips[0].image_url;
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

      // Sauvegarde dans Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbTrack, error } = await supabase.from('tracks').insert([{
          user_id: user.id,
          title: params.title || 'Nouvelle Chanson',
          style: params.style,
          prompt_used: prompt,
          audio_url: finalAudioUrl,
          cover_url: finalCoverUrl,
          duration: "2:00"
        }]).select();

        if (!error && dbTrack) {
          console.log("[MusicService] Sauvegardé en DB:", dbTrack);
        }
      }

      onProgress(100);

      // Si l'API n'a vraiment rien renvoyé (ex: pas de crédit), on met le fallback de sécurité
      const safeAudioUrl = finalAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const safeCoverUrl = finalCoverUrl || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop';

      return {
        id: `track_${Date.now()}`,
        title: params.title || 'Nouvelle Chanson IA',
        style: params.style,
        audioUrl: safeAudioUrl,
        coverUrl: safeCoverUrl,
        duration: '3:45',
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error("[MusicService] Échec de la génération:", error);

      // FALLBACK SI PAS DE CREDITS PIAPI (Pour test de l'interface)
      if (error.message.includes("insufficient credits") || error.message.includes("500")) {
        console.warn("Utilisation d'une musique de secours (API Suno sans crédits).");
        onProgress(100);
        return {
          id: `track_mock_${Date.now()}`,
          title: params.title || "Chanson Générée",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          coverUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop",
          duration: "6:12",
          style: params.style,
          createdAt: new Date().toISOString()
        };
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      onProgress(100);

      return {
        id: `track_error_mock_${Date.now()}`,
        title: `${params.title} (Généré hors-ligne)`,
        style: params.style,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop',
        duration: '2:30',
        createdAt: new Date().toISOString()
      };
    }
  }
}

export const musicService = new MusicGenerationService();
