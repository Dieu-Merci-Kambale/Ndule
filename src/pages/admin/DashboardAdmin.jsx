import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Music, Database, Activity, CreditCard, Play } from 'lucide-react';
import './Admin.css';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    tracksCount: 0,
    publicTracksCount: 0,
    totalCreditsUsed: 0,
    totalRevenue: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Stats globales (Comptage des emails distincts)
        const { data: profilesList } = await supabase.from('profiles').select('email');
        const uniqueEmails = new Set(profilesList?.map(p => p.email).filter(Boolean));
        const usersCount = uniqueEmails.size;
        
        const { count: tracksCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
        const { count: publicTracksCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('is_public', true);
        
        // Revenus (Transactions complétées)
        const { data: transactions, error: txError1 } = await supabase.from('transactions').select('plan_id, status').in('status', ['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL']);
        if (txError1) console.error("Error Revenue:", txError1);
        
        const planPrices = {
          'basique': 1,
          'populaire': 2,
          'premium': 3.5
        };

        // Calcul du revenu basé sur le plan_id
        let revenue = 0;
        if (transactions) {
          transactions.forEach(tx => {
            if (tx.plan_id && planPrices[tx.plan_id] !== undefined) {
              revenue += planPrices[tx.plan_id];
            } else if (tx.plan_id) {
              // Extract number from plan_id string if it contains digits
              const match = tx.plan_id.match(/[\d.]+/);
              if (match) {
                revenue += parseFloat(match[0]);
              }
            }
          });
        }

        setStats({
          usersCount: usersCount || 0,
          tracksCount: tracksCount || 0,
          publicTracksCount: publicTracksCount || 0,
          totalCreditsUsed: (tracksCount || 0) * 10, // 10 crédits par chanson générée
          totalRevenue: revenue
        });

        // 2. Derniers inscrits
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentUsers(users || []);

        // 3. Dernières chansons
        const { data: tracks } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentTracks(tracks || []);

        // 4. Dernières transactions (sans la jointure profiles pour éviter l'erreur de Foreign Key)
        const { data: txs, error: txError2 } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (txError2) console.error("Error Recent Txs:", txError2);
        setRecentTransactions(txs || []);

      } catch (err) {
        console.error("Erreur chargement admin", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Auto-actualisation toutes les 5 secondes
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    // Nettoyage de l'intervalle si on quitte la page
    return () => clearInterval(intervalId);
  }, []);

  const planPrices = {
    'basique': 1,
    'populaire': 2,
    'premium': 3.5
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Ligne de Stats */}
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
          <div className="stat-icon-wrapper orange">
            <Database size={24} />
          </div>
          <div className="stat-content">
            <h3>Crédits Utilisés</h3>
            <p className="stat-value">{loading ? '-' : stats.totalCreditsUsed.toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>Revenus Générés</h3>
            <p className="stat-value">{loading ? '-' : `${stats.totalRevenue.toLocaleString()} USD`}</p>
          </div>
        </div>
      </div>
      
      {/* Tableaux d'activité */}
      <div className="admin-tables-grid">
        {/* Derniers Utilisateurs */}
        <div className="admin-widget">
          <div className="admin-widget-header">
            <h3>Derniers Inscrits</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email / ID</th>
                  <th>Crédits Restants</th>
                  <th>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="3">Chargement...</td></tr> : 
                  recentUsers.map(user => (
                    <tr key={user.id}>
                      <td className="truncate-text" title={user.email}>{user.email || user.id.substring(0,8)+'...'}</td>
                      <td><span className="badge blue">{user.notes_balance || 0}</span></td>
                      <td>{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Derniers Paiements */}
        <div className="admin-widget">
          <div className="admin-widget-header">
            <h3>Derniers Paiements (PawaPay)</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="3">Chargement...</td></tr> : 
                  recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="font-semibold">{planPrices[tx.plan_id] !== undefined ? planPrices[tx.plan_id] : (tx.plan_id || '0')} USD</td>
                      <td>
                        <span className={`badge ${['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(tx.status?.toUpperCase()) ? 'green' : tx.status?.toUpperCase() === 'FAILED' ? 'red' : 'yellow'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{formatDate(tx.created_at)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dernières Chansons (Pleine largeur) */}
      <div className="admin-widget mt-6">
        <div className="admin-widget-header">
          <h3>Dernières Chansons Générées</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Style & Occasion</th>
                <th>Créateur</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5">Chargement...</td></tr> : 
                recentTracks.map(track => (
                  <tr key={track.id}>
                    <td className="font-medium">{track.title || 'Sans titre'}</td>
                    <td>{track.style} • {track.occasion || 'Général'}</td>
                    <td>{track.creator_name || 'Inconnu'}</td>
                    <td>{formatDate(track.created_at)}</td>
                    <td>
                      {track.audio_url ? (
                        <a href={track.audio_url} target="_blank" rel="noreferrer" className="action-link">
                          <Play size={16} /> Écouter
                        </a>
                      ) : (
                        <span className="text-stone-500">En cours...</span>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardAdmin;
