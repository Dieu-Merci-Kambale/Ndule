import React from 'react';
import { Play, Square } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { usePlayer } from '../context/PlayerContext';
import './PlaylistSection.css';

const PlaylistSection = () => {
  const { t } = useTranslation();
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const getTrackAudioUrl = (styleStr, titleStr) => {
    const style = (styleStr || '').toLowerCase();
    const title = (titleStr || '').toLowerCase();

    if (style.includes('afrobeat')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
    if (style.includes('amapiano')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3';
    if (style.includes('roumba') || style.includes('rumba')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3';
    if (style.includes('acoustique')) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3';
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  };

  const handlePlay = (index, item) => {
    const track = {
      id: `playlist-${index}`,
      title: item.title,
      style: item.style,
      audio_url: getTrackAudioUrl(item.style, item.title),
      image_url: item.img
    };
    
    const formattedList = t.playlist.items.map((it, idx) => ({
      id: `playlist-${idx}`,
      title: it.title,
      style: it.style,
      audio_url: getTrackAudioUrl(it.style, it.title),
      image_url: it.img
    }));

    playTrack(track, formattedList);
  };

  return (
    <section id="playlist" className="playlist-section">
      <div className="playlist-glow"></div>
      <div className="playlist-container">
        
        <div className="playlist-header">
          <h2 className="playlist-title">
            Ils ont créé ça avec <strong className="text-blue-600">Ndule</strong>
          </h2>
          <p className="playlist-subtitle">
            Écoutez des exemples de chansons personnalisées créées pour des moments uniques.
          </p>
        </div>

        <div className="playlist-grid">
          {t.playlist.items.map((item, index) => {
            const isThisPlaying = currentTrack?.id === `playlist-${index}` && isPlaying;
            return (
              <div 
                key={index} 
                className={`playlist-card ${isThisPlaying ? 'playing' : ''}`}
                onClick={() => handlePlay(index, item)}
              >
                <img src={item.img} alt={item.title} className="playlist-image" />
                <div className="playlist-overlay"></div>
                
                <div className="playlist-card-top">
                  <button className="playlist-play-btn" onClick={(e) => { e.stopPropagation(); handlePlay(index, item); }}>
                    {isThisPlaying ? (
                      <Square className="fill-current ml-0 text-blue-500" size={20} />
                    ) : (
                      <Play className="fill-current ml-1" size={20} />
                    )}
                  </button>
                </div>
                
                <div className="playlist-card-bottom">
                  <div className="playlist-tags">
                    {[item.category, item.category2].filter(Boolean).map((tag, i) => (
                      <span key={i} className="playlist-tag">{tag}</span>
                    ))}
                  </div>
                  <h3 className="playlist-song-title">{item.title}</h3>
                  <p className="playlist-song-style">{item.style}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PlaylistSection;
