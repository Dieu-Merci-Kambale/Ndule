import React, { useState } from 'react';
import { X, Video, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './CreateShortModal.css';

const CreateShortModal = ({ isOpen, onClose, track, userNotes, onShortCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !track) return null;

  const handleGenerate = async () => {
    if (userNotes < 1) {
      setError("Vous n'avez pas assez de Notes pour générer un clip vidéo.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // 1. Déduire 1 Note
      const { data: deductSuccess, error: deductError } = await supabase.rpc('deduct_note', { amount: 1 });
      
      if (deductError || !deductSuccess) {
        throw new Error("Impossible de déduire la Note. Vérifiez votre solde.");
      }

      // 2. Simuler la création vidéo avec progression (10 à 15 secondes)
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s * 20 = 10 secondes
      }

      // 3. Sauvegarder dans Supabase
      const fakeVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Vidéo de test 100% fiable
      
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ video_url: fakeVideoUrl })
        .eq('id', track.id);

      if (updateError) {
        console.error("Erreur mise à jour vidéo:", updateError);
        throw new Error("La vidéo a été générée mais n'a pas pu être sauvegardée.");
      }

      // Succès !
      setIsGenerating(false);
      setIsSuccess(true);
      setProgress(0);
      onShortCreated(track.id, fakeVideoUrl);
      
    } catch (err) {
      setError(err.message || "Une erreur inattendue s'est produite.");
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const resetModal = () => {
    setIsGenerating(false);
    setProgress(0);
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="short-modal-overlay">
      <div className="short-modal animate-slide-up">
        {!isGenerating && !isSuccess && (
          <button className="short-close-btn" onClick={resetModal}>
            <X size={20} />
          </button>
        )}

        <div className="short-modal-content">
          {!isGenerating && !isSuccess ? (
            <>
              <div className="short-icon-wrapper">
                <Video size={32} className="text-white" />
              </div>
              <h2 className="short-title">Créer un Clip Short</h2>
              <p className="short-desc">
                Transformez <strong>{track.title}</strong> en une vidéo verticale parfaite pour TikTok, Instagram Reels ou YouTube Shorts.
              </p>
              
              <div className="short-preview-box">
                <div className="short-preview-img" style={{ backgroundImage: `url(${track.cover_url})` }}>
                  <div className="short-preview-overlay"></div>
                </div>
                <div className="short-preview-info">
                  <span className="short-preview-badge">Format Vertical 9:16</span>
                  <span className="short-preview-text">Paroles animées incluses</span>
                </div>
              </div>

              {error && (
                <div className="short-error">
                  {error}
                </div>
              )}

              <button className="short-action-btn" onClick={handleGenerate}>
                Générer le Clip (1 Note)
              </button>
            </>
          ) : isGenerating ? (
            <div className="short-state-wrapper flex flex-col items-center">
               <div className="generating-icon-pulse mb-6">
                  <div className="pulse-ring"></div>
                  <Video size={32} className="text-blue-500" />
               </div>
               <h2 className="text-xl font-bold mb-2">Génération en cours...</h2>
               <p className="text-stone-500 mb-8 text-center">L'IA de Ndule synchronise vos paroles avec la vidéo.</p>
               
               <div className="w-full bg-stone-100 rounded-full h-3 mb-2 overflow-hidden">
                 <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
               </div>
               <span className="text-sm font-semibold text-blue-600 mb-1">{progress}% terminé</span>
               <p className="text-xs text-stone-400">Veuillez ne pas fermer cette fenêtre (environ 10 secondes)</p>
            </div>
          ) : (
            <div className="short-state-wrapper flex flex-col items-center">
              <div className="success-circle bg-green-100 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="check-icon text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Clip généré avec succès !</h2>
              <p className="text-stone-500 text-center">Votre vidéo verticale est prête. Vous pouvez la visionner dans l'onglet Shorts.</p>
              <button className="short-action-btn mt-8" onClick={resetModal}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShortModal;
