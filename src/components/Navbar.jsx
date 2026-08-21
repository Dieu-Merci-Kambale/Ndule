import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <span style={{fontSize: '28px', marginRight: '4px'}}>🎵</span>
          <span style={{fontWeight: 800, fontSize: '1.5rem', color: '#2563eb'}}>Ndule</span>
        </a>

        {/* Center Links in Pill (Desktop) */}
        <div className="navbar-links">
          <a href={`/${lang}#playlist`}>{t.navbar.examples}</a>
          <a href={`/${lang}#testimonials`}>{t.navbar.reviews}</a>
          <a href={`/${lang}#faq`}>{t.navbar.faq}</a>
          <a href={`/${lang}/contact`}>{t.navbar.contact || 'Contact'}</a>
        </div>

        {/* Right Side (Desktop) */}
        <div className="navbar-right">
          <button 
            className="navbar-lang"
            onClick={() => {
              const newLang = lang === 'fr' ? 'en' : 'fr';
              if (location.pathname === '/' || location.pathname === '') {
                navigate(`/${newLang}`);
              } else {
                navigate(location.pathname.replace(/^\/(fr|en)/, `/${newLang}`));
              }
            }}
          >
            <span className="navbar-lang-flag">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
            <span className="navbar-lang-text">{lang.toUpperCase()}</span>
          </button>
          
          <a href={`/${lang}/login`} className="navbar-login">{t.navbar.login}</a>
          
          <a href={`/${lang}/login`} className="navbar-btn">
            {t.navbar.start}
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            <a href={`/${lang}#playlist`} onClick={() => setIsMobileMenuOpen(false)}>{t.navbar.examples}</a>
            <a href={`/${lang}#testimonials`} onClick={() => setIsMobileMenuOpen(false)}>{t.navbar.reviews}</a>
            <a href={`/${lang}#faq`} onClick={() => setIsMobileMenuOpen(false)}>{t.navbar.faq}</a>
            <a href={`/${lang}/contact`} onClick={() => setIsMobileMenuOpen(false)} className="navbar-mobile-link-btn">{t.navbar.contact || 'Contact'}</a>
            
            <div className="navbar-mobile-divider"></div>
            
            <button 
              className="navbar-lang" 
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                const newLang = lang === 'fr' ? 'en' : 'fr';
                if (location.pathname === '/' || location.pathname === '') {
                  navigate(`/${newLang}`);
                } else {
                  navigate(location.pathname.replace(/^\/(fr|en)/, `/${newLang}`));
                }
              }}
            >
              <span className="navbar-lang-flag">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
              <span className="navbar-lang-text">{lang.toUpperCase()}</span>
            </button>
            
            <a href={`/${lang}/login`} className="navbar-login" style={{ fontSize: '18px', padding: '12px 0' }}>{t.navbar.login}</a>
            
            <a href={`/${lang}/login`} className="navbar-btn" style={{ justifyContent: 'center' }}>
              {t.navbar.start}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
