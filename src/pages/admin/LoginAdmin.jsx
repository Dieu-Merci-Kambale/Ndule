import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, ShieldCheck } from 'lucide-react';
import './Admin.css';

const LoginAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard_admin`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <ShieldCheck size={48} className="admin-shield-icon" />
          <h2>Accès Restreint</h2>
          <p>Panel d'Administration Ndule</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <button 
          className="admin-oauth-btn" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="oauth-icon" />
              Connexion Sécurisée
            </>
          )}
        </button>
        
        <p className="admin-login-warning">
          L'accès à cette zone est strictement réservé au personnel autorisé. Toute tentative d'accès non autorisé est enregistrée.
        </p>
      </div>
    </div>
  );
};

export default LoginAdmin;
