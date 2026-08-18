import React from 'react';
import { X, Download } from 'lucide-react';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose, videoUrl, trackTitle }) => {
  if (!isOpen || !videoUrl) return null;

  const handleDownload = () => {
    // Basic download trigger
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${trackTitle || 'Ndule_Video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="video-modal-overlay">
      <div className="video-modal-container">
        <div className="video-modal-header">
          <h3>{trackTitle ? `Clip: ${trackTitle}` : 'Clip Vidéo'}</h3>
          <div className="video-modal-actions">
            <button className="video-action-btn" onClick={handleDownload} title="Télécharger">
              <Download size={20} />
            </button>
            <button className="video-action-btn close-btn" onClick={onClose} title="Fermer">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="video-modal-body">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="ndule-video-player"
            playsInline
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
