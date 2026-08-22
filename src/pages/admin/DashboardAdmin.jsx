import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Music, Database, Activity } from 'lucide-react';
import './Admin.css';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    tracksCount: 0,
    publicTracksCount: 0,
    totalCredits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtenir le nombre d'utilisateurs
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Obtenir le nombre de chansons générées
        const { count: tracksCount } = await supabase
          .from('tracks')
          .select('*', { count: 'exact', head: true });
          
        // Obtenir le nombre de chansons publiques
        const { count: publicTracksCount } = await supabase
          .from('tracks')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true);

        setStats({
          usersCount: usersCount || 0,
          tracksCount: tracksCount || 0,
          publicTracksCount: publicTracksCount || 0,
          totalCredits: 0 // Placeholder
        });
      } catch (err) {
        console.error("Erreur stats admin", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Utilisateurs Inscrits</h3>
            <p className="stat-value">{loading ? '-' : stats.usersCount}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper purple">
            <Music size={24} />
          </div>
          <div className="stat-content">
            <h3>Chansons Générées</h3>
            <p className="stat-value">{loading ? '-' : stats.tracksCount}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Chansons Publiques</h3>
            <p className="stat-value">{loading ? '-' : stats.publicTracksCount}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper orange">
            <Database size={24} />
          </div>
          <div className="stat-content">
            <h3>Crédits Utilisés</h3>
            <p className="stat-value">Bientôt</p>
          </div>
        </div>
      </div>
      
      <div className="admin-dashboard-widgets">
        <div className="admin-widget">
          <h3>Dernières Activités</h3>
          <p className="text-stone-400 text-sm mt-4">Module en cours de développement.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
