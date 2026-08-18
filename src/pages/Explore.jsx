import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { usePlayer } from '../context/PlayerContext';
import VideoModal from '../components/VideoModal';
import { 
  ArrowLeft, Search, Layers, Sun, SlidersHorizontal, 
  Headphones, Play, Pause, SkipBack, SkipForward, 
  Heart, Music, Volume2, Video
} from 'lucide-react';
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [publicTracks, setPublicTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoTrack, setActiveVideoTrack] = useState(null);
  
  // Track currently expanded in the view (for details)
  const [expandedTrack, setExpandedTrack] = useState(null);

  useEffect(() => {
    const fetchPublicTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPublicTracks(data);
          if (data.length > 0) setExpandedTrack(data[0]);
        } else {
          console.error("Supabase Error:", error);
        }
      } catch (err) {
        console.error("Erreur chargement public tracks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublicTracks();
  }, []);

  const filteredTracks = publicTracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.style && t.style.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="explore-container">
      {/* Top Bar */}
      <header className="explore-header">
        <div className="explore-header-left">
          <button onClick={() => navigate('/fr/dashboard')} className="back-btn-transparent">
            <ArrowLeft size={20} />
          </button>
          <div className="explore-logo flex items-center gap-1 text-blue-500 font-bold text-xl ml-2">
            <span className="logo-icon-explore">🎵</span> Ndule
          </div>
          <span className="font-bold ml-6 text-black">Explorer</span>
        </div>
        
        <div className="explore-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher une chanson..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="explore-header-right">
          <button className="icon-btn-transparent"><Layers size={20} /></button>
          <button className="icon-btn-transparent"><Sun size={20} /></button>
          <button className="icon-btn-transparent"><SlidersHorizontal size={20} /></button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="explore-main">
        {/* Left: Player */}
        <div className="explore-player-section">
          {expandedTrack ? (
            <>
              <div className="player-stats text-stone-400">
                <Headphones size={14} />
                <span className="text-sm">Public</span>
              </div>
              
              <div className="player-cover-large mt-4">
                <img src={expandedTrack.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=400&auto=format&fit=crop"} alt="Cover" />
              </div>
              
              <div className="player-artist-badge mt-4">
                <div className="artist-avatar bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase" style={{width: '24px', height: '24px', borderRadius: '12px'}}>
                  {expandedTrack.title ? expandedTrack.title.substring(0, 2) : 'N'}
                </div>
                <span className="artist-name text-sm font-medium text-stone-600">
                  Créateur Ndule
                </span>
                <span className="style-badge">{expandedTrack.style || 'Musique'}</span>
              </div>
              
              <div className="player-track-info mt-6 text-center">
                <h2 className="text-xl font-bold text-black">{expandedTrack.title}</h2>
                <p className="text-sm text-stone-400 mt-2 line-clamp-2 px-8">
                  {expandedTrack.story || expandedTrack.occasion || "Une création originale générée par IA"}
                </p>
              </div>
              
              <div className="player-timeline mt-8">
                <div className="timeline-bar bg-stone-200">
                  <div className="timeline-progress bg-blue-500" style={{ width: currentTrack?.id === expandedTrack.id && isPlaying ? '50%' : '0%' }}></div>
                  <div className="timeline-thumb bg-blue-600" style={{ left: currentTrack?.id === expandedTrack.id && isPlaying ? '50%' : '0%' }}></div>
                </div>
                <div className="timeline-times mt-2">
                  <span>0:00</span>
                  <span>{expandedTrack.duration || "0:00"}</span>
                </div>
              </div>
              
              <div className="player-main-controls mt-6">
                <button className="control-btn text-stone-400"><SkipBack size={20} fill="currentColor" /></button>
                <button className="play-circle-btn bg-blue-600 text-white border-0" onClick={() => {
                  if (currentTrack?.id === expandedTrack.id) togglePlay();
                  else playTrack(expandedTrack, publicTracks);
                }}>
                  {currentTrack?.id === expandedTrack.id && isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
                </button>
                <button className="control-btn text-stone-400"><SkipForward size={20} fill="currentColor" /></button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              {isLoading ? 'Chargement...' : 'Aucune chanson sélectionnée'}
            </div>
          )}
        </div>

        {/* Middle: Lyrics / Details */}
        <div className="explore-lyrics-section">
          {expandedTrack ? (
            <div className="lyrics-content scrollable">
              <h3 className="font-bold text-lg mb-4 text-center">Paroles</h3>
              {expandedTrack.lyrics ? (
                expandedTrack.lyrics.split('\n').map((line, idx) => (
                  <p key={idx} className={`lyric-line ${idx === 0 ? 'active-line' : ''}`}>
                    {line}
                  </p>
                ))
              ) : (
                <p className="lyric-line text-stone-500">Pas de paroles disponibles pour cette chanson (Version Instrumentale ou non renseignée).</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              Sélectionnez une chanson pour voir ses paroles
            </div>
          )}
        </div>

        {/* Right: Feed */}
        <div className="explore-feed-section">
          <h2 className="feed-title text-xl font-bold mb-6">Tendances Ndule</h2>
          
          <div className="feed-list">
            {isLoading ? (
              <p className="text-stone-400">Chargement des tendances...</p>
            ) : filteredTracks.length === 0 ? (
              <p className="text-stone-400">Aucune chanson publique trouvée.</p>
            ) : (
              filteredTracks.map((track, i) => (
                <div 
                  key={track.id} 
                  className={`feed-track-item ${expandedTrack?.id === track.id ? 'active' : ''}`}
                  onClick={() => setExpandedTrack(track)}
                >
                  <div className="feed-track-rank text-stone-300 font-bold">{i + 1}</div>
                  <div className="feed-track-cover relative cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    if (currentTrack?.id === track.id) togglePlay();
                    else playTrack(track, publicTracks);
                  }}>
                    <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop"} alt={track.title} />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                      {currentTrack?.id === track.id && isPlaying ? <Pause size={16} className="text-white fill-current" /> : <Play size={16} className="text-white fill-current ml-1" />}
                    </div>
                  </div>
                  <div className="feed-track-info flex-1">
                    <h4 className="font-bold text-stone-800">{track.title}</h4>
                    <p className="text-sm text-stone-500">Créateur Ndule</p>
                  </div>
                  <div className="feed-track-stats text-xs text-stone-400 flex items-center gap-3">
                    {track.video_url && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveVideoTrack(track); }}
                        className="p-1 hover:text-blue-400 transition-colors text-stone-400"
                        title="Regarder le clip vidéo"
                      >
                        <Video size={16} />
                      </button>
                    )}
                    <span className="flex items-center gap-1"><Heart size={14} /> 0</span>
                    <span>{track.duration || "0:00"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <VideoModal 
        isOpen={!!activeVideoTrack} 
        onClose={() => setActiveVideoTrack(null)} 
        videoUrl={activeVideoTrack?.video_url} 
        trackTitle={activeVideoTrack?.title} 
      />
    </div>
  );
};

export default Explore;
