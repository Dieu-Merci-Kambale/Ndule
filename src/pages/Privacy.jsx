import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './Pages.css';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="page-section">
      <div className="page-container">
        <h1 className="page-title">{t.privacyPage.title}</h1>
        
        <div className="page-content">
          <p className="page-last-updated">
            {t.privacyPage.lastUpdated} {new Date().toLocaleDateString()}
          </p>

          <h2>{t.privacyPage.section1Title}</h2>
          <p>{t.privacyPage.section1Text}</p>

          <h2>{t.privacyPage.section2Title}</h2>
          <p>{t.privacyPage.section2Text}</p>

          <h2>{t.privacyPage.section3Title}</h2>
          <p>{t.privacyPage.section3Text}</p>

          <h2>{t.privacyPage.section4Title}</h2>
          <p>{t.privacyPage.section4Text} <strong>contact@wazzap.ai</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
