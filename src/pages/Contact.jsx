import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: '92544cee-4713-4afe-91d9-f628581f1b1b',
          subject: 'Nouveau message depuis Ndules',
          from_name: 'Ndules Contact',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setStatus('success');
      } else {
        console.error(result);
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <div className="contact-header">
          <h1>Contactez-nous</h1>
          <p>
            Une question, une suggestion ou besoin d'assistance ? Remplissez ce formulaire et nous vous répondrons très vite.
          </p>
        </div>

        {status === 'success' ? (
          <div className="contact-success">
            <div className="contact-success-icon">✓</div>
            <h2>Message envoyé !</h2>
            <p>
              Nous avons bien reçu votre message. Nous reviendrons vers vous dans les plus brefs délais.
            </p>
            <button 
              onClick={() => {
                setStatus(null);
                setFormData({ name: '', email: '', phone: '', message: '' });
              }} 
              className="contact-btn"
              style={{ width: 'auto', padding: '0.875rem 2rem' }}
            >
              Envoyer un nouveau message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            {status === 'error' && (
              <div className="contact-error">
                <span>⚠️</span> Une erreur est survenue lors de l'envoi. Veuillez réessayer.
              </div>
            )}
            
            <div className="contact-form-group">
              <label className="contact-label">Nom complet</label>
              <input 
                type="text" 
                required
                className="contact-input"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="contact-form-row">
              <div className="contact-form-group">
                <label className="contact-label">Adresse E-mail</label>
                <input 
                  type="email" 
                  required
                  className="contact-input"
                  placeholder="jean@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="contact-form-group">
                <label className="contact-label">Téléphone (Optionnel)</label>
                <input 
                  type="tel" 
                  className="contact-input"
                  placeholder="+243..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="contact-form-group">
              <label className="contact-label">Votre Message</label>
              <textarea 
                required
                rows="5"
                className="contact-textarea"
                placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="contact-btn"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Envoi en cours...
                </>
              ) : 'Envoyer le message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
