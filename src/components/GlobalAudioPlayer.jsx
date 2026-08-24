import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, ChevronDown, Heart, Wand2, Repeat } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { supabase, recordTrackEvent } from '../lib/supabaseClient';
import './GlobalAudioPlayer.css';

const GlobalAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    playNext,
    playPrev,
    closePlayer
  } = usePlayer();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isFavoriteLocally, setIsFavoriteLocally] = useState(false);
  const scrubberRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    if (currentTrack) {
      setIsFavoriteLocally(currentTrack.is_favorite || false);
      // Log the play event
      recordTrackEvent(currentTrack.id, 'play');
    }
  }, [currentTrack]);

  if (!currentTrack) return null;
  if (location.pathname.includes('/explore')) return null;

  const toggleFavorite = async () => {
    if (!currentTrack) return;
    const newState = !isFavoriteLocally;
    setIsFavoriteLocally(newState);
    
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_favorite: newState })
        .eq('id', currentTrack.id);
        
      if (error) {
        setIsFavoriteLocally(!newState); // revert on error
        console.error("Erreur toggle favori:", error);
      } else {
        // Mettre à jour l'objet en mémoire pour le contexte
        currentTrack.is_favorite = newState;
        if (newState) {
          recordTrackEvent(currentTrack.id, 'like');
        }
      }
    } catch (err) {
      setIsFavoriteLocally(!newState);
      console.error(err);
    }
  };

  const handleScrubberClick = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percent);
  };

  const coverUrl = currentTrack.cover_url || currentTrack.image_url || currentTrack.img || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop";

  if (isMinimized) {
    return (
      <div className="player-widget-minimized animate-slide-up" onClick={() => setIsMinimized(false)}>
        <img src={coverUrl} alt="Cover" className="minimized-cover" />
        <div className="minimized-info">
          <span className="minimized-title">{currentTrack.title}</span>
          <span className="minimized-sub">En lecture...</span>
        </div>
        <div className="minimized-actions">
          <button className="min-ctrl-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
          </button>
          <button className="min-ctrl-btn" onClick={(e) => { e.stopPropagation(); closePlayer(); }}>
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-widget animate-slide-up">
      <div className="widget-header">
        <button className="widget-icon-btn" onClick={() => setIsMinimized(true)}>
          <ChevronDown size={20} />
        </button>
        <span className="widget-header-title">En lecture</span>
        <button className="widget-icon-btn" onClick={closePlayer}>
          <X size={20} />
        </button>
      </div>

      <div className="widget-cover-wrapper">
        <img 
          src={coverUrl} 
          alt="Cover" 
          className={`widget-cover ${isPlaying ? 'spin-slow' : ''}`}
        />
        <div className="widget-cover-glow" style={{ backgroundImage: `url(${coverUrl})` }}></div>
      </div>

      <div className="widget-track-info">
        <h4 className="widget-track-title">{currentTrack.title}</h4>
        <p className="widget-track-sub">{currentTrack.style || 'CUSTOM'}</p>
      </div>

      <div className="widget-progress-section">
        <div 
          className="widget-scrubber-container" 
          ref={scrubberRef}
          onClick={handleScrubberClick}
        >
          <div className="widget-scrubber-bg">
            <div className="widget-scrubber-fill" style={{ width: `${progress}%` }}>
              <div className="widget-scrubber-thumb"></div>
            </div>
          </div>
        </div>
        <div className="widget-time-row">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>

      <div className="widget-controls-row">
        <button 
          className="widget-sec-btn" 
          onClick={toggleFavorite}
          style={{ color: isFavoriteLocally ? '#ef4444' : undefined }}
        >
          <Heart size={20} className={isFavoriteLocally ? "fill-current" : ""} />
        </button>
        <button className="widget-sec-btn"><Wand2 size={20} /></button>
        
        <button className="widget-nav-btn" onClick={playPrev}><SkipBack size={20} className="fill-current" /></button>
        
        <button className="widget-play-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
        </button>
        
        <button className="widget-nav-btn" onClick={playNext}><SkipForward size={20} className="fill-current" /></button>
        
        <button className="widget-sec-btn"><Repeat size={20} /></button>
        <button className="widget-sec-btn" onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;
