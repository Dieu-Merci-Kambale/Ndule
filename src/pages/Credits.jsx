import React, { useState, useRef, useEffect } from 'react';
import { Music, ChevronDown, Check, Star, Loader2, ArrowLeft, Search, Smartphone, CreditCard, Tag, AlertCircle, X, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import './Credits.css';

const countries = [
  { code: 'SN', iso3: 'SEN', name: 'Sénégal', dialCode: '+221', currency: 'FCFA', rate: 600 },
  { code: 'BF', iso3: 'BFA', name: 'Burkina Faso', dialCode: '+226', currency: 'FCFA', rate: 600 },
  { code: 'CI', iso3: 'CIV', name: 'Côte d\'Ivoire', dialCode: '+225', currency: 'FCFA', rate: 600 },
  { code: 'ML', iso3: 'MLI', name: 'Mali', dialCode: '+223', currency: 'FCFA', rate: 600 },
  { code: 'CM', iso3: 'CMR', name: 'Cameroun', dialCode: '+237', currency: 'FCFA', rate: 600 },
  { code: 'CD', iso3: 'COD', name: 'R.D. Congo', dialCode: '+243', currency: 'CDF', rate: 2850 },
  { code: 'GH', iso3: 'GHA', name: 'Ghana', dialCode: '+233', currency: 'GHS', rate: 15 },
  { code: 'KE', iso3: 'KEN', name: 'Kenya', dialCode: '+254', currency: 'KES', rate: 130 },
  { code: 'RW', iso3: 'RWA', name: 'Rwanda', dialCode: '+250', currency: 'RWF', rate: 1350 },
  { code: 'ZM', iso3: 'ZMB', name: 'Zambie', dialCode: '+260', currency: 'ZMW', rate: 27 },
  { code: 'UG', iso3: 'UGA', name: 'Ouganda', dialCode: '+256', currency: 'UGX', rate: 3800 },
  { code: 'TZ', iso3: 'TZA', name: 'Tanzanie', dialCode: '+255', currency: 'TZS', rate: 2600 },
  { code: 'NG', iso3: 'NGA', name: 'Nigéria', dialCode: '+234', currency: 'NGN', rate: 1500 }
];

// Operator detection is now handled via PawaPay API

const Credits = () => {
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('populaire');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [fullName, setFullName] = useState('Dieu Merci Kambale');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'CD'));
  const [detectedOperator, setDetectedOperator] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [depositId, setDepositId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }
  
  const dropdownRef = useRef(null);
  const pollingTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const detectTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    
    if (!phoneNumber || phoneNumber.length < 8) {
      setDetectedOperator(null);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    detectTimeoutRef.current = setTimeout(async () => {
      try {
        const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^0+/, '');
        const msisdn = selectedCountry.dialCode.replace('+', '') + cleanPhone;
        
        const { data, error } = await supabase.functions.invoke('pawapay-predict', {
          body: { msisdn }
        });

        if (data && (data.correspondent || data.provider)) {
          const cid = data.correspondent || data.provider;
          let color = '#3b82f6', bg = '#eff6ff', logo = cid.charAt(0);
          
          if (cid.includes('VODACOM') || cid.includes('AIRTEL') || cid.includes('FREE')) {
            color = '#ff0000'; bg = '#ffe5e5';
          } else if (cid.includes('ORANGE')) {
            color = '#ff6600'; bg = '#fff0e5';
          } else if (cid.includes('MTN')) {
            color = '#ffcc00'; bg = '#fffce5';
          } else if (cid.includes('AFRICELL')) {
            color = '#800080'; bg = '#f2e5f2'; logo = 'AF';
          }
          
          setDetectedOperator({
            id: cid,
            color,
            bg,
            logo
          });
        } else {
          setDetectedOperator(null);
        }
      } catch (err) {
        console.error("Detect operator error:", err);
        setDetectedOperator(null);
      } finally {
        setIsDetecting(false);
      }
    }, 800);
    
    return () => {
      if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    };
  }, [phoneNumber, selectedCountry]);

  // Polling logic when in step 4
  useEffect(() => {
    if (step === 4 && depositId) {
      setElapsedTime(0);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      pollingTimerRef.current = setInterval(async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('status')
          .eq('deposit_id', depositId)
          .single();
          
        if (data && data.status) {
          const status = data.status.toUpperCase();
          if (['COMPLETED', 'APPROVED', 'SUCCESS', 'SUCCESSFUL'].includes(status)) {
            handlePaymentSuccess();
          } else if (['FAILED', 'CANCELLED', 'REJECTED'].includes(status)) {
            handlePaymentError();
          }
        }
      }, 3000); // poll every 3 seconds

      return () => {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      };
    }
  }, [step, depositId]);

  const handlePaymentSuccess = () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setToast({ type: 'success', message: 'Paiement réussi ! Vos crédits ont été ajoutés.' });
    setStep(1);
    setPhoneNumber('');
    setTimeout(() => setToast(null), 5000);
  };

  const handlePaymentError = () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setToast({ type: 'error', message: 'Paiement échoué. Veuillez réessayer' });
    setStep(3);
    setTimeout(() => setToast(null), 5000);
  };

  const plans = {
    'decouverte': { id: 'decouverte', name: 'Découverte', notes: 4, priceUsd: 3.46 },
    'populaire': { id: 'populaire', name: 'Populaire', notes: 10, priceUsd: 5.91 },
    'premium': { id: 'premium', name: 'Premium', notes: 24, priceUsd: 17.27 }
  };

  const currentPlan = plans[selectedPlan];

  const handleNextStep1 = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleNextStep2 = () => {
    if (!paymentMethod) {
      setError('Veuillez sélectionner un mode de paiement.');
      return;
    }
    setError('');
    
    if (paymentMethod === 'mobile_money') {
      setStep(3);
    } else {
      setError("Le paiement par carte bancaire n'est pas encore disponible.");
    }
    window.scrollTo(0, 0);
  };

  const handleCheckout = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (!detectedOperator) {
      setError('Opérateur non reconnu pour ce numéro.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^0+/, '');
      const msisdn = selectedCountry.dialCode.replace('+', '') + cleanPhone;

      const { data, error: funcError } = await supabase.functions.invoke('pawapay-checkout', {
        body: {
          planId: currentPlan.id,
          notesAmount: currentPlan.notes,
          priceUsd: currentPlan.priceUsd,
          countryIso3: selectedCountry.iso3,
          msisdn: msisdn,
          correspondent: detectedOperator.id
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

      if (data && data.depositId) {
        setDepositId(data.depositId);
        setStep(4);
        window.scrollTo(0, 0);
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Impossible d'initier le paiement.");
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Erreur lors de la préparation du paiement.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatElapsedTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) || 
    c.dialCode.includes(searchCountry) ||
    c.code.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const formatLocalPrice = (usd, rate) => {
    return Math.round(usd * rate).toLocaleString('fr-FR');
  };

  return (
    <div className="notes-content relative">
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'error' ? <XCircle size={18} /> : <Check size={18} />}
          </div>
          <span className="toast-msg">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="pricing-header">
            <div className="pricing-header-left">
              <h2>Acheter des Notes</h2>
              <p>1 chanson = 2 Notes</p>
            </div>
            <div className="currency-selector">
              <span className="currency-text">US USD</span>
              <span className="currency-badge">AUTO</span>
              <ChevronDown size={14} className="text-stone-400" />
            </div>
          </div>

          <div className="pricing-cards">
            {Object.values(plans).map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.id === 'populaire' ? 'popular-card' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.id === 'populaire' && (
                  <div className="popular-ribbon">
                    <span className="text-xs">🔥</span> Populaire
                  </div>
                )}
                <div className="pricing-card-left">
                  <div className={`pricing-icon ${plan.id === 'populaire' ? 'bg-orange-100 text-orange-500' : 'bg-indigo-50 text-indigo-900'}`}>
                    <Music size={20} strokeWidth={2.5} />
                  </div>
                  <div className="pricing-info">
                    <h4 className={plan.id === 'populaire' ? 'text-orange-500' : ''}>{plan.name}</h4>
                    <span className="text-stone-500">{plan.notes} Notes</span>
                  </div>
                </div>
                <div className={`pricing-price ${plan.id === 'populaire' ? 'text-orange-500' : ''}`}>
                  ${plan.priceUsd}
                </div>
              </div>
            ))}
          </div>

          <div className="promo-section">
            <Tag size={14} className="text-stone-400 mr-2" />
            <span className="text-sm text-stone-600">J'ai un code promo</span>
            <ChevronDown size={14} className="text-stone-400 ml-1" />
          </div>

          <div className="social-proof mt-6">
            <div className="avatars-group">
              <img src="https://ui-avatars.com/api/?name=User+1&background=random" alt="Avatar" className="avatar-overlap z-40" />
              <img src="https://ui-avatars.com/api/?name=User+2&background=random" alt="Avatar" className="avatar-overlap z-30" />
              <img src="https://ui-avatars.com/api/?name=User+3&background=random" alt="Avatar" className="avatar-overlap z-20" />
              <img src="https://ui-avatars.com/api/?name=User+4&background=random" alt="Avatar" className="avatar-overlap z-10" />
            </div>
            <div className="reviews-info">
              <div className="stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f97316" className="text-orange-500" strokeWidth={0} />)}
                <span className="rating-score">4.8 / 5</span>
              </div>
              <p>Utilisé par + de 182K utilisateurs</p>
            </div>
          </div>

          <button
            className="continue-purchase-btn flex justify-center items-center mt-6"
            onClick={handleNextStep1}
          >
            Continuer <span className="ml-2 font-normal">→</span>
          </button>
        </>
      )}

      {step === 2 && (
        <div className="checkout-step">
          <button className="back-link" onClick={() => setStep(1)}>
            <ArrowLeft size={16} /> Retour
          </button>
          
          <h3 className="step-title">Choisissez votre mode de paiement</h3>
          
          <div className="payment-methods">
            <div 
              className={`payment-method-card ${paymentMethod === 'mobile_money' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('mobile_money')}
            >
              <div className="pm-icon-wrapper bg-orange-50">
                <Smartphone className="text-orange-500" size={24} />
              </div>
              <div className="pm-info">
                <h4>Mobile Money</h4>
                <p>Orange, MTN, Wave, Moov...</p>
                <div className="pm-logos">
                  <div className="pm-logo bg-black text-white">W</div>
                  <div className="pm-logo bg-yellow-400 text-blue-900">M</div>
                  <div className="pm-logo bg-blue-500 text-white">T</div>
                  <div className="pm-logo bg-orange-500 text-white">O</div>
                  <div className="pm-logo bg-red-600 text-white">A</div>
                </div>
              </div>
              {paymentMethod === 'mobile_money' && <Check className="pm-check" size={20} />}
            </div>

            <div 
              className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="pm-icon-wrapper bg-blue-50">
                <CreditCard className="text-blue-500" size={24} />
              </div>
              <div className="pm-info">
                <h4>Carte bancaire</h4>
                <p>Visa, Mastercard</p>
              </div>
              {paymentMethod === 'card' && <Check className="pm-check" size={20} />}
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="continue-purchase-btn mt-8"
            onClick={handleNextStep2}
          >
            Continuer <span className="ml-2 font-normal">→</span>
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="checkout-step">
          <button className="back-link" onClick={() => setStep(2)}>
            <ArrowLeft size={16} /> Retour
          </button>
          
          <div className="checkout-summary">
            <div className="cs-left">
              <span className="cs-label">Pack sélectionné</span>
              <h4 className="cs-title">{currentPlan.name}</h4>
              <span className="cs-notes">{currentPlan.notes} Notes</span>
            </div>
            <div className="cs-right">
              <span className="cs-price">{formatLocalPrice(currentPlan.priceUsd, selectedCountry.rate)} {selectedCountry.currency}</span>
            </div>
          </div>

          <div className="checkout-form">
            <div className="form-group">
              <label>Nom complet</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Numéro de téléphone <span className="text-red-500">*</span></label>
              <div className="phone-input-group">
                <div className="country-selector-wrapper" ref={dropdownRef}>
                  <button 
                    className="country-selector-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="cs-code">{selectedCountry.code}</span>
                    <span className="cs-dial">{selectedCountry.dialCode}</span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="country-dropdown">
                      <div className="country-search">
                        <Search size={14} className="search-icon" />
                        <input 
                          type="text" 
                          placeholder="Rechercher un pays..." 
                          value={searchCountry}
                          onChange={(e) => setSearchCountry(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="country-list-scroll">
                        {filteredCountries.map(country => (
                          <div 
                            key={country.code} 
                            className="country-option"
                            onClick={() => {
                              setSelectedCountry(country);
                              setIsDropdownOpen(false);
                              setSearchCountry('');
                            }}
                          >
                            <span className="co-code">{country.code}</span>
                            <span className="co-name">{country.name}</span>
                            <span className="co-dial">{country.dialCode}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 811889343"
                  className="phone-number-input"
                />
              </div>
            </div>

            {isDetecting ? (
              <div className="detected-operator animate-fade-in justify-center items-center">
                <Loader2 size={16} className="animate-spin text-stone-400 mr-2" />
                <span className="text-stone-500 text-sm">Vérification de l'opérateur...</span>
              </div>
            ) : detectedOperator && (
              <div className="detected-operator animate-fade-in">
                <div className="do-logo" style={{ backgroundColor: detectedOperator.bg, color: detectedOperator.color }}>
                  {detectedOperator.logo}
                </div>
                <span className="do-id">{detectedOperator.id}</span>
              </div>
            )}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="continue-purchase-btn flex justify-center items-center mt-6"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin mr-2" /> Préparation...</>
            ) : (
              <>Continuer <span className="ml-2 font-normal">→</span></>
            )}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="checkout-step waiting-screen">
          <div className="ws-logo-wrapper" style={{ backgroundColor: detectedOperator?.bg || '#fff0e5', color: detectedOperator?.color || '#ff6600' }}>
            {detectedOperator?.logo || 'O'}
          </div>
          <div className="ws-operator-id">
            {detectedOperator?.id || 'OPERATOR'}
          </div>

          <h3 className="ws-title">Confirmez sur votre téléphone</h3>
          <p className="ws-desc">
            Un message a été envoyé sur votre téléphone. Veuillez saisir votre code PIN pour confirmer le paiement.
          </p>
          <div className="ws-phone">
            <Smartphone size={16} className="text-stone-400 mr-2" />
            {selectedCountry.dialCode}{phoneNumber.replace(/\s+/g, '').replace(/^0+/, '')}
          </div>

          <div className="ws-loader-text">Vérification de votre paiement en cours...</div>
          
          <div className="ws-status">
            <Loader2 size={16} className="animate-spin mr-2 text-orange-500" /> 
            En attente de confirmation...
          </div>
          
          <div className="ws-timer">Temps écoulé: {formatElapsedTime(elapsedTime)}</div>

          <div className="ws-tips">
            <div className="ws-tips-title"><AlertCircle size={14} className="mr-1" /> Conseils :</div>
            <ul>
              <li>Vérifiez que vous avez du réseau</li>
              <li>Vérifiez votre solde mobile money</li>
              <li>Le message USSD peut prendre quelques secondes</li>
            </ul>
          </div>

          <div className="ws-cancel">
            {elapsedTime < 17 ? (
              <span>Vous pourrez annuler dans {17 - elapsedTime}s</span>
            ) : (
              <button className="ws-cancel-btn" onClick={() => setStep(3)}>Annuler la transaction</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
