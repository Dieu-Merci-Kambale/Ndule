import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Pages.css';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="page-section">
      <div className="page-header">
        <h1 className="page-title">{t.privacyPage.title}</h1>
        <p className="page-last-updated">
          {t.privacyPage.lastUpdated} {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div className="page-container">
        <div className="page-content">
          <h2>{t.privacyPage.section1Title}</h2>
          <p>{t.privacyPage.section1Text}</p>

          <h2>{t.privacyPage.section2Title}</h2>
          <p>{t.privacyPage.section2Text}</p>

          <h2>{t.privacyPage.section3Title}</h2>
          <p>{t.privacyPage.section3Text}</p>

          <h2>{t.privacyPage.section4Title}</h2>
          <p>{t.privacyPage.section4Text}</p>
          
          <div className="page-contact">
            Pour toute question, veuillez nous contacter à : <a href="mailto:contact@ndules.com">contact@ndules.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
