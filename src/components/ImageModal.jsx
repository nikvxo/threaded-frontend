// src/components/ImageModal.jsx
import { useEffect } from 'react';
import './ImageModal.css';

function ImageModal({ imageUrl, alt, onClose }) {
  useEffect(() => {
    if (!imageUrl) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="image-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full size outfit image"
    >
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={alt} />
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export default ImageModal;
