import React, { useState, useEffect } from 'react';
import { Video, Share2, Trash2, X, Play } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import './Shorts.css';

const Shorts = () => {
  const { t } = useTranslation();
  const [shorts, setShorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoToPlay, setVideoToPlay] = useState(null);
  const [shortToDelete, setShortToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = React.useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Synchronisation rudimentaire des paroles
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShorts(data || []);
    } catch (err) {
      console.error("Erreur chargement des Shorts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (track) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `${t.pages.shorts.shareText} "${track.title}" sur Ndules !`,
          url: track.video_url
        });
      } catch (err) {
        console.log("Erreur partage:", err);
      }
    } else {
      navigator.clipboard.writeText(`${t.pages.shorts.shareTextLink}: ${track.video_url}`);
      alert(t.pages.shorts.linkCopied);
    }
  };

  const confirmDelete = async () => {
    if (!shortToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ video_url: null })
        .eq('id', shortToDelete.id);

      if (error) throw error;
      
      // Retirer de la liste localement
      setShorts(prev => prev.filter(t => t.id !== shortToDelete.id));
      setShortToDelete(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
      // On pourrait utiliser le Toast ici idéalement
      alert(t.pages.shorts.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadVideo = (videoUrl, title) => {
    // Crée un élément <a> caché pour forcer le téléchargement
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title.replace(/\s+/g, '_')}_Short.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="studio-shorts-page">
      <div className="studio-shorts-container">
        
        <div className="studio-header">
          <div className="studio-icon-container">
            <Video size={28} className="text-blue-500" strokeWidth={2.5} />
          </div>
          <h1 className="studio-title">{t.pages.shorts.title}</h1>
        </div>
        
        <p className="studio-description">
          {t.pages.shorts.description}
        </p>

        <div className="studio-shorts-list">
          {isLoading ? (
            <p className="text-stone-500">{t.pages.shorts.loading}</p>
          ) : shorts.length === 0 ? (
            <p className="text-stone-500 bg-white p-6 rounded-2xl border border-stone-100 text-center shadow-sm">
              {t.pages.shorts.noShorts}
            </p>
          ) : (
            shorts.map(track => (
              <div key={track.id} className="studio-short-card">
                
                <div className="short-card-header">
                  <div className="short-card-cover relative">
                    <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop"} alt={track.title} />
                    <div className="short-cover-icon-overlay">
                      <Video size={12} color="white" />
                    </div>
                  </div>
                  
                  <div className="short-card-info">
                    <h3 className="line-clamp-1">{track.title}</h3>
                    <span className="short-card-style">{track.style ? track.style.toUpperCase() : 'CUSTOM'}</span>
                  </div>
                  
                  <div className="short-card-time">{track.duration || '0:00'}</div>
                </div>

                <div className="short-card-actions">
                  <button 
                    className="btn-voir-short w-full"
                    onClick={() => setVideoToPlay(track)}
                  >
                    <Video size={16} /> {t.pages.shorts.view}
                  </button>
                  
                  <div className="short-card-actions-row">
                    <button className="btn-partager-short" onClick={() => handleShare(track)}>
                      <Share2 size={16} /> {t.pages.shorts.share}
                    </button>
                    <button className="btn-supprimer-short" onClick={() => setShortToDelete(track)}>
                      <Trash2 size={16} /> {t.pages.shorts.delete}
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      {videoToPlay && (
        <div className="video-player-modal-overlay" onClick={() => setVideoToPlay(null)}>
          <div className="video-player-modal-content" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="video-modal-header">
              <div className="flex flex-col items-center">
                <span className="font-bold text-stone-800 text-lg">{t.pages.shorts.title}</span>
                <span className="text-stone-500 text-sm mt-2 text-center px-6 leading-relaxed">
                  {t.pages.shorts.desc}
                </span>
              </div>
              <button className="close-modal-icon-btn" onClick={() => setVideoToPlay(null)}>
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            {/* Success Banner */}
            <div className="video-modal-success-banner">
              <span className="text-green-600">{t.pages.shorts.isReady}</span>
            </div>

            {/* Player Container - Custom Visualizer */}
            <div className="video-player-wrapper custom-visualizer">
              <audio 
                ref={audioRef}
                src={videoToPlay.audio_url} 
                autoPlay 
                onTimeUpdate={handleTimeUpdate}
                loop
              />
              
              {/* Fond flouté */}
              <div 
                className="visualizer-bg" 
                style={{ backgroundImage: `url(${videoToPlay.cover_url || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop'})` }}
              ></div>
              
              <div className="visualizer-content">
                <img 
                  src={videoToPlay.cover_url || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop'} 
                  alt="Cover" 
                  className="visualizer-cover pulse-animation"
                />
                <h3 className="visualizer-title">{videoToPlay.title}</h3>
                
                <div className="visualizer-lyrics-container">
                  <div 
                    className="visualizer-lyrics-scroll"
                    style={{ transform: `translateY(-${(currentTime * 5)}px)` }}
                  >
                    {videoToPlay.lyrics ? (
                      videoToPlay.lyrics.split('\n').map((line, idx) => (
                        <p key={idx} className="visualizer-lyric-line">{line}</p>
                      ))
                    ) : (
                      <p className="visualizer-lyric-line">♪ ♪ ♪</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="video-modal-footer">
              <button 
                className="btn-download-video"
                onClick={() => {
                  alert("Le rendu MP4 final nécessite un serveur vidéo. En attendant, vous pouvez enregistrer votre écran !");
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Télécharger
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {shortToDelete && (
        <div className="delete-confirm-overlay" onClick={() => setShortToDelete(null)}>
          <div className="delete-confirm-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="delete-title">Supprimer le Clip ?</h3>
            <p className="delete-desc">
              Êtes-vous sûr de vouloir supprimer le clip de <strong>{shortToDelete.title}</strong> ?<br/>
              La musique originale sera conservée, seule la vidéo sera effacée.
            </p>
            <div className="delete-actions">
              <button 
                className="btn-cancel-delete" 
                onClick={() => setShortToDelete(null)}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shorts;
