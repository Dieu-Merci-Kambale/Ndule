import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Contact = () => {
  const { t, lang } = useTranslation();
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
          subject: 'Nouveau message depuis Ndule',
          from_name: 'Ndule Contact',
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
    <div className="contact-page-wrapper" style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#fafaf9' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: '#1c1917' }}>Contactez-nous</h1>
          <p className="text-stone-500 text-lg">Une question ? Une demande spécifique ? N'hésitez pas à nous écrire.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <h2 className="text-2xl font-bold mb-2">Message envoyé !</h2>
              <p className="text-stone-500">Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={() => {
                  setStatus(null);
                  setFormData({ name: '', email: '', phone: '', message: '' });
                }} 
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 border border-red-100">
                  Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Votre Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Votre E-mail</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="jean@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Votre Téléphone (optionnel)</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+243..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Votre Message</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
