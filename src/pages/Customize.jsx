import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import TShirtPreview from '../components/TShirtPreview';
import ImageUploader from '../components/ImageUploader';
import ColorPicker from '../components/ColorPicker';
import { ArrowRight, RotateCcw, ZoomIn, ZoomOut, Palette, ImagePlus, Move } from 'lucide-react';

const ZONES = [
  { id: 'front', label: 'Old', icon: '👕' },
  { id: 'back', label: 'Orqa', icon: '🔄' },
  { id: 'leftSleeve', label: 'Chap yeng', icon: '💪' },
  { id: 'rightSleeve', label: "O'ng yeng", icon: '✋' },
];

import TShirt3D from '../components/TShirt3D';

const Customize = () => {
  const navigate = useNavigate();
  const { order, setColor, setPlacementImage, setPlacementPosition, removePlacementImage } = useOrder();
  const [activeZone, setActiveZone] = useState('front');
  const fileInputRef = React.useRef(null);

  const currentPlacement = order.placements[activeZone];
  const hasAnyImage = Object.values(order.placements).some(p => p.image);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPlacementImage(activeZone, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <style>{`
        .customize-page { padding-bottom: 40px; }
        .preview-container-3d {
          background: #000;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-3xl);
          margin-bottom: 24px;
          position: relative;
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
          overflow: hidden;
          height: 450px;
        }
        .controls-overlay {
          position: absolute; right: 16px; top: 16px; display: flex; flex-direction: column; gap: 10px; z-index: 10;
        }
        .floating-btn {
          width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1); color: #fff;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px); cursor: pointer; transition: all 0.2s;
        }
        .floating-btn:active { transform: scale(0.9); }
        .hint-3d {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 600;
          pointer-events: none; text-transform: uppercase; letter-spacing: 0.1em;
        }
      `}</style>

      <div className="customize-page">
        <h1 className="customize-title" style={{textAlign: 'center', marginBottom: 24}}>
          <span className="text-gradient">3D Dizayn</span>
        </h1>

        <div className="preview-container-3d animate-fade-in-up">
          <div className="controls-overlay">
            <button className="floating-btn" onClick={() => fileInputRef.current?.click()}><ImagePlus size={20} /></button>
            {currentPlacement.image && (
              <button className="floating-btn" onClick={() => removePlacementImage(activeZone)} style={{color: '#ff4444'}}><RotateCcw size={20} /></button>
            )}
          </div>

          <TShirt3D 
            color={order.color} 
            image={currentPlacement.image} 
          />
          
          <div className="hint-3d">Aylantirish uchun bosing va suring</div>
        </div>

        <div className="customize-section animate-fade-in-up">
          <div className="section-label"><Palette size={16} /> Futbolka rangi</div>
          <ColorPicker selected={order.color} onChange={setColor} />
        </div>

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{display: 'none'}} accept="image/*" />

        <div className="continue-section">
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/preview')} disabled={!hasAnyImage}>
            {hasAnyImage ? 'Davom etish' : 'Rasm yuklang'}
            {hasAnyImage && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Customize;
