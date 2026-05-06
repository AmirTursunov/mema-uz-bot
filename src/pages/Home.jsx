import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, formatPrice } from '../context/OrderContext';
import ColorPicker from '../components/ColorPicker';
import SizeSelector from '../components/SizeSelector';
import TShirtPreview from '../components/TShirtPreview';
import { Palette, ArrowRight, ImagePlus, RotateCcw } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { order, setColor, setSize, setPlacementImage, removePlacementImage, setPlacementPosition } = useOrder();
  const fileInputRef = React.useRef(null);
  
  const hasAnyImage = Object.values(order.placements).some(p => p.image);
  const currentPlacement = order.placements['front'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPlacementImage('front', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <style>{`
        .home-designer { padding-bottom: 60px; }
        .hero-title {
          font-size: 26px; font-weight: 800; text-align: center; margin: 10px 0 15px;
          font-family: var(--font-display);
        }
        .preview-wrapper {
          background: var(--bg-card);
          border-radius: var(--radius-3xl);
          padding: 30px 20px; margin-bottom: 24px; position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          border: 1px solid var(--border-subtle);
          display: flex; flex-direction: column; align-items: center;
          min-height: 380px;
        }
        .controls-overlay {
          position: absolute; right: 16px; top: 16px; display: flex; flex-direction: column; gap: 10px; z-index: 10;
        }
        .designer-btn {
          width: 44px; height: 44px; border-radius: 12px; background: var(--bg-glass);
          border: 1px solid var(--border-light); color: var(--text-primary);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px); cursor: pointer; transition: all 0.2s;
        }
        .designer-btn:active { transform: scale(0.9); }
        .section-box {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl); padding: 18px; margin-bottom: 16px;
        }
        .label-with-icon {
          display: flex; align-items: center; gap: 8px; font-size: 14px;
          font-weight: 700; color: var(--text-secondary); margin-bottom: 14px;
        }
      `}</style>

      <div className="home-designer animate-fade-in">
        <h1 className="hero-title">
          <span className="text-gradient">O'z dizayningni yarat</span> ✨
        </h1>

        <div className="preview-wrapper">
          <div className="controls-overlay">
            <button className="designer-btn" onClick={() => fileInputRef.current?.click()}><ImagePlus size={20} /></button>
            {hasAnyImage && (
              <button className="designer-btn" style={{color: '#ff4444'}} onClick={() => removePlacementImage('front')}><RotateCcw size={20} /></button>
            )}
          </div>
          
          <div style={{width: '100%', maxWidth: '300px'}}>
            <TShirtPreview 
              color={order.color} 
              image={currentPlacement.image} 
              position={currentPlacement.position}
              onPositionChange={(pos) => setPlacementPosition('front', pos)}
              interactive={true}
              onImageClick={() => fileInputRef.current?.click()}
            />
          </div>
        </div>

        <div className="section-box">
          <div className="label-with-icon"><Palette size={18} color="var(--accent-primary)" /> Futbolka rangi</div>
          <ColorPicker selected={order.color} onChange={setColor} />
        </div>

        <div className="section-box">
          <div className="label-with-icon">📏 Razmer tanlang</div>
          <SizeSelector selected={order.size} onChange={setSize} />
        </div>

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{display: 'none'}} accept="image/*" />

        <button 
          className="btn btn-primary btn-block btn-lg"
          onClick={() => navigate('/preview')}
          disabled={!hasAnyImage}
        >
          {hasAnyImage ? 'Buyurtma berish' : 'Rasm yuklang'}
          {hasAnyImage && <ArrowRight size={18} />}
        </button>
      </div>
    </>
  );
};

export default Home;
