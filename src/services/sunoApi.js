/**
 * Service pour interagir avec l'API Suno AI (ou équivalent).
 * 
 * En mode production, il faut configurer la variable d'environnement VITE_SUNO_API_URL
 * et VITE_SUNO_API_KEY.
 * 
 * S'il n'y a pas d'URL d'API, le service passe en "Mode Simulation" pour la démo Frontend.
 */

const API_URL = import.meta.env.VITE_SUNO_API_URL;
const API_KEY = import.meta.env.VITE_SUNO_API_KEY;

// URLs de démo avec voix humaines ou instrumentales (Fallback)
const DEMO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
];

/**
 * Lance la génération d'une musique.
 * @param {string} prompt - Les paroles ou le thème de la chanson
 * @param {string} style - Le style musical (ex: afrobeat, roumba)
 * @param {string} mood - L'humeur
 * @returns {Promise<string>} - L'identifiant de la tâche (taskId)
 */
export const generateMusicTask = async (prompt, style, mood) => {
  if (!API_URL) {
    // MODE SIMULATION
    console.log("Suno API non configurée : Mode simulation activé.");
    return `sim_task_${Date.now()}`;
  }

  // MODE RÉEL
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        tags: `${style}, ${mood}`,
        make_instrumental: false
      })
    });
    
    if (!response.ok) throw new Error("Erreur de l'API lors de la génération");
    
    const data = await response.json();
    return data.id; // On retourne l'ID de la tâche (polling nécessaire)
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

/**
 * Vérifie le statut de la génération (Polling).
 * @param {string} taskId - L'identifiant de la tâche retourné par generateMusicTask
 * @param {function} onProgress - Callback pour mettre à jour la barre de progression UI
 * @returns {Promise<Object>} - Les détails de la piste une fois terminée
 */
export const pollMusicStatus = (taskId, onProgress) => {
  return new Promise((resolve, reject) => {
    
    if (taskId.startsWith('sim_task_')) {
      // MODE SIMULATION : Simule un délai de 15 secondes avec des étapes
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        if (progress <= 30) {
          onProgress(progress, 'Initialisation du modèle AI...');
        } else if (progress <= 60) {
          onProgress(progress, 'Génération des paroles...');
        } else if (progress <= 90) {
          onProgress(progress, 'Synthèse vocale et instrumentale...');
        } else {
          onProgress(100, 'Finalisation...');
          clearInterval(interval);
          
          // Succès simulé avec un lien d'exemple (instrumental de remplacement)
          setTimeout(() => {
            const randomUrl = DEMO_URLS[Math.floor(Math.random() * DEMO_URLS.length)];
            resolve({
              id: taskId,
              audio_url: randomUrl,
              image_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop',
              title: `Création IA - ${taskId.substring(9, 14)}`,
              status: 'complete'
            });
          }, 1000);
        }
      }, 1500); // Mise à jour toutes les 1.5 secondes (total ~15 sec)
      return;
    }

    // MODE RÉEL : Polling de la vraie API
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/get?ids=${taskId}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        
        if (!response.ok) throw new Error("Erreur de vérification du statut");
        
        const data = await response.json();
        const task = data[0]; // On suppose que la réponse est un tableau

        if (task.status === 'complete') {
          clearInterval(interval);
          onProgress(100, 'Finalisation...');
          resolve(task);
        } else if (task.status === 'error') {
          clearInterval(interval);
          reject(new Error("L'API a retourné une erreur de génération"));
        } else {
          // Calcul du pourcentage si fourni par l'API, sinon incrément générique
          onProgress(null, 'Génération en cours via Suno AI...');
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000); // Polling toutes les 5 secondes (recommandé pour ne pas spammer l'API)
  });
};
