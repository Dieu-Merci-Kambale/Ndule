import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import './Footer.css';

const Footer = () => {
  const { t, lang } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        
        <Link to={`/${lang}`} className="footer-logo">
          <span style={{fontSize: '24px', marginRight: '4px'}}>🎵</span>
          <span style={{fontWeight: 800, fontSize: '1.25rem', color: '#2563eb'}}>Ndules</span>
        </Link>
        
        <div className="footer-links">
          <Link to={`/${lang}/privacy`} className="footer-link">{t.footer.privacy}</Link>
          <Link to={`/${lang}/terms`} className="footer-link">{t.footer.terms}</Link>
          <a href={`mailto:${t.footer.contact}`} className="footer-link">{t.footer.contact}</a>
        </div>

        <p className="footer-copyright">
          © 2025 {t.footer.copyright}
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;
