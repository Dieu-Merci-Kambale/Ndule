import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Wallet, ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import './Admin.css';

const AdminPayments = () => {
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('ORANGE');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Pour le moment on va simuler les appels API PawaPay si la fonction n'est pas encore faite
  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      // TODO: Call Supabase Edge Function 'pawapay-balance'
      // En attendant l'API officielle de PawaPay
      setBalance({ available: 0, pending: 0 });
    } catch (error) {
      console.error('Erreur lors du chargement du solde:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // Si la table n'existe pas encore, on gère l'erreur silencieusement
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.warn("La table withdrawals n'existe peut-être pas encore.", error.message);
        setWithdrawals([]);
      } else {
        setWithdrawals(data || []);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !phoneNumber) return;
    
    setWithdrawLoading(true);
    setMessage('');
    
    try {
      // TODO: Appeler PawaPay payout Edge Function
      
      // Simulation pour le moment
      setTimeout(() => {
        setMessage('Demande de retrait initiée avec succès (Simulation). L\'API PawaPay Payout doit être configurée.');
        setWithdrawAmount('');
        setWithdrawLoading(false);
      }, 1500);
      
    } catch (error) {
      setMessage(`Erreur: ${error.message}`);
      setWithdrawLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Solde Header */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <h3>Solde PawaPay Disponible</h3>
            <p className="stat-value">{loadingBalance ? '-' : `${balance.available.toLocaleString()} USD`}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper yellow">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>En cours de traitement</h3>
            <p className="stat-value">{loadingBalance ? '-' : `${balance.pending.toLocaleString()} USD`}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-tables-grid">
        {/* Formulaire de Retrait */}
        <div className="admin-widget">
          <div className="admin-widget-header">
            <h3>Effectuer un Retrait</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Montant (USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="1"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 50"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Réseau Mobile</label>
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ORANGE">Orange Money</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                  <option value="MPESA">M-Pesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Numéro de téléphone</label>
                <input 
                  type="text" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +243890000000"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={withdrawLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {withdrawLoading ? (
                  <span>Traitement en cours...</span>
                ) : (
                  <>
                    <ArrowRightLeft size={18} />
                    Retirer les fonds
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Historique des retraits */}
        <div className="admin-widget">
          <div className="admin-widget-header">
            <h3>Historique des Retraits</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Montant</th>
                  <th>Destinataire</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr><td colSpan="4">Chargement...</td></tr>
                ) : withdrawals.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-stone-500">Aucun retrait effectué pour le moment</td></tr>
                ) : (
                  withdrawals.map(w => (
                    <tr key={w.id}>
                      <td className="font-semibold">{w.amount} USD</td>
                      <td>{w.network} • {w.phone}</td>
                      <td>
                        <span className={`badge ${w.status === 'COMPLETED' ? 'green' : w.status === 'FAILED' ? 'red' : 'yellow'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td>{formatDate(w.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
