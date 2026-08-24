import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { usePlayer } from '../context/PlayerContext';
import { useTranslation } from '../hooks/useTranslation';
import { 
  ArrowLeft, Search, Play, Pause, SkipBack, SkipForward, Compass
} from 'lucide-react';
import './Explore.css';

const PAGE_SIZE = 10;

const Explore = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playTrack, currentTrack, isPlaying, togglePlay, progress, currentTime, duration, seek } = usePlayer();
  
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // To handle typing debounce for search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Refs for Intersection Observer
  const observer = useRef(null);
  const trackRefs = useRef({});
  const scrubberRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tracks
  const fetchTracks = useCallback(async (pageNum, reset = false) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('tracks')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        // Recherche avancée : nom ou style
        query = query.or(`title.ilike.%${debouncedSearch}%,style.ilike.%${debouncedSearch}%`);
      }

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error } = await query.range(from, to);

      if (!error && data) {
        if (reset) {
          setTracks(data);
        } else {
          setTracks(prev => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect for initial load or search change
  useEffect(() => {
    setPage(0);
    fetchTracks(0, true);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTracks(nextPage, false);
    }
  };

  // Intersection Observer to autoplay the track in view
  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trackId = entry.target.dataset.id;
          const track = tracks.find(t => t.id === trackId);
          if (track && currentTrack?.id !== track.id) {
            playTrack(track, tracks);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.7 // Trigger when 70% of the item is visible
    });

    const currentRefs = trackRefs.current;
    Object.values(currentRefs).forEach(node => {
      if (node) observer.current.observe(node);
    });

    return () => {
      if (observer.current) {
        Object.values(currentRefs).forEach(node => {
          if (node) observer.current.unobserve(node);
        });
        observer.current.disconnect();
      }
    };
  }, [tracks, currentTrack, playTrack]);

  const handleScrubberClick = (e, isCurrentTrack) => {
    if (!isCurrentTrack || !scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percent);
  };

  return (
    <div className="explore-container">
      {/* Fixed Header */}
      <header className="explore-header-fixed">
        <div className="explore-header-top">
          <button onClick={() => navigate('/fr/dashboard')} className="back-btn-transparent">
            <ArrowLeft size={20} />
          </button>
          <div className="explore-logo flex items-center gap-1 text-blue-500 font-bold">
            <Compass size={24} /> {t.pages.explore.title}
          </div>
          <div style={{width: 40}}></div> {/* Spacer for balance */}
        </div>
        
        <div className="explore-search-bar">
          <Search size={18} className="text-stone-400" />
          <input 
            type="text" 
            placeholder={t.pages.explore.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Feed Area */}
      {tracks.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-stone-400">
          {t.pages.explore.noTracks}
        </div>
      ) : (
        <>
          {tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            
            // Extract creator name from track column
            const creatorName = track.creator_name || 'Créateur Ndules';
            
            return (
              <div 
                key={track.id} 
                className="feed-snap-item"
                data-id={track.id}
                ref={el => trackRefs.current[track.id] = el}
              >
                <div className="music-card">
                  {/* Cover */}
                  <div className="music-card-cover">
                    <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop"} alt={track.title} />
                  </div>
                  
                  {/* Badge */}
                  <div className="music-card-badge-row">
                    <div className="mc-avatar">
                      {creatorName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="mc-name">@{creatorName}</span>
                    <span className="mc-style">{track.style || 'Musique'}</span>
                  </div>
                  
                  {/* Title & Subtitle */}
                  <h2 className="music-card-title">{track.title}</h2>
                  <p className="music-card-subtitle">
                    {t.pages.explore.aiGenerated}
                  </p>
                  
                  {/* Player Controls inside Card */}
                  <div className="mc-player-container">
                    <div 
                      className="mc-progress-bar"
                      ref={isCurrent ? scrubberRef : null}
                      onClick={(e) => handleScrubberClick(e, isCurrent)}
                    >
                      <div 
                        className="mc-progress-fill" 
                        style={{ width: isCurrent ? `${progress}%` : '0%' }}
                      >
                        {isCurrent && <div className="mc-progress-thumb"></div>}
                      </div>
                    </div>
                    
                    <div className="mc-time-row">
                      <span>{isCurrent ? currentTime : '0:00'}</span>
                      <span>{isCurrent && duration !== '0:00' ? duration : (track.duration || '0:00')}</span>
                    </div>
                    
                    <div className="mc-controls-row">
                      <button className="mc-ctrl-btn">
                        <SkipBack size={24} fill="currentColor" />
                      </button>
                      
                      <button 
                        className="mc-play-btn" 
                        onClick={() => {
                          if (isCurrent) togglePlay();
                          else playTrack(track, tracks);
                        }}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause size={32} fill="currentColor" />
                        ) : (
                          <Play size={32} fill="currentColor" className="ml-1" />
                        )}
                      </button>
                      
                      <button className="mc-ctrl-btn">
                        <SkipForward size={24} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Pagination End */}
          <div className="load-more-container">
            {isLoading ? (
              <div className="text-stone-400">Chargement...</div>
            ) : hasMore ? (
              <button className="load-more-btn" onClick={loadMore}>
                Charger plus
              </button>
            ) : (
              <div className="text-stone-400 text-sm">Vous avez vu toutes les musiques !</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
