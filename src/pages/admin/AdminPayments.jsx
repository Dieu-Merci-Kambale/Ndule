import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Wallet, Clock, ArrowRightLeft } from 'lucide-react';
import './Admin.css';

const AdminPayments = () => {
  const [balance, setBalance] = useState({ availableUsd: 0, availableCdf: 0, pendingUsd: 0, pendingCdf: 0, raw: null });
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('ORANGE');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          pendingUsd: 0,
          pendingCdf: 0,
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
        .limit(100);
        
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

  const checkPayoutStatus = async (payoutId) => {
    try {
      const { data, error } = await supabase.functions.invoke('pawapay-payout-status', {
        body: { payoutId }
      });
      if (error) throw error;
      if (data && data.error) throw new Error(data.error);
      
      // Update UI history and balance
      fetchHistory();
      fetchBalance();
      
      let msg = `Statut actuel: ${data.status}`;
      if (data.failureReason) {
        msg += `\nRaison: ${data.failureReason.failureMessage || JSON.stringify(data.failureReason)}`;
      }
      alert(msg);
    } catch (err) {
      alert(`Erreur de vérification: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (['COMPLETED', 'ACCEPTED'].includes(status)) return 'green';
    if (['FAILED', 'REJECTED'].includes(status)) return 'red';
    return 'yellow';
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWithdrawals = withdrawals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(withdrawals.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-dashboard">
      {/* Solde Header */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card pawapay-stat">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <h3>Solde (USD)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${Number(balance?.availableUsd || 0).toLocaleString()} USD`}</p>
            </div>
          </div>
          
          <div className="stat-card pawapay-stat">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Wallet size={24} />
            </div>
            <div className="stat-content">
              <h3>Solde (CDF)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${Number(balance?.availableCdf || 0).toLocaleString()} CDF`}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f8fafc', color: '#64748b' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>En cours (USD)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${Number(balance?.pendingUsd || 0).toLocaleString()} USD`}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f8fafc', color: '#64748b' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>En cours (CDF)</h3>
              <p className="stat-value">{loadingBalance ? '-' : `${Number(balance?.pendingCdf || 0).toLocaleString()} CDF`}</p>
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
                <label>Montant (CDF)</label>
                <input 
                  type="number" 
                  step="1"
                  min="500"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 5000"
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
                ) : currentWithdrawals.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-stone-500">Aucun retrait effectué pour le moment</td></tr>
                ) : (
                  currentWithdrawals.map(w => (
                    <tr key={w.id}>
                      <td className="font-semibold">{w.amount} CDF</td>
                      <td>{w.network} • {w.phone}</td>
                      <td>
                        <span className={`badge ${getStatusColor(w.status)}`}>
                          {w.status}
                        </span>
                        {w.status !== 'COMPLETED' && w.status !== 'FAILED' && w.status !== 'ACCEPTED' && w.status !== 'REJECTED' && (
                           <button 
                             onClick={() => checkPayoutStatus(w.id)}
                             style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}
                           >
                             Vérifier
                           </button>
                        )}
                      </td>
                      <td>{formatDate(w.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  style={{ padding: '0.5rem 1rem', fontSize: '14px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Précédent
                </button>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Page {currentPage} sur {totalPages}</span>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  style={{ padding: '0.5rem 1rem', fontSize: '14px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
