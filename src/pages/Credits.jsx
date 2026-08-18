import React, { useState } from 'react';
import { X, Music, ChevronDown, Tag, Check, Star, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './Credits.css';

const Credits = () => {
  const [selectedPlan, setSelectedPlan] = useState('populaire');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    'decouverte': { id: 'decouverte', notes: 2, priceUsd: 3.00 },
    'populaire': { id: 'populaire', notes: 5, priceUsd: 7.00 },
    'premium': { id: 'premium', notes: 10, priceUsd: 15.00 }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const plan = plans[selectedPlan];
      
      const { data, error: funcError } = await supabase.functions.invoke('pawapay-checkout', {
        body: { 
          planId: plan.id, 
          notesAmount: plan.notes, 
          priceUsd: plan.priceUsd 
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

      if (data && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Impossible d'obtenir le lien de paiement.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Erreur lors de la préparation du paiement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="notes-content">
      {/* Gift Banner */}
      <div className="gift-banner relative mb-8">
        <button className="gift-close-btn"><X size={14} /></button>
        <div className="gift-icon-container">
          <span className="gift-emoji">🎁</span>
        </div>
        <div className="gift-text-content">
          <h3>On a un cadeau pour toi !</h3>
          <p className="gift-subtext">Clique pour découvrir ta surprise</p>
          <p className="gift-expire mt-1"><span className="text-red-500 font-bold mr-1">•</span>Expire dans 00:00 min</p>
        </div>
      </div>

      {/* Pricing Header */}
      <div className="pricing-header">
        <div className="pricing-header-left">
          <h2>Acheter des Crédits</h2>
          <p>1 chanson = 1 Crédit</p>
        </div>
        <div className="currency-selector">
          <span className="currency-text">US USD</span>
          <span className="currency-badge">AUTO</span>
          <ChevronDown size={14} className="text-stone-400" />
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-cards">
        <div
          className={`pricing-card ${selectedPlan === 'decouverte' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('decouverte')}
        >
          <div className="pricing-card-left">
            <div className="pricing-icon bg-indigo-50">
              <Music size={20} className="text-indigo-900" strokeWidth={2.5} />
            </div>
            <div className="pricing-info">
              <h4>Découverte</h4>
              <span>2 Crédits</span>
            </div>
          </div>
          <div className="pricing-price">$3.00</div>
        </div>

        <div
          className={`pricing-card popular-card ${selectedPlan === 'populaire' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('populaire')}
        >
          <div className="popular-ribbon">
            <span className="text-xs">🔥</span> Populaire
          </div>
          <div className="pricing-card-left">
            <div className="pricing-icon bg-blue-100">
              <Music size={20} className="text-blue-500" strokeWidth={2.5} />
            </div>
            <div className="pricing-info">
              <h4 className="text-blue-500">Populaire</h4>
              <span className="text-stone-500">5 Crédits</span>
            </div>
          </div>
          <div className="pricing-price text-blue-500">$7.00</div>
        </div>

        <div
          className={`pricing-card ${selectedPlan === 'premium' ? 'selected' : ''}`}
          onClick={() => setSelectedPlan('premium')}
        >
          <div className="pricing-card-left">
            <div className="pricing-icon bg-indigo-50">
              <Music size={20} className="text-indigo-900" strokeWidth={2.5} />
            </div>
            <div className="pricing-info">
              <h4>Premium</h4>
              <span>10 Crédits</span>
            </div>
          </div>
          <div className="pricing-price">$15.00</div>
        </div>
      </div>

      <button className="promo-code-btn">
        <Tag size={14} className="mr-1 text-stone-500" />
        J'ai un code promo
        <ChevronDown size={14} className="ml-1 text-stone-400" />
      </button>

      {/* Social Proof */}
      <div className="social-proof">
        <div className="avatars-group">
          <img src="https://ui-avatars.com/api/?name=User+1&background=random" alt="Avatar" className="avatar-overlap z-40" />
          <img src="https://ui-avatars.com/api/?name=User+2&background=random" alt="Avatar" className="avatar-overlap z-30" />
          <img src="https://ui-avatars.com/api/?name=User+3&background=random" alt="Avatar" className="avatar-overlap z-20" />
          <img src="https://ui-avatars.com/api/?name=User+4&background=random" alt="Avatar" className="avatar-overlap z-10" />
        </div>
        <div className="reviews-info">
          <div className="stars">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#3B82F6" className="text-blue-500" strokeWidth={0} />)}
            <span className="rating-score">4.8 / 5</span>
          </div>
          <p>Utilisé par + de 171K utilisateurs</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
          {error}
        </div>
      )}

      <button 
        className="continue-purchase-btn flex justify-center items-center" 
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {isLoading ? (
          <><Loader2 size={18} className="animate-spin mr-2" /> Préparation...</>
        ) : (
          <>Continuer <span className="ml-2 font-normal">→</span></>
        )}
      </button>

      {/* Info Block */}
      <div className="how-it-works-block">
        <h3>Comment ça marche ?</h3>
        <ul className="info-list">
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>Achetez des Crédits selon vos besoins</span>
          </li>
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>1 Crédit = 1 chanson personnalisée</span>
          </li>
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>Vos Crédits n'expirent jamais</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Credits;
