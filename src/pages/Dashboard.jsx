import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Heart, MoreVertical, Share2, Globe, Download, Plus, Wand2, Video, Loader2, Play, Pause, Music } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import CreateTrackModal from '../components/CreateTrackModal';
import CreateShortModal from '../components/CreateShortModal';
import PublishModal from '../components/PublishModal';
import Toast from '../components/Toast';
import { usePlayer } from '../context/PlayerContext';
import { useTranslation } from '../hooks/useTranslation';
import './Dashboard.css';

const Dashboard = () => {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState('toutes');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNoNotesModalOpen, setIsNoNotesModalOpen] = useState(false);
  const [trackToRemix, setTrackToRemix] = useState(null);
  const [isShortModalOpen, setIsShortModalOpen] = useState(false);
  const [trackForShort, setTrackForShort] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [trackToPublish, setTrackToPublish] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userNotes, setUserNotes] = useState(0);
  
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();

  // Gère l'ouverture de la modale en vérifiant le solde de crédits
  const handleOpenCreateModal = () => {
    if (userNotes > 0) {
      setIsCreateModalOpen(true);
    } else {
      setIsNoNotesModalOpen(true);
    }
  };

  // Écoute si on arrive sur la page avec l'intention d'ouvrir la modale
  useEffect(() => {
    if (location.state?.openCreateModal && !isLoading) {
      setTrackToRemix(null);
      handleOpenCreateModal();
      // Nettoyer le state pour éviter la réouverture automatique après un rafraîchissement
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoading, userNotes]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Charger les pistes
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('notes_balance')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setUserNotes(profileData.notes_balance || 0);
      } else {
        setUserNotes(0);
      }

      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tracksData) setTracks(tracksData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (track) => {
    try {
      const newFavoriteState = !track.is_favorite;
      
      // Mise à jour optimiste
      setTracks(prev => prev.map(t => 
        t.id === track.id ? { ...t, is_favorite: newFavoriteState } : t
      ));
      
      const { error } = await supabase
        .from('tracks')
        .update({ is_favorite: newFavoriteState })
        .eq('id', track.id);
        
      if (error) {
        // Rollback en cas d'erreur
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, is_favorite: !newFavoriteState } : t
        ));
        showToast("Erreur lors de la mise à jour des favoris.");
        if (newFavoriteState) {
          showToast(t.pages.myMusic.msgFavAdded);
        }
      }
    } catch (error) {
      console.error("Erreur toggleFavorite:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleTrackCreated = (newTrack) => {
    setTracks(prev => [newTrack, ...prev]);
    fetchUserData();
  };

  const handleDownload = async (track) => {
    if (!track.audio_url) return;
    try {
      const response = await fetch(track.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${track.title.replace(/\s+/g, '_')}_Ndule.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback en cas de blocage CORS
      window.open(track.audio_url, '_blank');
    }
  };

  const handleShare = async (track) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Écoute ma nouvelle chanson "${track.title}" créée sur Ndule !`,
          url: track.audio_url
        });
      } catch (err) {
        console.log("Erreur partage:", err);
      }
    } else {
      navigator.clipboard.writeText(`Écoute ma chanson Ndule: ${track.audio_url}`);
      showToast(t.pages.myMusic.msgCopied);
    }
  };

  const [toastConfig, setToastConfig] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastConfig({ message, type });
  };

  const handlePublishClick = (track) => {
    if (track.is_public) {
      showToast(t.pages.myMusic.msgAlreadyPublished);
      return;
    }
    setTrackToPublish(track);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async (track) => {
    // Mettre à jour dans Supabase
    const { error } = await supabase
      .from('tracks')
      .update({ is_public: true })
      .eq('id', track.id);
      
    if (!error) {
      // Mettre à jour l'état local
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_public: true } : t));
      showToast(t.pages.myMusic.msgPublishSuccess, "success");
    } else {
      console.error("Erreur lors de la publication :", error);
      showToast(t.pages.myMusic.msgPublishError);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-title">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">{t.pages.myMusic.title}</h1>
          <button className="live-badge">
            <span className="live-dot"></span> {t.pages.myMusic.live}
          </button>
        </div>
        <button className="refresh-btn" onClick={fetchUserData} disabled={isLoading}>
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      <p className="subtitle-text text-stone-500 mb-8 mt-1 text-sm font-medium">{tracks.length} {t.pages.myMusic.listensCount}</p>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'toutes' ? 'active' : ''}`}
          onClick={() => setActiveTab('toutes')}
        >
          {t.pages.myMusic.tabAll}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'favoris' ? 'active' : ''}`}
          onClick={() => setActiveTab('favoris')}
        >
          <Heart size={14} className="mr-1" /> {t.pages.myMusic.tabFav}
        </button>
      </div>

      <div className="create-banner cursor-pointer" onClick={() => {
        setTrackToRemix(null);
        handleOpenCreateModal();
      }}>
        <div className="create-banner-left">
          <div className="create-banner-icon-bg">
            <Plus size={24} className="text-white" strokeWidth={3} />
          </div>
          <div className="create-banner-text">
            <h3>{t.pages.dashboardHome.createSong}</h3>
            <p>{t.pages.dashboardHome.createSongDesc}</p>
          </div>
        </div>
        <div className="create-banner-arrow text-blue-400 font-light text-2xl">→</div>
      </div>

      <div className="tracks-grid">
        {isLoading ? (
          <div className="w-full flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (activeTab === 'favoris' ? tracks.filter(t => t.is_favorite) : tracks).length === 0 ? (
          <div className="w-full text-center py-10 text-stone-500">
            {activeTab === 'favoris' 
              ? t.pages.myMusic.noFavs 
              : t.pages.myMusic.noSongsDesc}
          </div>
        ) : (
          (activeTab === 'favoris' ? tracks.filter(t => t.is_favorite) : tracks).map((track) => (
            <div key={track.id} className="track-card">
              <div className="track-card-top">
                <div className="track-cover-container" onClick={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlay();
                  } else {
                    playTrack(track, tracks);
                  }
                }}>
                  <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop"} alt="Cover" className="track-img" />
                  
                  <div className={`play-overlay ${currentTrack?.id === track.id && isPlaying ? 'playing' : ''}`}>
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause size={24} className="text-white fill-current" />
                    ) : (
                      <Play size={24} className="text-white fill-current ml-1" />
                    )}
                  </div>
                </div>
                
                <div className="track-details">
                  <div className="track-details-header">
                    <h3 className="track-title-text" onClick={() => {
                      if (currentTrack?.id === track.id) togglePlay();
                      else playTrack(track, tracks);
                    }} style={{ cursor: 'pointer' }}>
                      {track.title}
                    </h3>
                    <button className="more-btn text-stone-400"><MoreVertical size={18} /></button>
                  </div>
                  <div className="track-style flex items-center text-sm text-stone-500 mt-1">
                    <span className="text-stone-700 mr-2 font-bold">🎵</span> {track.style}
                  </div>
                  <div className="track-meta flex items-center text-sm text-stone-500 mt-2 gap-3">
                    <span className="flex items-center gap-1">⏱ {track.duration || "0:00"}</span>
                    <button 
                      onClick={() => toggleFavorite(track)}
                      className={`heart-btn transition-colors ${track.is_favorite ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                    >
                      <Heart size={16} className={track.is_favorite ? 'fill-current text-red-500' : ''} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="track-actions-row">
                <button className="action-btn share-btn" onClick={() => handleShare(track)}>
                  <Share2 size={16} /> {t.pages.myMusic.btnShare}
                </button>
                <button 
                  className={`action-btn publish-btn ${track.is_public ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handlePublishClick(track)}
                >
                  <Globe size={16} /> {track.is_public ? t.pages.myMusic.btnPublished : t.pages.myMusic.btnPublish}
                </button>
                <button className="action-btn download-btn" onClick={() => handleDownload(track)}>
                  <Download size={16} />
                </button>
              </div>
              
              {/* Removed Remixer and Clip Short buttons as per user request */}
            </div>
          ))
        )}
      </div>

      <CreateTrackModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onTrackCreated={handleTrackCreated}
        userNotes={userNotes}
        initialTrack={trackToRemix}
      />

      <CreateShortModal
        isOpen={isShortModalOpen}
        onClose={() => setIsShortModalOpen(false)}
        track={trackForShort}
        userNotes={userNotes}
        onShortCreated={(trackId, videoUrl) => {
          setTracks(prev => prev.map(t => t.id === trackId ? { ...t, video_url: videoUrl } : t));
          fetchUserData(); // Mets à jour les notes
        }}
      />
      
      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        track={trackToPublish}
      />

      {/* Modal Plus de Crédits */}
      {isNoNotesModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up no-notes-modal">
            <div className="no-notes-icon-wrapper">
              <span>💸</span>
            </div>
            <h2 className="no-notes-title" style={{ color: '#ef4444' }}>{t.pages.myMusic.noCreditsTitle}</h2>
            <p className="no-notes-desc" style={{ color: '#f87171' }}>
              {t.pages.myMusic.noCreditsDesc}
            </p>
            <div className="no-notes-actions">
              <button 
                onClick={() => setIsNoNotesModalOpen(false)}
                className="btn-cancel-notes"
              >
                {t.pages.myMusic.btnCancel}
              </button>
              <button 
                onClick={() => {
                  setIsNoNotesModalOpen(false);
                  navigate(`/${lang || 'fr'}/credits`);
                }}
                className="btn-buy-notes"
              >
                {t.pages.myMusic.btnBuyCredits}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toastConfig?.message}
        type={toastConfig?.type}
        onClose={() => setToastConfig(null)}
      />
    </div>
  );
};

export default Dashboard;
