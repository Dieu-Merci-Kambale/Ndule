import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Contact = () => {
  const { t, lang } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implémenter la logique de BM Services ici
    console.log("Form data:", formData);
    setStatus("success"); // Simulation
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
              <p className="text-stone-500">Nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={() => setStatus(null)} 
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-500/20"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
