import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, formatPrice } from '../context/OrderContext';
import ColorPicker from '../components/ColorPicker';
import SizeSelector from '../components/SizeSelector';
import TShirt3D from '../components/TShirt3D';
import { Palette, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { order, setColor, setSize, setPlacementImage, removePlacementImage } = useOrder();
  const [activeZone, setActiveZone] = useState('front');
  const fileInputRef = useRef(null);

  const frontImage = order.placements['front']?.image || null;
  const backImage = order.placements['back']?.image || null;
  const hasAnyImage = !!(frontImage || backImage);
  const currentHasImage = !!order.placements[activeZone]?.image;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Rasm 8MB dan kichik bo\'lsin!'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPlacementImage(activeZone, ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <style>{`
        .home-page { padding-bottom: 70px; }
        .hero-title {
          font-size: 23px; font-weight: 800; text-align: center;
          margin: 8px 0 18px; font-family: var(--font-display);
        }
        .zone-tabs {
          display: flex; gap: 6px; margin-bottom: 14px;
          background: rgba(255,255,255,0.05);
          border-radius: 14px; border: 1px solid var(--border-subtle);
          padding: 4px;
        }
        .zone-tab {
          flex: 1; padding: 10px 8px; border: none; border-radius: 10px;
          background: transparent; color: var(--text-muted);
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all .18s; font-family: var(--font-display); position: relative;
        }
        .zone-tab.active {
          background: linear-gradient(135deg,#6366f1,#a855f7);
          color: #fff; box-shadow: 0 2px 10px rgba(99,102,241,.35);
        }
        .zone-tab .dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: #10b981;
          margin-left: 5px; vertical-align: middle;
        }
        .preview-box {
          position: relative; margin-bottom: 18px;
          border-radius: 24px; overflow: hidden;
          border: 1px solid var(--border-subtle);
          box-shadow: 0 24px 60px rgba(0,0,0,0.55);
        }
        .preview-actions {
          position: absolute; top: 12px; right: 12px;
          display: flex; flex-direction: column; gap: 8px; z-index: 20;
        }
        .fab {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(20,20,30,0.8); border: 1px solid rgba(255,255,255,0.12);
          color: #e2e8f0; display: flex; align-items: center; justify-content: center;
          cursor: pointer; backdrop-filter: blur(12px); transition: all .15s;
          flex-shrink: 0;
        }
        .fab:active { transform: scale(.88); }
        .fab.upload { color: #a5b4fc; }
        .fab.remove { color: #f87171; }
        .zone-label {
          position: absolute; top: 12px; left: 12px; z-index: 20;
          background: rgba(99,102,241,0.85); backdrop-filter: blur(8px);
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px; letter-spacing: .04em;
          pointer-events: none;
        }
        .section-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl); padding: 16px; margin-bottom: 12px;
        }
        .section-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; color: var(--text-secondary);
          margin-bottom: 13px; text-transform: uppercase; letter-spacing: .05em;
        }
        .cta-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 17px; border: none; border-radius: 16px;
          background: linear-gradient(135deg,#6366f1,#a855f7);
          color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
          box-shadow: 0 6px 20px rgba(99,102,241,.35);
          transition: all .2s; font-family: var(--font-display);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,.45); }
        .cta-btn:disabled { opacity: .4; transform: none; cursor: not-allowed; }
      `}</style>

      <div className="home-page animate-fade-in">
        <h1 className="hero-title">
          <span className="text-gradient">O'z dizayningni yarat</span> ✨
        </h1>

        {/* Zone tabs */}
        <div className="zone-tabs">
          {[
            { id: 'front', label: 'Old tomoni' },
            { id: 'back', label: 'Orqa tomoni' },
          ].map((z) => (
            <button
              key={z.id}
              className={`zone-tab ${activeZone === z.id ? 'active' : ''}`}
              onClick={() => setActiveZone(z.id)}
            >
              {z.label}
              {order.placements[z.id]?.image && <span className="dot" />}
            </button>
          ))}
        </div>

        {/* 3D preview */}
        <div className="preview-box">
          <span className="zone-label">
            {activeZone === 'front' ? '👕 Old' : '🔄 Orqa'}
          </span>
          <div className="preview-actions">
            <button className="fab upload" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={18} />
            </button>
            {currentHasImage && (
              <button className="fab remove" onClick={() => removePlacementImage(activeZone)}>
                <Trash2 size={16} />
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
        <div className="section-card">
          <div className="section-label">
            <Palette size={14} color="var(--accent-primary)" /> Rang
          </div>
          <ColorPicker selected={order.color} onChange={setColor} />
        </div>

        {/* Size */}
        <div className="section-card" style={{ marginBottom: 18 }}>
          <div className="section-label">📐 Razmer</div>
          <SizeSelector selected={order.size} onChange={setSize} />
        </div>

        <button
          className="cta-btn"
          onClick={() => navigate('/preview')}
          disabled={!hasAnyImage}
        >
          {hasAnyImage ? (
            <><span>Buyurtma berish</span> <ArrowRight size={18} /></>
          ) : (
            <span>Avval rasm yuklang</span>
          )}
        </button>
      </div>
    </>
  );
};

export default Home;