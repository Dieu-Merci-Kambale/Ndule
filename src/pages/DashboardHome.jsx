import React, { useState, useEffect } from 'react';
import { Plus, X, Heart, Play, Music, Gift, Link, Video } from 'lucide-react';
import './DashboardHome.css';
import { useNavigate } from 'react-router-dom';
import { supabase, recordTrackEvent } from '../lib/supabaseClient';
import { usePlayer } from '../context/PlayerContext';
import VideoModal from '../components/VideoModal';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const DashboardHome = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack } = usePlayer();
  const [recentTracks, setRecentTracks] = useState([]);
  const [userName, setUserName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeVideoTrack, setActiveVideoTrack] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Artiste');

      const { data } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) setRecentTracks(data);
    };
    fetchRecent();
  }, []);

  const toggleFavorite = async (e, track) => {
    e.stopPropagation();
    const newState = !track.is_favorite;
    
    setRecentTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_favorite: newState } : t));
    
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_favorite: newState })
        .eq('id', track.id);
        
      if (error) {
        setRecentTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_favorite: !newState } : t));
      } else if (newState) {
        recordTrackEvent(track.id, 'like');
      }
    } catch (err) {
      console.error(err);
      setRecentTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_favorite: !newState } : t));
    }
  };

  useEffect(() => {
    // Background sync for ANY pending transactions (in case user closed page before redirect or webhook failed)
    const syncPendingTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: pendingTxs } = await supabase
        .from('transactions')
        .select('deposit_id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
        
      if (pendingTxs && pendingTxs.length > 0) {
        let hasUpdates = false;
        for (const tx of pendingTxs) {
           try {
             const { data } = await supabase.functions.invoke('pawapay-verify', {
                body: { depositId: tx.deposit_id }
             });
             if (data && data.success && ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(data.status?.toUpperCase())) {
                hasUpdates = true;
             }
           } catch (e) {
             console.error("Sync error:", e);
           }
        }
        if (hasUpdates) {
           window.location.reload();
        }
      }
    };
    
    syncPendingTransactions();
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(location.search);
      const depositId = searchParams.get('depositId');
      
      if (depositId && !isVerifying) {
        setIsVerifying(true);
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes with 5s interval

        const checkStatus = async () => {
          try {
            attempts++;
            const { data, error: funcError } = await supabase.functions.invoke('pawapay-verify', {
              body: { depositId }
            });
            
            let errorMsg = funcError ? funcError.message : null;
            if (funcError && funcError.context && typeof funcError.context.json === 'function') {
               const errBody = await funcError.context.json().catch(() => null);
               if (errBody && errBody.error) errorMsg = errBody.error;
            }
            
            const isSuccess = data && data.success && ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(data.status?.toUpperCase());
            const isFailure = data && data.success && ['FAILED', 'CANCELLED', 'REJECTED', 'ERROR'].includes(data.status?.toUpperCase());
            const isPending = data && data.success && !isSuccess && !isFailure;
            
            if (isSuccess) {
              alert("Paiement validé ! Vos crédits ont été ajoutés.");
              window.history.replaceState({}, document.title, window.location.pathname);
              setIsVerifying(false);
              window.location.reload(); // Force reload to fetch new credits
            } else if (isPending && attempts < maxAttempts) {
              // Poll again after 5 seconds
              setTimeout(checkStatus, 5000);
            } else {
              alert(`Le paiement n'a pas pu être validé automatiquement. Statut final: ${data?.status || 'Inconnu'}. Erreur: ${errorMsg || 'Aucune'}`);
              window.history.replaceState({}, document.title, window.location.pathname);
              setIsVerifying(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            setIsVerifying(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        };

        // Démarrer la première vérification
        checkStatus();
      }
    };
    
    verifyPayment();
  }, [location]);

  return (
    <div className="dashboard-home-content">
      {/* Header section */}
      <div className="home-header">
        <h1 className="home-greeting">
          {new Date().getHours() < 18 ? t.pages.dashboardHome.greetingMorning : t.pages.dashboardHome.greetingEvening}, {userName} 👋
        </h1>
        <div className="home-subtitle-row">
          <span className="text-stone-500 font-medium">{t.pages.dashboardHome.dashboard}</span>
          <span className="live-badge-small">
            <span className="live-dot-small"></span> Live
          </span>
        </div>
      </div>

      {/* Main Banners */}
      <div className="home-banners">
        {/* Create Banner */}
        <div className="create-banner cursor-pointer" onClick={() => navigate(`/${lang}/dashboard`, { state: { openCreateModal: true } })}>
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
      </div>

      {/* Recent Songs */}
      <div className="home-section">
        <h2 className="section-title">{t.pages.dashboardHome.recentSongs}</h2>
        
        {recentTracks.length === 0 ? (
          <p className="text-stone-500 text-sm">{t.pages.dashboardHome.noSongs}</p>
        ) : (
          recentTracks.map(track => (
            <div key={track.id} className="recent-track-item cursor-pointer" onClick={() => playTrack(track, recentTracks)}>
              <div className="recent-track-left">
                <div className="recent-cover">
                  <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop"} alt="Cover" />
                  <div className="recent-play-overlay">
                    <Play size={14} fill="currentColor" className="text-white" />
                  </div>
                </div>
                <div className="recent-track-info">
                  <h4>{track.title}</h4>
                  <p>{track.style} • {track.occasion}</p>
                </div>
              </div>
              <div className="recent-track-right text-stone-400 flex items-center">
                {track.video_url && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveVideoTrack(track); }}
                    className="p-1 hover:text-blue-400 transition-colors mr-2"
                    title="Regarder le clip vidéo"
                  >
                    <Video size={16} />
                  </button>
                )}
                <button 
                  onClick={(e) => toggleFavorite(e, track)}
                  className={`p-1 transition-colors ${track.is_favorite ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                >
                  <Heart size={16} className={track.is_favorite ? 'fill-current' : ''} />
                </button>
                <span className="text-sm font-medium ml-2">{track.duration}</span>
              </div>
            </div>
          ))
        )}
      </div>



      <VideoModal 
        isOpen={!!activeVideoTrack} 
        onClose={() => setActiveVideoTrack(null)} 
        videoUrl={activeVideoTrack?.video_url} 
        trackTitle={activeVideoTrack?.title} 
      />
    </div>
  );
};

export default DashboardHome;
