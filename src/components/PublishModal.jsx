import React, { useState } from 'react';
import { X, Globe, Heart, Share2, Loader2, Music } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import './PublishModal.css';

const PublishModal = ({ isOpen, onClose, onConfirm, track }) => {
  const { t } = useTranslation();
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen || !track) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    await onConfirm(track);
    setIsPublishing(false);
    onClose();
  };

  return (
    <div className="publish-modal-overlay" onClick={onClose}>
      <div className="publish-modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="publish-modal-header">
          <div className="globe-icon-container">
            <Globe size={36} color="white" strokeWidth={1.5} />
          </div>
          <h2>{t.pages.modals.publishTitle}</h2>
          <p className="publish-description">
            "{track.title}" {t.pages.modals.publishDescription}
          </p>
        </div>

        <div className="publish-benefits">
          <div className="benefit-item">
            <div className="benefit-icon-wrapper blue-light">
              <Globe size={18} color="#3b82f6" />
            </div>
            <span>{t.pages.modals.visibility}</span>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper red-light">
              <Heart size={18} color="#ef4444" />
            </div>
            <span>{t.pages.modals.getLikes}</span>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper blue-light">
              <Music size={18} color="#3b82f6" />
            </div>
            <span>{t.pages.modals.inspire}</span>
          </div>
        </div>

        <div className="publish-modal-actions">
          <button className="btn-later" onClick={onClose} disabled={isPublishing}>
            {t.pages.modals.later}
          </button>
          <button className="btn-publish" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Globe size={18} />
            )}
            <span>{t.pages.modals.publishBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;
