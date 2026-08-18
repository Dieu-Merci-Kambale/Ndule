import React from 'react';
import { Quote } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import './TestimonialSection.css';

const TestimonialSection = () => {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial-glow-left"></div>
      <div className="testimonial-glow-right"></div>
      
      <div className="testimonial-container">
        <div className="testimonial-header">
          <h2 className="testimonial-title">
            Ils ont marqué le <strong>coup</strong>
          </h2>
          <p className="testimonial-subtitle">
            Découvrez comment ils ont sublimé leurs événements avec une chanson unique.
          </p>
        </div>

        <div className="testimonial-grid">
          {t.testimonials.items.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <Quote className="testimonial-quote-icon" size={32} />
              
              <div className="testimonial-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                ))}
              </div>
              
              <p className="testimonial-text">
                "{testimonial.quote}"
              </p>
              
              <div className="testimonial-author-row">
                <div className="testimonial-author-info">
                  <h4 className="testimonial-author-name">{testimonial.author}</h4>
                  <span className="testimonial-tag">{testimonial.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
