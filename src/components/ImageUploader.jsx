import React, { useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';

const ImageUploader = ({ image, onImageChange, onRemove }) => {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan oshmasligi kerak!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <style>{`
        .image-uploader {
          position: relative;
        }
        .upload-zone {
          border: 2px dashed var(--border-light);
          border-radius: var(--radius-xl);
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
          background: var(--bg-glass);
        }
        .upload-zone:hover {
          border-color: var(--accent-primary);
          background: rgba(99,102,241,0.05);
        }
        .upload-zone:active {
          transform: scale(0.98);
        }
        .upload-icon-wrap {
          width: 56px;
          height: 56px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: rgba(99,102,241,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }
        .upload-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .upload-hint {
          font-size: 12px;
          color: var(--text-muted);
        }
        .upload-preview {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          background: var(--bg-glass);
        }
        .upload-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          display: block;
          padding: 12px;
        }
        .upload-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239,68,68,0.9);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--duration-fast);
          backdrop-filter: blur(8px);
        }
        .upload-remove:hover {
          background: rgba(239,68,68,1);
          transform: scale(1.1);
        }
        .upload-change-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: var(--bg-glass-strong);
          border: none;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .upload-change-btn:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
        }
      `}</style>
      <div className="image-uploader">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {!image ? (
          <div
            className="upload-zone"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon-wrap">
              <Upload size={24} />
            </div>
            <div className="upload-text">Rasm yuklang</div>
            <div className="upload-hint">PNG, JPG • max 5MB</div>
          </div>
        ) : (
          <div className="upload-preview">
            <img src={image} alt="Yuklangan rasm" />
            <button className="upload-remove" onClick={onRemove}>
              <X size={16} />
            </button>
            <button
              className="upload-change-btn"
              onClick={() => inputRef.current?.click()}
            >
              <Image size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Boshqa rasm tanlash
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUploader;
