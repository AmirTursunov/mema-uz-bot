import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, calculateTotal, formatPrice, PRICES } from '../context/OrderContext';
import TShirtPreview from '../components/TShirtPreview';
import SizeSelector from '../components/SizeSelector';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';

const ZONE_LABELS = {
  front: 'Old',
  back: 'Orqa',
  leftSleeve: 'Chap yeng',
  rightSleeve: "O'ng yeng",
};

const Preview = () => {
  const navigate = useNavigate();
  const { order, setSize, getActivePlacements } = useOrder();
  const activePlacements = getActivePlacements();
  const total = calculateTotal(order);

  return (
    <div className="preview-page">
      <style>{`
        .preview-page { padding-bottom: 20px; }
        .preview-title { font-size: 22px; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .preview-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; }
        .preview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .preview-grid-item {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 12px 8px 8px; position: relative; overflow: hidden;
        }
        .preview-grid-badge {
          position: absolute; top: 8px; right: 8px; width: 20px; height: 20px;
          border-radius: 50%; background: var(--gradient-success);
          display: flex; align-items: center; justify-content: center;
        }
        .preview-section { margin-bottom: 24px; }
        .preview-section-label {
          font-size: 14px; font-weight: 600; color: var(--text-secondary);
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .price-summary {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 20px; margin-bottom: 24px;
        }
        .price-summary-title {
          font-size: 14px; font-weight: 700; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .price-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .price-row-label { font-size: 13px; color: var(--text-secondary); }
        .price-row-value { font-size: 13px; font-weight: 600; }
        .price-divider { height: 1px; background: var(--border-subtle); margin: 10px 0; }
        .price-total { display: flex; justify-content: space-between; padding: 4px 0; }
        .price-total-label { font-size: 16px; font-weight: 700; }
        .price-total-value {
          font-size: 18px; font-weight: 800;
          background: var(--gradient-primary); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .color-dot {
          display: inline-block; width: 14px; height: 14px; border-radius: 50%;
          border: 1.5px solid var(--border-light); vertical-align: middle; margin-right: 6px;
        }
      `}</style>

      <div className="animate-fade-in-up">
        <h1 className="preview-title"><span className="text-gradient">Ko'rib chiqish</span> 👀</h1>
        <p className="preview-subtitle">Dizayningizni tekshiring va o'lcham tanlang</p>
      </div>

      <div className="preview-grid stagger-children">
        {activePlacements.map(({ zone, image, position }) => (
          <div key={zone} className="preview-grid-item">
            <div className="preview-grid-badge"><Check size={12} color="#fff" /></div>
            <TShirtPreview color={order.color} view={zone} image={image} position={position} />
          </div>
        ))}
      </div>

      <div className="preview-section">
        <div className="preview-section-label">📐 O'lcham tanlang</div>
        <SizeSelector selected={order.size} onChange={setSize} />
      </div>

      <div className="price-summary animate-fade-in-up">
        <div className="price-summary-title">
          <ShoppingCart size={16} style={{ color: 'var(--accent-primary)' }} /> Buyurtma xulosi
        </div>
        <div className="price-row">
          <span className="price-row-label">
            <span className="color-dot" style={{ backgroundColor: order.color === 'white' ? '#f5f5f5' : '#1c1c1e' }} />
            {order.color === 'white' ? 'Oq' : 'Qora'} futbolka
          </span>
          <span className="price-row-value">{formatPrice(PRICES.tshirt)}</span>
        </div>
        {activePlacements.map(({ zone }, i) => (
          <div key={zone} className="price-row">
            <span className="price-row-label">Rasm — {ZONE_LABELS[zone]}</span>
            <span className="price-row-value">+{formatPrice(i === 0 ? PRICES.firstPrint : PRICES.extraPrint)}</span>
          </div>
        ))}
        <div className="price-divider" />
        <div className="price-total">
          <span className="price-total-label">Jami</span>
          <span className="price-total-value">{formatPrice(total)}</span>
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/order')} disabled={!order.size}>
        {order.size ? 'Buyurtma berish' : "O'lcham tanlang"}
        {order.size && <ArrowRight size={18} />}
      </button>
    </div>
  );
};

export default Preview;
