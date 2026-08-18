import React, { useState, useEffect } from 'react';
import { Plus, X, Heart, Play, Music, Gift, Link, Video } from 'lucide-react';
import './DashboardHome.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { usePlayer } from '../context/PlayerContext';
import VideoModal from '../components/VideoModal';
import { useLocation } from 'react-router-dom';

const DashboardHome = () => {
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

  useEffect(() => {
    const verifyPayment = async () => {
      const searchParams = new URLSearchParams(location.search);
      const depositId = searchParams.get('depositId');
      
      if (depositId && !isVerifying) {
        setIsVerifying(true);
        try {
          const { data, error: funcError } = await supabase.functions.invoke('pawapay-verify', {
            body: { depositId }
          });
          
          let errorMsg = funcError ? funcError.message : null;
          if (funcError && funcError.context && typeof funcError.context.json === 'function') {
             const errBody = await funcError.context.json().catch(() => null);
             if (errBody && errBody.error) errorMsg = errBody.error;
          }
          
          if (data && data.success && data.status === 'COMPLETED') {
            alert("Paiement validé ! Vos crédits ont été ajoutés.");
          } else {
            alert(`Paiement en cours de traitement. Statut actuel: ${data?.status || 'Inconnu'}. Erreur détaillée: ${errorMsg || 'Aucune'}`);
          }
        } catch (err) {
          console.error("Verification error:", err);
        } finally {
          setIsVerifying(false);
          // Remove depositId from URL cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    verifyPayment();
  }, [location]);

  return (
    <div className="dashboard-home-content">
      {/* Header section */}
      <div className="home-header">
        <h1 className="home-greeting">Bonsoir, {userName} 👋</h1>
        <div className="home-subtitle-row">
          <span className="text-stone-500 font-medium">Tableau de bord</span>
          <span className="live-badge-small">
            <span className="live-dot-small"></span> Live
          </span>
        </div>
      </div>

      {/* Main Banners */}
      <div className="home-banners">
        {/* Create Banner */}
        <div className="create-banner cursor-pointer" onClick={() => navigate('/fr/dashboard', { state: { openCreateModal: true } })}>
          <div className="create-banner-left">
            <div className="create-banner-icon-bg">
              <Plus size={24} className="text-white" strokeWidth={3} />
            </div>
            <div className="create-banner-text">
              <h3>Créer une chanson</h3>
              <p>Afrobeat, Amapiano, R&B...</p>
            </div>
          </div>
          <div className="create-banner-arrow text-blue-400 font-light text-2xl">→</div>
        </div>

        {/* Gift Banner */}
        <div className="gift-banner relative">
          <button className="gift-close-btn"><X size={14} /></button>
          <div className="gift-icon-container">
            <span className="gift-emoji">🎁</span>
          </div>
          <div className="gift-text-content">
            <h3>On a un cadeau pour toi !</h3>
            <p className="gift-subtext">Clique pour découvrir ta surprise</p>
            <p className="gift-expire mt-1"><span className="text-red-500 font-bold mr-1">•</span>Expire dans 00:00 min</p>
          </div>
        </div>
      </div>

      {/* Recent Songs */}
      <div className="home-section">
        <h2 className="section-title">Chansons récentes</h2>
        
        {recentTracks.length === 0 ? (
          <p className="text-stone-500 text-sm">Aucune chanson générée pour le moment.</p>
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
                <Heart size={16} className="cursor-pointer hover:text-red-500 transition-colors" />
                <span className="text-sm font-medium ml-2">{track.duration}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="home-section">
        <h2 className="section-title">Actions rapides</h2>
        
        <div className="quick-actions-grid">
          <div className="quick-action-card cursor-pointer hover:-translate-y-1 transition-transform">
            <div className="quick-icon-bg bg-blue-500">
              <Link size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="quick-action-label">Acheter des crédits</span>
          </div>
          
          <div className="quick-action-card cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/fr/dashboard')}>
            <div className="quick-icon-bg bg-stone-900">
              <Music size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="quick-action-label">Ma bibliothèque</span>
          </div>
          
          <div className="quick-action-card cursor-pointer hover:-translate-y-1 transition-transform">
            <div className="quick-icon-bg bg-blue-600">
              <Gift size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="quick-action-label">Offrir des Crédits</span>
          </div>
        </div>
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
