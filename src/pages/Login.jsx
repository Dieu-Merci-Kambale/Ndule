import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/fr/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la connexion.");
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
          <h2>Bienvenue sur Ndule</h2>
          <p>Le premier générateur de musique IA au monde</p>
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
                Continuer avec Google
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
