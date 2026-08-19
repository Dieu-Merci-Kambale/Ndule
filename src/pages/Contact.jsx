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
    <div className="contact-page-wrapper bg-stone-50 min-h-[80vh] pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 text-stone-900">Contactez-nous</h1>
          <p className="text-stone-500 text-base md:text-lg px-2">Une question ? Une demande spécifique ? N'hésitez pas à nous écrire.</p>
        </div>
        
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm mx-2 sm:mx-0">
          {status === 'success' ? (
            <div className="text-center py-8 md:py-10">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl">✓</div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Message envoyé !</h2>
              <p className="text-sm md:text-base text-stone-500 px-4">Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={() => {
                  setStatus(null);
                  setFormData({ name: '', email: '', phone: '', message: '' });
                }} 
                className="mt-6 md:mt-8 px-6 py-2.5 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {status === 'error' && (
                <div className="p-3 md:p-4 text-sm md:text-base bg-red-50 text-red-600 rounded-xl mb-4 border border-red-100">
                  Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.
                </div>
              )}
              
              <div>
                <label className="block text-sm md:text-base font-medium text-stone-700 mb-1.5 md:mb-2">Votre Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 md:py-3.5 text-sm md:text-base rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-sm md:text-base font-medium text-stone-700 mb-1.5 md:mb-2">Votre E-mail</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 md:py-3.5 text-sm md:text-base rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="jean@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-stone-700 mb-1.5 md:mb-2">Votre Téléphone (optionnel)</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 md:py-3.5 text-sm md:text-base rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="+243..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm md:text-base font-medium text-stone-700 mb-1.5 md:mb-2">Votre Message</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full px-4 py-3 md:py-3.5 text-sm md:text-base rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white py-3.5 md:py-4 mt-2 rounded-xl text-sm md:text-base font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
