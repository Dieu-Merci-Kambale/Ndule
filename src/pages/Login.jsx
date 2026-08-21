import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Loader2 } from 'lucide-react';
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
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <Music size={28} className="text-white" />
          </div>
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
      </div>
    </div>
  );
};

export default Login;
