import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Download, Clock, Music, TrendingUp, ChevronUp, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import './Stats.css';

const Stats = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!tracksError && tracksData) {
          setTracks(tracksData);
          
          if (tracksData.length > 0) {
            const trackIds = tracksData.map(t => t.id);
            
            // On gère l'erreur silencieusement si la table track_events n'existe pas encore (avant exécution du script SQL)
            const { data: eventsData, error: eventsError } = await supabase
              .from('track_events')
              .select('*, tracks(title)')
              .in('track_id', trackIds)
              .order('created_at', { ascending: false });
              
            if (!eventsError && eventsData) {
              setEvents(eventsData);
            }
          }
        }
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const parseDuration = (durStr) => {
    if (!durStr) return 0;
    if (durStr.includes(':')) {
      const parts = durStr.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
    }
    const secs = parseFloat(durStr);
    return isNaN(secs) ? 0 : secs;
  };

  const totalPlays = tracks.reduce((sum, t) => sum + (t.play_count || 0), 0);
  const totalLikes = tracks.reduce((sum, t) => sum + (t.like_count || 0), 0);
  const totalDownloads = tracks.reduce((sum, t) => sum + (t.download_count || 0), 0);
  
  const totalListenTimeSecs = tracks.reduce((sum, t) => sum + (parseDuration(t.duration) * (t.play_count || 0)), 0);
  
  const formatListenTime = (secs) => {
    if (secs < 60) return `${Math.floor(secs)}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${Math.floor(secs % 60)}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  // 7 Days Data
  const last7DaysData = Array(7).fill(0);
  const daysLabels = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    daysLabels.push(formatter.format(d).replace('.', ''));
  }
  
  const playEvents = events.filter(e => e.event_type === 'play');
  playEvents.forEach(e => {
    const eDate = new Date(e.created_at);
    const diffTime = today.getTime() - eDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      last7DaysData[6 - diffDays]++;
    }
  });
  
  const maxPlays = Math.max(...last7DaysData, 4);
  const total7DaysPlays = last7DaysData.reduce((a,b)=>a+b, 0);

  // Y Axis labels
  const yAxisLabels = [
    maxPlays,
    Math.round(maxPlays * 0.75),
    Math.round(maxPlays * 0.5),
    Math.round(maxPlays * 0.25),
    0
  ];

  const getEventText = (event) => {
    const trackName = event.tracks?.title || 'Une musique';
    switch(event.event_type) {
      case 'play': return `Nouvelle écoute sur "${trackName}"`;
      case 'like': return `Nouveau like sur "${trackName}"`;
      case 'download': return `Téléchargement de "${trackName}"`;
      default: return `Action sur "${trackName}"`;
    }
  };

  const getTimeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${Math.floor(diffHours / 24)} j`;
  };

  return (
    <div className="stats-content">
      <div className="stats-header">
        <button onClick={() => navigate('/fr/dashboard')} className="stats-back-btn">
          <ArrowLeft size={16} className="text-stone-500" />
        </button>
        <div className="stats-header-content">
          <h1 className="stats-title">{t.pages.stats.title}</h1>
          <p className="stats-subtitle">{t.pages.stats.subtitle}</p>
        </div>
      </div>

      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Play size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>{t.pages.stats.listens}</span>
          </div>
          <div className="kpi-card-value">
            {loading ? '...' : totalPlays}
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-card-title">{t.pages.stats.likes}</span>
          <div className="kpi-card-value">{loading ? '...' : totalLikes}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Download size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>{t.pages.stats.downloads}</span>
          </div>
          <div className="kpi-card-value">{loading ? '...' : totalDownloads}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Clock size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>{t.pages.stats.listenTime}</span>
          </div>
          <div className="kpi-card-value">{loading ? '...' : formatListenTime(totalListenTimeSecs)}</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-card-title">{t.pages.stats.songs}</span>
          <div className="kpi-card-value">{loading ? '...' : tracks.length}</div>
        </div>
      </div>

      <div className="stats-chart-section">
        <div className="chart-header">
          <div className="chart-header-left">
            <TrendingUp size={16} className="text-blue-500" />
            <div className="stats-main-chart">
              <h2 className="chart-title">{t.pages.stats.listen7Days}</h2>
              <span className="chart-placeholder">({total7DaysPlays} écoutes)</span>
            </div>
          </div>
          <button className="chart-collapse-btn">
            <ChevronUp size={16} className="text-stone-400" />
          </button>
        </div>
        
        <div className="chart-container">
          <div className="chart-y-axis">
            {yAxisLabels.map((l, i) => <span key={i}>{l}</span>)}
          </div>
          <div className="chart-area" style={{ position: 'relative' }}>
            <div className="chart-grid-lines">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            {/* Real SVG Chart line */}
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingBottom: '24px'}}>
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 600 100">
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  points={last7DaysData.map((val, i) => `${(i / 6) * 600},${100 - (val / maxPlays) * 100}`).join(' ')}
                />
              </svg>
            </div>
            
            <div className="chart-line-zero"></div>
            
            <div className="chart-x-axis">
              {daysLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-bottom-grid">
        <div className="popular-songs-section">
          <div className="section-header-small">
            <BarChart2 size={16} className="text-blue-500" strokeWidth={2.5} />
            <h3>{t.pages.stats.popularSongs}</h3>
          </div>
          
          {loading ? (
            <p className="text-stone-400 text-sm mt-4">Chargement...</p>
          ) : tracks.length === 0 ? (
            <p className="text-stone-400 text-sm mt-4">{t.pages.stats.noSongs}</p>
          ) : (
            // Sort tracks by play_count descending
            [...tracks].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 5).map((track, idx) => (
              <div key={track.id} className="popular-song-item">
                <span className="song-rank">{idx + 1}</span>
                <div className="song-cover">
                  <img src={track.cover_url || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop"} alt={track.title} />
                </div>
                <div className="song-info">
                  <h4>{track.title}</h4>
                  <span>{track.style || 'Musique'}</span>
                </div>
                <div className="song-stats">
                  <span className="stats-value font-bold">{track.play_count || 0}</span>
                  <span className="stats-label">{t.pages.stats.listens.toLowerCase()}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="recent-activity-section">
          <div className="stats-recent-activity">
            <h3>{t.pages.stats.recentActivity}</h3>
            <div className="activity-list">
              {events.length === 0 ? (
                <div className="empty-activity">
                  {t.pages.stats.noActivity}
                </div>
              ) : (
                events.slice(0, 6).map(e => (
                  <div key={e.id} className="activity-item" style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6'}}>
                    <span style={{fontSize: '13px', color: '#374151'}}>{getEventText(e)}</span>
                    <span style={{fontSize: '11px', color: '#9ca3af'}}>{getTimeAgo(e.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
