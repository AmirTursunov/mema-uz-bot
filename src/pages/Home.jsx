import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, formatPrice } from '../context/OrderContext';
import ColorPicker from '../components/ColorPicker';
import SizeSelector from '../components/SizeSelector';
import TShirt3D from '../components/TShirt3D';
import { Palette, ArrowRight, ImagePlus, RotateCcw } from 'lucide-react';

const ZONE_TABS = [
  { id: 'front', label: 'Old' },
  { id: 'back', label: 'Orqa' },
];

const Home = () => {
  const navigate = useNavigate();
  const {
    order,
    setColor,
    setSize,
    setPlacementImage,
    removePlacementImage,
  } = useOrder();

  const [activeZone, setActiveZone] = React.useState('front');
  const fileInputRef = React.useRef(null);

  const hasAnyImage = Object.values(order.placements).some((p) => p.image);
  const frontImage = order.placements['front']?.image || null;
  const backImage = order.placements['back']?.image || null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPlacementImage(activeZone, event.target.result);
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  return (
    <>
      <style>{`
        .home-designer { padding-bottom: 60px; }
        .hero-title {
          font-size: 24px; font-weight: 800; text-align: center;
          margin: 10px 0 16px; font-family: var(--font-display);
        }
        .preview-wrapper {
          background: #0a0a12;
          border-radius: 24px;
          margin-bottom: 20px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border: 1px solid var(--border-subtle);
          height: 420px;
          overflow: hidden;
        }
        .zone-tabs {
          display: flex; gap: 0; margin-bottom: 16px;
          background: var(--bg-glass-strong);
          border-radius: 14px; border: 1px solid var(--border-subtle);
          padding: 4px; overflow: hidden;
        }
        .zone-tab {
          flex: 1; padding: 10px; border: none; border-radius: 10px;
          background: transparent; color: var(--text-muted);
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all .2s; font-family: var(--font-display);
        }
        .zone-tab.active {
          background: var(--gradient-primary); color: #fff;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }
        .preview-actions {
          position: absolute; top: 14px; right: 14px;
          display: flex; flex-direction: column; gap: 8px; z-index: 10;
        }
        .fab {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          backdrop-filter: blur(10px); transition: all .2s;
        }
        .fab:active { transform: scale(.9); }
        .fab.danger { color: #f87171; }
        .section-box {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl); padding: 18px; margin-bottom: 14px;
        }
        .label-icon {
          display: flex; align-items: center; gap: 8px; font-size: 13px;
          font-weight: 700; color: var(--text-secondary); margin-bottom: 14px;
        }
        .zone-indicator {
          position: absolute; top: 14px; left: 14px; z-index: 10;
          background: rgba(99,102,241,0.85); backdrop-filter: blur(8px);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px; letter-spacing: .04em;
        }
      `}</style>

      <div className="home-designer animate-fade-in">
        <h1 className="hero-title">
          <span className="text-gradient">O'z dizayningni yarat</span> ✨
        </h1>

        {/* Zone selector */}
        <div className="zone-tabs">
          {ZONE_TABS.map((z) => (
            <button
              key={z.id}
              className={`zone-tab ${activeZone === z.id ? 'active' : ''}`}
              onClick={() => setActiveZone(z.id)}
            >
              {z.label} tomoni
              {order.placements[z.id]?.image ? ' ✓' : ''}
            </button>
          ))}
        </div>

        {/* 3D Preview */}
        <div className="preview-wrapper">
          <div className="zone-indicator">
            {activeZone === 'front' ? 'Old' : 'Orqa'} tomoni
          </div>

          <div className="preview-actions">
            <button
              className="fab"
              onClick={() => fileInputRef.current?.click()}
              title="Rasm yuklash"
            >
              <ImagePlus size={18} />
            </button>
            {order.placements[activeZone]?.image && (
              <button
                className="fab danger"
                onClick={() => removePlacementImage(activeZone)}
                title="Rasmni o'chirish"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>

          <TShirt3D
            color={order.color}
            frontImage={frontImage}
            backImage={backImage}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Color */}
        <div className="section-box">
          <div className="label-icon">
            <Palette size={16} color="var(--accent-primary)" />
            Futbolka rangi
          </div>
          <ColorPicker selected={order.color} onChange={setColor} />
        </div>

        {/* Size */}
        <div className="section-box">
          <div className="label-icon">📏 Razmer tanlang</div>
          <SizeSelector selected={order.size} onChange={setSize} />
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={() => navigate('/preview')}
          disabled={!hasAnyImage}
        >
          {hasAnyImage ? 'Buyurtma berish' : 'Avval rasm yuklang'}
          {hasAnyImage && <ArrowRight size={18} />}
        </button>
      </div>
    </>
  );
};

export default Home;