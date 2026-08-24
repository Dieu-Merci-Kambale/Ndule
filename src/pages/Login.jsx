import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Loader2, Play, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import './Login.css';

const Login = () => {
  const { t, lang } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOAuthLogin = async (provider) => {
    if (provider === 'apple') {
      setError("Désolé ! Cette fonctionnalité est en cours de développement. On va l'intégrer très bientôt lors d'une mise à jour.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/${lang}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message || t.pages.login.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split">
        {/* Left Side - Branding / Visuals */}
        <div className="login-visuals">
          <div className="visuals-glow"></div>
          <div className="visuals-content">
            <div className="brand-logo">
              <Music className="brand-icon" size={28} />
              <span>Ndules</span>
            </div>
            
            <div>
              <h1 className="visuals-title">
                Votre musique,<br />
                votre histoire.
              </h1>
              <p className="visuals-subtitle">
                Créez une chanson unique en quelques secondes grâce à notre IA. Parfait pour les anniversaires, mariages ou déclarations.
              </p>
              
              <div className="visuals-features">
                <div className="feature-item">
                  <div className="feature-icon"><Sparkles size={18} /></div>
                  <span>IA ultra-rapide</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><Play size={18} /></div>
                  <span>Qualité studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="login-form-inner">
            <div className="mobile-logo">
              <Music className="brand-icon" size={28} />
              <span>Ndules</span>
            </div>
            
            <div className="login-header">
              <h2>{t.pages.login.title}</h2>
              <p>{t.pages.login.subtitle}</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="oauth-buttons">
              <button 
                className="oauth-btn google-btn" 
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="oauth-icon" />
                    {t.pages.login.google}
                  </>
                )}
              </button>
              
              <button 
                className="oauth-btn apple-btn" 
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="oauth-icon" />
                    Continuer avec Apple
                  </>
                )}
              </button>
            </div>
            
            <div className="login-footer">
              En continuant, vous acceptez nos <a href="#">Conditions d'utilisation</a> et notre <a href="#">Politique de confidentialité</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
