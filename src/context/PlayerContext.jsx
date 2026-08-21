import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(0.8);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      playNext();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentTrack]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playTrack = (track, trackList = []) => {
    if (!track) return;

    if (trackList.length > 0) {
      setPlaylist(trackList);
    }

    if (currentTrack && (currentTrack.id === track.id || currentTrack.title === track.title)) {
      togglePlay();
      return;
    }

    const audio = audioRef.current;
    const audioUrl = track.audio_url || track.url;
    audio.src = audioUrl;
    audio.volume = isMuted ? 0 : volume;
    audio.play().then(() => {
      setCurrentTrack(track);
      setIsPlaying(true);
      
      // Increment play count in DB
      if (track.id) {
        supabase.rpc('increment_play_count', { track_id: track.id }).catch(err => {
          console.error("Failed to increment play count:", err);
        });
      }
    }).catch(err => {
      console.error("Audio playback error:", err);
    });
  };

  const togglePlay = () => {
    if (!currentTrack) return;

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const seek = (percent) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) return;
    const newTime = percent * audio.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
  };

  const changeVolume = (newVol) => {
    const vol = Math.max(0, Math.min(1, newVol));
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      const restoredVol = prevVolumeRef.current || 0.8;
      setVolume(restoredVol);
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = restoredVol;
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const playNext = () => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => (t.id && t.id === currentTrack.id) || t.title === currentTrack.title);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playTrack(playlist[currentIndex + 1], playlist);
    }
  };

  const playPrev = () => {
    if (!playlist || playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => (t.id && t.id === currentTrack.id) || t.title === currentTrack.title);
    if (currentIndex > 0) {
      playTrack(playlist[currentIndex - 1], playlist);
    }
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setCurrentTime(0);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime: formatTime(currentTime),
        duration: formatTime(duration),
        volume,
        isMuted,
        playTrack,
        togglePlay,
        seek,
        changeVolume,
        toggleMute,
        playNext,
        playPrev,
        closePlayer,
        playlist
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
