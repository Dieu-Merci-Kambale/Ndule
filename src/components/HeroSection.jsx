import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import './HeroSection.css';

const HeroSection = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  
  const phrases = t.hero.phrases || [
    "Pour un anniversaire",
    "pour dire je t'aime",
    "inoubliable",
    "en 3 minutes"
  ];
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2500); // Change phrase every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-noise"></div>
      <div className="hero-glow-left"></div>
      <div className="hero-glow-right"></div>

      <div className="badge badge-1">
        <div className="badge-dot"></div>
        <span>{t.hero.badge1}</span>
      </div>
      
      <div className="badge badge-2">
        <div className="badge-dot"></div>
        <span>{t.hero.badge2}</span>
      </div>

      <div className="badge badge-3">
        <span>{t.hero.badge3}</span>
      </div>

      <div className="hero-content">
        
        <div className="emotion-pill">
          <div className="badge-dot" style={{ animation: 'pulse-slow 2s infinite' }}></div>
          <span className="emotion-text">{t.hero.pill}</span>
        </div>
        
        <p className="hero-subtitle">
          {t.hero.subtitle}
        </p>
        
        <div className="hero-title-container">
          <span className="hero-title">
            {t.hero.titleLine1}
          </span>
          <span className="hero-title-en">
            {phrases.map((phrase, index) => (
              <span key={index} className={`hero-title-slide ${currentPhrase === index ? 'active' : ''}`}>
                {phrase}
              </span>
            ))}
          </span>
        </div>
        
        <p className="hero-paragraph">
          {t.hero.description}
        </p>
        
        <button className="cta-button" onClick={() => navigate(`/${lang || 'fr'}/dashboard`)}>
          {t.hero.cta}
          <ArrowRight size={20} />
        </button>

        <div className="social-proof">
          <div className="avatars">
            <div className="avatar"><img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=faces" alt="User" /></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces" alt="User" /></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=faces" alt="User" /></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop&crop=faces" alt="User" /></div>
          </div>
          <div className="stars-text">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              ))}
            </div>
            <p className="proof-text">
              {t.hero.socialProof} <strong>140 182</strong> {t.hero.users}
            </p>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-content">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {(t.hero.ticker || []).map((item, idx) => (
                <span key={idx} className="ticker-item">{item} <span className="ticker-star">✦</span></span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
