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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's tracks
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setTracks(data);
        }
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const totalPlays = tracks.reduce((sum, t) => sum + (t.play_count || 0), 0);

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
          <div className="kpi-card-value">0</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Download size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>{t.pages.stats.downloads}</span>
          </div>
          <div className="kpi-card-value">0</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Clock size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>{t.pages.stats.listenTime}</span>
          </div>
          <div className="kpi-card-value">0s</div>
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
              <span className="chart-placeholder">(0 écoutes)</span>
            </div>
          </div>
          <button className="chart-collapse-btn">
            <ChevronUp size={16} className="text-stone-400" />
          </button>
        </div>
        
        <div className="chart-container">
          <div className="chart-y-axis">
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
            <span>0</span>
          </div>
          <div className="chart-area">
            <div className="chart-grid-lines">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            {/* La ligne orange à 0 */}
            <div className="chart-line-zero"></div>
            
            <div className="chart-x-axis">
              <span>dim.</span>
              <span>lun.</span>
              <span>mar.</span>
              <span>mer.</span>
              <span>jeu.</span>
              <span>ven.</span>
              <span>sam.</span>
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
              <div className="empty-activity">
                {t.pages.stats.noActivity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
