import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Pages.css';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="page-section">
      <div className="page-container">
        <h1 className="page-title">{t.termsPage.title}</h1>
        
        <div className="page-content">
          <p className="page-last-updated">
            {t.termsPage.lastUpdated} {new Date().toLocaleDateString()}
          </p>

          <h2>{t.termsPage.section1Title}</h2>
          <p>{t.termsPage.section1Text}</p>

          <h2>{t.termsPage.section2Title}</h2>
          <p>{t.termsPage.section2Text}</p>

          <h2>{t.termsPage.section3Title}</h2>
          <p>{t.termsPage.section3Text}</p>

          <h2>{t.termsPage.section4Title}</h2>
          <p>{t.termsPage.section4Text}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
