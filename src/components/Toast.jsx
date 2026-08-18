import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300); // Attend la fin de l'animation CSS
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`premium-toast-container ${isClosing ? 'toast-exit' : 'toast-enter'}`}>
      <div className="premium-toast">
        <div className={`toast-icon-wrapper ${type}`}>
          {type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
        </div>
        <div className="toast-content">
          <p className="toast-message">{message}</p>
        </div>
        <button className="toast-close-btn" onClick={handleManualClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
