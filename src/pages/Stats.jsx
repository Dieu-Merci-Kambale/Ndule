import React from 'react';
import { ArrowLeft, Play, Heart, Download, Clock, Music, TrendingUp, ChevronUp, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Stats.css';

const Stats = () => {
  const navigate = useNavigate();

  return (
    <div className="stats-content">
      <div className="stats-header">
        <button onClick={() => navigate('/fr/dashboard')} className="stats-back-btn">
          <ArrowLeft size={16} className="text-stone-500" />
        </button>
        <div className="stats-header-titles">
          <h1 className="stats-title">Statistiques</h1>
          <p className="stats-subtitle">Suivez les performances de vos créations</p>
        </div>
      </div>

      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Play size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>Écoutes</span>
          </div>
          <div className="kpi-card-value">0</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Heart size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>Likes</span>
          </div>
          <div className="kpi-card-value">0</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Download size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>totalDownloads</span>
          </div>
          <div className="kpi-card-value">1</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Clock size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>Temps d'écoute</span>
          </div>
          <div className="kpi-card-value">0s</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <Music size={14} className="text-stone-500" strokeWidth={2.5} />
            <span>Chansons</span>
          </div>
          <div className="kpi-card-value">1</div>
        </div>
      </div>

      <div className="stats-chart-section">
        <div className="chart-header">
          <div className="chart-header-left">
            <TrendingUp size={16} className="text-blue-500" strokeWidth={2.5} />
            <h2 className="chart-title">Écoutes des 7 derniers jours</h2>
            <span className="chart-subtitle">(0 écoutes)</span>
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
            <h3>Vos chansons populaires</h3>
          </div>
          
          <div className="popular-song-item">
            <span className="song-rank">1</span>
            <div className="song-cover">
              <img src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop" alt="Cover" />
            </div>
            <div className="song-info">
              <h4>Déborah, Mwasi Na Ngai</h4>
              <span>CUSTOM</span>
            </div>
            <div className="song-stats">
              <span className="stats-number">0</span>
              <span className="stats-label">écoutes</span>
            </div>
          </div>
        </div>
        
        <div className="recent-activity-section">
          <div className="section-header-small">
            <h3>Activité récente</h3>
          </div>
          
          <div className="empty-activity">
            Aucune activité récente
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
