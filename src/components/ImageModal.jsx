// src/components/ImageModal.jsx
import './ImageModal.css';

function ImageModal({ imageUrl, alt, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={alt} />
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

export default ImageModal;
