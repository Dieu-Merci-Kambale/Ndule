import React, { useState } from 'react';
import { Globe, Heart, Music, Loader2 } from 'lucide-react';
import './PublishModal.css';

const PublishModal = ({ isOpen, onClose, onConfirm, track }) => {
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
          <h2>Partager au monde</h2>
          <p className="publish-description">
            Ta chanson sera visible par toute la communauté Ndule. Les autres utilisateurs pourront l'écouter et l'aimer.
          </p>
        </div>

        <div className="publish-benefits">
          <div className="benefit-item">
            <div className="benefit-icon-wrapper blue-light">
              <Globe size={18} color="#3b82f6" />
            </div>
            <span>Plus de visibilité</span>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper blue-light">
              <Heart size={18} color="#3b82f6" />
            </div>
            <span>Reçois des likes</span>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon-wrapper blue-light">
              <Music size={18} color="#3b82f6" />
            </div>
            <span>Inspire d'autres créateurs</span>
          </div>
        </div>

        <div className="publish-modal-actions">
          <button className="btn-later" onClick={onClose} disabled={isPublishing}>
            Plus tard
          </button>
          <button className="btn-publish" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Globe size={18} />
            )}
            <span>Publier</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublishModal;
