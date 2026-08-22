import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Wallet, ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import './Admin.css';

const AdminPayments = () => {
  const [balance, setBalance] = useState({ availableUsd: 0, availableCdf: 0, pending: 0, raw: null });
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
      const { data, error } = await supabase.functions.invoke('pawapay-balance');
      if (error) {
        let errorMsg = error.message;
        if (error.context && typeof error.context.json === 'function') {
          const errBody = await error.context.json().catch(() => null);
          if (errBody && errBody.error) errorMsg = errBody.error;
        }
        throw new Error(errorMsg);
      }
      
      if (data && data.error) throw new Error(data.error);
      
      if (data && data.availableUsd !== undefined) {
        setBalance({ 
          availableUsd: data.availableUsd, 
          availableCdf: data.availableCdf || 0,
          pending: 0, 
          raw: data.balances 
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du solde:', error);
      setMessage(`Erreur Solde: ${error.message}`);
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
      // Appel à la fonction Supabase Edge pour initier le retrait PawaPay
      const { data, error: funcError } = await supabase.functions.invoke('pawapay-payout', {
        body: {
          amount: withdrawAmount,
          network: network,
          phone: phoneNumber
        }
      });

      if (funcError) {
        let errorMsg = funcError.message;
        if (funcError.context && typeof funcError.context.json === 'function') {
          const errBody = await funcError.context.json().catch(() => null);
          if (errBody && errBody.error) errorMsg = errBody.error;
        }
        throw new Error(errorMsg);
      }
      
      if (data && data.error) {
        throw new Error(data.error);
      }

      setMessage('Demande de retrait initiée avec succès sur PawaPay !');
      setWithdrawAmount('');
      
      // Rafraîchir l'historique et le solde
      fetchHistory();
      fetchBalance();
      
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
      <div className="admin-content-inner">
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card pawapay-stat">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <h3>Solde (USD)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${balance.availableUsd.toLocaleString()} USD`}</p>
            </div>
          </div>
          
          <div className="stat-card pawapay-stat">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <h3>Solde (CDF)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${balance.availableCdf.toLocaleString()} CDF`}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f8fafc', color: '#64748b' }}>
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
          <div className="admin-form-container">
            <form onSubmit={handleWithdraw} className="admin-form">
              <div className="admin-form-group">
                <label>Montant (USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="1"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 50"
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label>Réseau Mobile</label>
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="admin-input"
                >
                  <option value="ORANGE">Orange Money</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                  <option value="MPESA">M-Pesa</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Numéro de téléphone</label>
                <input 
                  type="text" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +243890000000"
                  className="admin-input"
                />
              </div>

              {message && (
                <div className={`admin-message ${message.includes('Erreur') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={withdrawLoading}
                className="admin-btn-primary"
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
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '12px', color: '#64748b', overflowX: 'auto' }}>
              <strong>Debug PawaPay API :</strong>
              <pre>{JSON.stringify(balance.raw, null, 2)}</pre>
            </div>
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
