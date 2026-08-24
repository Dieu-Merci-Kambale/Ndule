import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { musicService } from '../services/MusicGenerationService';
import { lyricsService } from '../services/LyricsGenerationService';
import { ALL_STYLES } from '../utils/musicStyles';
import './CreateTrackModal.css';

const OCCASIONS = [
  { id: 'anniversaire', name: 'Anniversaire', icon: '🎂' },
  { id: 'mariage', name: 'Mariage', icon: '💒' },
  { id: 'declaration', name: 'Déclaration', icon: '💕' },
  { id: 'reussite', name: 'Réussite', icon: '🎓' },
  { id: 'fete', name: 'Fête', icon: '🎉' },
  { id: 'hommage', name: 'Hommage', icon: '🕯️' },
  { id: 'encouragement', name: 'Encouragement', icon: '💪' },
  { id: 'autre', name: 'Autre', icon: '✨' }
];

const STYLES = [
  { id: 'autre', name: 'Autre Style', icon: '➕' },
  { id: 'ndombolo', name: 'Ndombolo', icon: '🕺' },
  { id: 'afrobeat', name: 'Afrobeat', icon: '🥁' },
  { id: 'afro', name: 'Afro', icon: '🌍' },
  { id: 'coupedecale', name: 'Coupé-Décalé', icon: '💃' },
  { id: 'amapiano', name: 'Amapiano', icon: '🎹' },
  { id: 'rb', name: 'R&B', icon: '🎤' },
  { id: 'rap', name: 'Rap / Hip-Hop', icon: '🧢' },
  { id: 'zouk', name: 'Zouk/Kizomba', icon: '🫂' },
  { id: 'rumba', name: 'Rumba', icon: '🎸' },
  { id: 'reggae', name: 'Reggae', icon: '🇯🇲' },
  { id: 'kompa', name: 'Kompa', icon: '🌴' }
];

const VOICES = [
  { id: 'homme_grave', name: 'Homme - Grave', desc: 'Style Koffi, Ndombolo', icon: '🧔🏾‍♂️' },
  { id: 'homme_standard', name: 'Homme - Standard', desc: 'Style Rumba, Afropop', icon: '👨🏾' },
  { id: 'homme_aigu', name: 'Homme - Aigu', desc: 'Style Fally, Doux', icon: '🧑🏾' },
  { id: 'femme', name: 'Femme', desc: 'Voix féminine douce', icon: '👩🏾' },
  { id: 'duo', name: 'Duo', desc: 'Homme & Femme', icon: '👫🏾' }
];

const CreateTrackModal = ({ isOpen, onClose, onTrackCreated, userNotes, initialTrack = null }) => {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState(null);
  const [story, setStory] = useState('');
  const [style, setStyle] = useState(null);
  const [voice, setVoice] = useState(null);
  
  // Paroles
  const [lyricsTitle, setLyricsTitle] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Recherche avancée de styles
  const [showStyleSearch, setShowStyleSearch] = useState(false);
  const [styleSearchQuery, setStyleSearchQuery] = useState('');

  // Initialisation pour le mode Remix
  useEffect(() => {
    if (isOpen && initialTrack) {
      setStep(5); // On va directement à l'étape Paroles
      setLyricsTitle(`Remix - ${initialTrack.title}`);
      
      // Essayer de récupérer les paroles depuis la db, sinon depuis le prompt_used
      let originalLyrics = initialTrack.lyrics || '';
      if (!originalLyrics && initialTrack.prompt_used) {
        // Le prompt_used contient "[Type de voix: XXX]\n\nParoles..."
        originalLyrics = initialTrack.prompt_used.replace(/\[Type de voix: .*?\]\n\n/, '');
      }
      setLyricsText(originalLyrics);

      // Pré-remplir les autres champs silencieusement
      const occasionFound = OCCASIONS.find(o => o.name === initialTrack.occasion);
      if (occasionFound) setOccasion(occasionFound.id);
      
      const styleFound = STYLES.find(s => s.name === initialTrack.style);
      if (styleFound) setStyle(styleFound.id);

      const voiceFound = VOICES.find(v => v.name === initialTrack.voice_type);
      if (voiceFound) setVoice(voiceFound.id);
      
      setStory(initialTrack.story || '');
    } else if (isOpen && !initialTrack) {
      // Mode création normale : réinitialiser
      resetModalState();
    }
  }, [isOpen, initialTrack]);

  const resetModalState = () => {
    setStep(1);
    setOccasion(null);
    setStory('');
    setStyle(null);
    setVoice(null);
    setLyricsTitle('');
    setLyricsText('');
    setIsGeneratingLyrics(false);
    setIsGenerating(false);
    setIsSuccess(false);
    setError(null);
  };

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setStep(5);
      setIsGeneratingLyrics(true);
      setLyricsTitle('Réflexion de l\'IA...');
      setLyricsText('');
      
      const occasionName = OCCASIONS.find(o => o.id === occasion)?.name || 'Chanson';
      const styleName = STYLES.find(s => s.id === style)?.name || ALL_STYLES.find(s => s.id === style)?.name || 'Pop';
      
      try {
        const generatedText = await lyricsService.generateLyrics(occasionName, story, styleName);
        
        let finalTitle = `Ma Chanson - ${occasionName}`;
        let finalText = generatedText;
        
        const titleMatch = generatedText.match(/Titre\s*:\s*(.*)/i);
        if (titleMatch && titleMatch[1]) {
          finalTitle = titleMatch[1].trim();
          finalText = generatedText.replace(/Titre\s*:\s*(.*)\n?/i, '').trim();
        }

        setLyricsTitle(finalTitle);
        
        // Effet machine à écrire (Live typing)
        // On augmente la taille des paquets pour que l'écriture soit très rapide (1-2s max) et on évite de faire lagger React
        for (let i = 0; i <= finalText.length; i += 25) {
          setLyricsText(finalText.substring(0, i));
          await new Promise(r => setTimeout(r, 15));
        }
        setLyricsText(finalText);
      } catch (err) {
        console.error("Failed to generate lyrics", err);
        setLyricsTitle(`Ma Chanson - ${occasionName}`);
        setLyricsText("[Couplet 1]\nGuitares de fond doucement...\nErreur de génération IA. Veuillez écrire vos paroles.");
      }
      
      setIsGeneratingLyrics(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetModal = () => {
    setStep(1);
    setOccasion(null);
    setStory('');
    setStyle(null);
    setVoice(null);
    setLyricsTitle('');
    setLyricsText('');
    setIsGeneratingLyrics(false);
    setIsGenerating(false);
    setIsSuccess(false);
    setError(null);
    setShowStyleSearch(false);
    setStyleSearchQuery('');
    onClose();
  };

  const handleStyleSelect = (styleId) => {
    if (styleId === 'autre') {
      setShowStyleSearch(true);
    } else {
      setStyle(styleId);
    }
  };

  const handleAdvancedStyleSelect = (styleId) => {
    setStyle(styleId);
    setShowStyleSearch(false);
  };

  const handleGenerateFinal = async () => {
    setError(null);
    setIsGenerating(true);
    setProgress(0);

    try {
      // La déduction de crédit (Note) se fait désormais uniquement et de façon sécurisée 
      // côté serveur dans la Edge Function (piapi-proxy) au moment de lancer l'API.

      // 2. Générer via l'IA
      const styleName = STYLES.find(s => s.id === style)?.name || ALL_STYLES.find(s => s.id === style)?.name || style;
      const occasionName = OCCASIONS.find(o => o.id === occasion)?.name || 'Général';
      const voiceName = VOICES.find(v => v.id === voice)?.name || 'Standard';
      
      // Génération de la musique (retourne maintenant un tableau de clips)
      const tracksData = await musicService.generateTrack(
        { style: styleName, description: lyricsText, title: lyricsTitle, voice: voice }, 
        setProgress
      );

      if (!tracksData || tracksData.length === 0) {
        setError("La génération a échoué silencieusement.");
        setIsGenerating(false);
        return;
      }

      // 3. Sauvegarder TOUTES LES VERSIONS dans Supabase
      const user = (await supabase.auth.getUser()).data.user;
      
      const tracksToInsert = tracksData.map(t => ({
        user_id: user.id,
        creator_name: user.email ? user.email.split('@')[0] : 'Créateur Ndules',
        title: t.title,
        style: styleName,
        occasion: occasionName,
        story: story || '',
        voice_type: voiceName,
        lyrics: lyricsText,
        prompt_used: lyricsText,
        audio_url: t.audio_url || t.audioUrl,
        cover_url: t.image_url || t.coverUrl,
        duration: t.duration || '0:00'
      }));

      const { data: savedTracks, error: saveError } = await supabase
        .from('tracks')
        .insert(tracksToInsert)
        .select();

      if (saveError) {
        console.error("Erreur de sauvegarde Supabase:", saveError);
        setError("Erreur lors de la sauvegarde dans la base de données : " + saveError.message);
        setIsGenerating(false);
        return;
      }

      if (savedTracks && savedTracks.length > 0) {
        // Appeler onTrackCreated pour chaque piste pour l'UI
        savedTracks.forEach(t => onTrackCreated(t));
        setIsGenerating(false);
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Erreur de génération:", err);
      setError("Erreur : " + err.message);
      setIsGenerating(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !occasion) return true;
    if (step === 2 && !story.trim()) return true;
    if (step === 3 && !style) return true;
    if (step === 4 && !voice) return true;
    if (step === 5 && (!lyricsTitle.trim() || !lyricsText.trim())) return true;
    return false;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-wizard-modal">
        {/* Ligne du haut (Fermer, Retour) */}
        <div className="wizard-topbar">
          {step > 1 && !isGenerating && !isGeneratingLyrics ? (
            <button className="wizard-icon-btn" onClick={handleBack}>
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div></div> // Espaceur
          )}
          
          {!isGenerating && !isGeneratingLyrics && (
            <button className="wizard-icon-btn" onClick={resetModal}>
              <X size={24} />
            </button>
          )}
        </div>

        {/* Indicateur de progression (Points) */}
        {!isGenerating && (
          <div className="wizard-progress-dots">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className={`dot ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}></div>
            ))}
          </div>
        )}

        <div className="wizard-body">
          {/* ÉTAPE 1 : Occasion */}
          {step === 1 && !isGenerating && (
            <div className="wizard-step animate-slide-in">
              <div className="wizard-header">
                <h2>Pour quelle occasion ?</h2>
                <p>Choisis le moment que tu veux célébrer</p>
              </div>
              <div className="occasion-grid">
                {OCCASIONS.map(occ => (
                  <button 
                    key={occ.id} 
                    className={`occasion-card ${occasion === occ.id ? 'selected' : ''}`}
                    onClick={() => setOccasion(occ.id)}
                  >
                    <span className="card-icon">{occ.icon}</span>
                    <span className="card-label">{occ.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Histoire */}
          {step === 2 && !isGenerating && (
            <div className="wizard-step animate-slide-in">
              <div className="wizard-header">
                <h2>Raconte ton histoire</h2>
                <p>Décris ce que tu veux dans ta chanson</p>
              </div>
              <div className="story-container">
                <textarea
                  className="story-textarea"
                  placeholder="Une chanson d'amour pour ma femme Déborah Mwayuma..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={5}
                />
                <div className="story-tip">
                  <span className="tip-icon">💡</span>
                  <p><strong>Astuce :</strong> Plus tu donnes de détails, plus ta chanson sera personnalisée ! Mentionne les prénoms, les souvenirs, les traits de caractère...</p>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Style */}
          {step === 3 && !isGenerating && (
            <div className="wizard-step animate-slide-in">
              <div className="wizard-header">
                <h2>Quel style de musique ?</h2>
                <p>Choisis l'ambiance de ta chanson</p>
              </div>
              <div className="style-grid-3d">
                {STYLES.map(s => (
                  <button 
                    key={s.id} 
                    className={`style-card-3d ${style === s.id ? 'selected' : ''}`}
                    onClick={() => handleStyleSelect(s.id)}
                  >
                    <div className="style-avatar-placeholder">
                      {s.icon}
                    </div>
                    <span className="style-label">{s.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Affichage du style personnalisé s'il n'est pas dans les raccourcis */}
              {style && !STYLES.find(s => s.id === style) && (
                <div className="custom-style-selected animate-slide-up mt-4">
                  <span className="text-sm text-stone-500 mb-2 block">Style sélectionné :</span>
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{ALL_STYLES.find(s => s.id === style)?.icon || '🎵'}</span>
                      <span className="font-semibold text-blue-900">{ALL_STYLES.find(s => s.id === style)?.name || style}</span>
                    </div>
                    <button 
                      className="text-blue-600 text-sm font-medium hover:underline"
                      onClick={() => setShowStyleSearch(true)}
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 4 : Voix */}
          {step === 4 && !isGenerating && (
            <div className="wizard-step animate-slide-in">
              <div className="wizard-header">
                <h2>Quelle voix ?</h2>
                <p>Choisis le type de voix pour ta chanson</p>
              </div>
              <div className="voice-list">
                {VOICES.map(v => (
                  <button 
                    key={v.id} 
                    className={`voice-card ${voice === v.id ? 'selected' : ''}`}
                    onClick={() => setVoice(v.id)}
                  >
                    <div className="voice-icon">{v.icon}</div>
                    <div className="voice-info">
                      <span className="voice-name">{v.name}</span>
                      <span className="voice-desc">{v.desc}</span>
                    </div>
                    <div className={`radio-circle ${voice === v.id ? 'checked' : ''}`}></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* L'étape 4.5 de génération bloquante a été supprimée au profit du live typing dans l'étape 5 */}

          {/* ÉTAPE 5 : Paroles */}
          {step === 5 && !isGenerating && !isSuccess && (
            <div className="wizard-step animate-slide-in">
              <div className="wizard-header">
                <h2>Tes paroles</h2>
                <p>Modifie si besoin avant de créer</p>
              </div>
              
              <div className="lyrics-container">
                <div className="form-group mb-4">
                  <label className="text-sm font-semibold text-stone-600 mb-2 block">Titre de ta chanson</label>
                  <input 
                    type="text"
                    className="lyrics-title-input"
                    value={lyricsTitle}
                    onChange={(e) => setLyricsTitle(e.target.value)}
                    disabled={isGeneratingLyrics}
                  />
                </div>
                
                <div className="form-group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-stone-600 block">Paroles</label>
                    <span className="text-xs text-blue-500 font-medium cursor-pointer">
                      {isGeneratingLyrics ? (
                        <span className="flex items-center gap-1 text-blue-500"><Loader2 size={12} className="animate-spin" /> Écriture en cours...</span>
                      ) : "✏️ Éditer"}
                    </span>
                  </div>
                  <textarea
                    className="lyrics-textarea"
                    value={lyricsText}
                    onChange={(e) => setLyricsText(e.target.value)}
                    rows={10}
                    disabled={isGeneratingLyrics}
                    style={{
                       border: isGeneratingLyrics ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                       boxShadow: isGeneratingLyrics ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
                       transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE DE LANCEMENT (Design Premium) */}
          {isGenerating && (
            <div className="wizard-step generating-step-premium">
               <div className="premium-progress-container">
                  <svg className="premium-circular-progress" viewBox="0 0 160 160">
                     <circle className="premium-progress-bg" cx="80" cy="80" r="70" />
                     <circle 
                        className="premium-progress-fill" 
                        cx="80" cy="80" r="70" 
                        style={{ strokeDashoffset: 440 - (440 * progress) / 100 }} 
                     />
                  </svg>
                  <div className="premium-progress-content">
                     <span className="premium-progress-value">{progress}%</span>
                     <span className="premium-progress-label">Création</span>
                  </div>
               </div>
               
               <h2 className="premium-generating-title">La magie opère...</h2>
               
               <p className="premium-generating-subtitle">
                  Ndules compose votre chef-d'œuvre. L'intelligence artificielle génère actuellement les voix, les instruments et réalise le mixage final.
               </p>
               
               <div className="premium-generating-warning">
                  <span className="warning-dot"></span>
                  Veuillez patienter sans fermer cette fenêtre.
               </div>
            </div>
          )}

          {/* ÉCRAN DE SUCCÈS */}
          {isSuccess && (
            <div className="wizard-step success-step">
              <div className="success-icon-container">
                <div className="success-circle">
                  <span className="check-icon">✓</span>
                </div>
                <p className="text-stone-400 mt-2">Votre chanson est prête !</p>
              </div>
              <h2>Création lancée !</h2>
              <p>Retrouve ta chanson dans Ma Musique</p>
              <button className="wizard-main-btn mt-6" onClick={resetModal} style={{background: '#3b82f6'}}>
                OK
              </button>
            </div>
          )}
        </div>

        {/* Bouton du bas */}
        {!isGenerating && !isSuccess && (
          <div className="wizard-footer">
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {step < 4 ? (
              <button 
                className={`wizard-main-btn ${isNextDisabled() ? 'disabled' : ''}`} 
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                Continuer
              </button>
            ) : step === 4 ? (
              <button 
                className={`wizard-main-btn generate-btn ${isNextDisabled() ? 'disabled' : ''}`} 
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                Générer les paroles
              </button>
            ) : (
              <button 
                className={`wizard-main-btn generate-btn ${isNextDisabled() || isGeneratingLyrics ? 'disabled opacity-50' : ''}`} 
                onClick={handleGenerateFinal}
                disabled={isNextDisabled() || isGeneratingLyrics}
              >
                {isGeneratingLyrics ? 'L\'IA écrit vos paroles...' : 'Créer la chanson (1 Note)'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* OVERLAY : Recherche Avancée de Styles */}
      {showStyleSearch && (
        <div className="style-search-overlay animate-fade-in">
          <div className="style-search-modal animate-slide-up">
            <div className="style-search-header">
              <h3>Tous les styles du monde</h3>
              <button className="close-search-btn" onClick={() => setShowStyleSearch(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="style-search-input-wrapper">
              <input 
                type="text" 
                className="style-search-input"
                placeholder="Rechercher un style (ex: Synthwave, Bachata...)"
                value={styleSearchQuery}
                onChange={(e) => setStyleSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="style-search-results">
              {ALL_STYLES.filter(s => s.name.toLowerCase().includes(styleSearchQuery.toLowerCase())).length > 0 ? (
                ALL_STYLES.filter(s => s.name.toLowerCase().includes(styleSearchQuery.toLowerCase())).map(s => (
                  <button 
                    key={s.id} 
                    className={`advanced-style-item ${style === s.id ? 'selected' : ''}`}
                    onClick={() => handleAdvancedStyleSelect(s.id)}
                  >
                    <span className="advanced-style-icon">{s.icon}</span>
                    <span className="advanced-style-name">{s.name}</span>
                  </button>
                ))
              ) : (
                <div className="style-not-found">
                  <p>Aucun style trouvé pour "{styleSearchQuery}"</p>
                  <p className="text-sm text-stone-500 mt-1">Essayez un autre mot-clé.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrackModal;
