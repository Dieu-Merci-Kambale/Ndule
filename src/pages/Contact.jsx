import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Mail, User, MessageSquare, Phone, Send, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-10 sm:px-12 text-center text-white relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500 opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-blue-700 opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Contactez-nous</h1>
            <p className="text-blue-100 text-sm sm:text-base font-medium max-w-md mx-auto">
              Une question, une suggestion ou besoin d'assistance ? Remplissez ce formulaire et notre équipe vous répondra très vite.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 sm:p-12">
          {status === 'success' ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-3">Message envoyé avec succès !</h2>
              <p className="text-stone-500 mb-8 max-w-sm mx-auto">
                Nous avons bien reçu votre message. Nous reviendrons vers vous dans les plus brefs délais.
              </p>
              <button 
                onClick={() => {
                  setStatus(null);
                  setFormData({ name: '', email: '', phone: '', message: '' });
                }} 
                className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
              >
                Envoyer un nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-2xl mb-6 border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5">⚠️</div>
                  <div>Une erreur est survenue lors de l'envoi. Vérifiez votre connexion et réessayez.</div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 ml-1">Nom complet</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      required
                      className="block w-full pl-11 pr-4 py-3.5 sm:text-sm bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 ml-1">Adresse E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      required
                      className="block w-full pl-11 pr-4 py-3.5 sm:text-sm bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="jean@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 ml-1 flex justify-between">
                  <span>Téléphone</span>
                  <span className="font-normal text-stone-400 text-xs mt-0.5">Optionnel</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    className="block w-full pl-11 pr-4 py-3.5 sm:text-sm bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="+243..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 ml-1">Votre Message</label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none text-stone-400">
                    <MessageSquare size={18} />
                  </div>
                  <textarea 
                    required
                    rows="5"
                    className="block w-full pl-11 pr-4 py-3.5 sm:text-sm bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                    placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full flex justify-center items-center gap-2 py-4 px-8 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer le message</span>
                      <Send size={18} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
