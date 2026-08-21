import React, { useState } from 'react';
import { X, Music, ChevronDown, Tag, Check, Star, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import './Credits.css';

const Credits = () => {
  const { t, lang } = useTranslation();
  const currencies = [
    { code: 'CDF', label: 'Franc Congolais', rate: 2850, symbol: 'FC' },
    { code: 'XOF', label: 'Franc CFA (BCEAO)', rate: 600, symbol: 'F CFA' },
    { code: 'XAF', label: 'Franc CFA (BEAC)', rate: 600, symbol: 'FCFA' },
    { code: 'KES', label: 'Shilling Kényan', rate: 130, symbol: 'KSh' },
    { code: 'USD', label: 'US Dollar', rate: 1, symbol: '$' }
  ];

  const [selectedPlan, setSelectedPlan] = useState('populaire');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    'decouverte': { id: 'decouverte', notes: 2, priceUsd: 1 },
    'populaire': { id: 'populaire', notes: 5, priceUsd: 2 },
    'premium': { id: 'premium', notes: 10, priceUsd: 3.5 }
  };

  const formatPrice = (priceUsd) => {
    if (selectedCurrency.code === 'USD') return `$${priceUsd}`;
    const localPrice = Math.round(priceUsd * selectedCurrency.rate);
    return `${localPrice} ${selectedCurrency.symbol}`;
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
          priceUsd: plan.priceUsd,
          currency: selectedCurrency.code
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


      {/* Pricing Header */}
      <div className="pricing-header">
        <div className="pricing-header-left">
          <h2>{t.pages.credits.title}</h2>
          <p>{t.pages.credits.subtitle}</p>
        </div>
        <div 
          className="currency-selector relative" 
          onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
          style={{ cursor: 'pointer' }}
        >
          <span className="currency-text font-medium text-stone-700">{selectedCurrency.code}</span>
          <ChevronDown size={14} className="text-stone-400" />
          
          {showCurrencyDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 z-50 overflow-hidden">
              {currencies.map(curr => (
                <div 
                  key={curr.code}
                  className="px-4 py-3 hover:bg-stone-50 text-sm flex items-center justify-between cursor-pointer border-b border-stone-100 last:border-0"
                  onClick={() => setSelectedCurrency(curr)}
                >
                  <span className="font-medium text-stone-700">{curr.label} ({curr.code})</span>
                  {selectedCurrency.code === curr.code && <Check size={16} className="text-blue-500" />}
                </div>
              ))}
            </div>
          )}
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
              <h4>{t.pages.credits.decouverte}</h4>
              <span>2 {t.pages.credits.credits}</span>
            </div>
          </div>
          <div className="pricing-price">{formatPrice(plans['decouverte'].priceUsd)}</div>
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
              <h4 className="text-blue-500">{t.pages.credits.populaire}</h4>
              <span className="text-stone-500">5 {t.pages.credits.credits}</span>
            </div>
          </div>
          <div className="pricing-price text-blue-500">{formatPrice(plans['populaire'].priceUsd)}</div>
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
              <h4>{t.pages.credits.premium}</h4>
              <span>10 {t.pages.credits.credits}</span>
            </div>
          </div>
          <div className="pricing-price">{formatPrice(plans['premium'].priceUsd)}</div>
        </div>
      </div>



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
          <p>{t.pages.credits.socialProof}</p>
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
          <><Loader2 size={18} className="animate-spin mr-2" /> {t.pages.credits.preparing}</>
        ) : (
          <>{t.pages.credits.continue} <span className="ml-2 font-normal">→</span></>
        )}
      </button>

      {/* Info Block */}
      <div className="how-it-works-block">
        <h3>{t.pages.credits.howItWorks}</h3>
        <ul className="info-list">
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>{t.pages.credits.point1}</span>
          </li>
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>{t.pages.credits.point2}</span>
          </li>
          <li>
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
            <span>{t.pages.credits.point3}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Credits;
