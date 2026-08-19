import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ContactModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

  const resetAndClose = () => {
    setStatus(null);
    setFormData({ name: '', email: '', phone: '', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-100">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {t.navbar?.contact || 'Contactez-nous'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          {status === 'success' ? (
            <div className="text-center py-6 sm:py-10">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
              <p className="text-sm text-stone-500 mb-6 px-4">Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={resetAndClose} 
                className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <p className="text-sm text-stone-500 mb-2">Une question ? N'hésitez pas à nous écrire.</p>
              
              {status === 'error' && (
                <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl mb-4 border border-red-100">
                  Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Votre Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-stone-50 focus:bg-white"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Votre E-mail</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-stone-50 focus:bg-white"
                    placeholder="jean@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone (optionnel)</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-stone-50 focus:bg-white"
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
                  rows="4"
                  className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none bg-stone-50 focus:bg-white"
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white py-3 sm:py-3.5 mt-2 rounded-xl text-sm sm:text-base font-bold hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default ContactModal;
