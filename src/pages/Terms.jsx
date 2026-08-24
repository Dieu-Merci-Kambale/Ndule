import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Pages.css';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="page-section">
      <div className="page-header">
        <h1 className="page-title">{t.termsPage.title}</h1>
        <p className="page-last-updated">
          {t.termsPage.lastUpdated} {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="page-container">
        <div className="page-content">
          <h2>{t.termsPage.section1Title}</h2>
          <p>{t.termsPage.section1Text}</p>

          <h2>{t.termsPage.section2Title}</h2>
          <p>{t.termsPage.section2Text}</p>

          <h2>{t.termsPage.section3Title}</h2>
          <p>{t.termsPage.section3Text}</p>

          <h2>{t.termsPage.section4Title}</h2>
          <p>{t.termsPage.section4Text}</p>

          <div className="page-contact">
            Pour toute question, veuillez nous contacter à : <a href="mailto:contact@ndules.com">contact@ndules.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
