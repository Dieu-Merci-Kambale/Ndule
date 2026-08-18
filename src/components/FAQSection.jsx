import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import './FAQSection.css';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button 
        className="faq-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="faq-question">{question}</span>
        <Plus className={`faq-icon ${isOpen ? 'open' : ''}`} size={24} />
      </button>
      <div className={`faq-answer-wrap ${isOpen ? 'open' : 'closed'}`}>
        <p className="faq-answer">{answer}</p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const { t } = useTranslation();

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="faq-title-wrap">
          <h2 className="faq-title">{t.faq.title}</h2>
        </div>
        
        <div className="faq-list">
          {t.faq.items.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
