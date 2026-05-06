import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { CheckCircle2, Home, ShoppingBag, Hash } from 'lucide-react';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetOrder } = useOrder();
  
  const orderId = location.state?.orderId || 'MEMA-' + Math.floor(Math.random() * 10000);

  useEffect(() => {
    // Haptic feedback in Telegram
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  }, []);

  const handleNewOrder = () => {
    resetOrder();
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
      <style>{`
        .confirm-icon {
          width: 96px; height: 96px; margin: 0 auto 24px;
          border-radius: 50%; background: rgba(16,185,129,0.12);
          display: flex; align-items: center; justify-content: center;
          animation: fadeInScale 0.5s var(--ease-spring);
          box-shadow: 0 0 40px rgba(16,185,129,0.15);
        }
        .confirm-title {
          font-size: 26px; font-weight: 800; font-family: var(--font-display);
          margin-bottom: 8px; animation: fadeInUp 0.5s var(--ease-out) 0.15s both;
        }
        .confirm-text {
          font-size: 15px; color: var(--text-secondary); line-height: 1.6;
          margin-bottom: 32px; max-width: 300px; margin-left: auto; margin-right: auto;
          animation: fadeInUp 0.5s var(--ease-out) 0.25s both;
        }
        .confirm-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 20px; margin-bottom: 24px;
          text-align: left; animation: fadeInUp 0.5s var(--ease-out) 0.35s both;
        }
        .confirm-card-title {
          font-size: 13px; font-weight: 600; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .confirm-step {
          display: flex; align-items: flex-start; gap: 12px; padding: 8px 0;
        }
        .confirm-step-num {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          background: rgba(99,102,241,0.12); color: var(--accent-primary);
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .confirm-step-text { font-size: 14px; color: var(--text-secondary); line-height: 1.4; }
        .confirm-buttons {
          display: flex; flex-direction: column; gap: 10px;
          animation: fadeInUp 0.5s var(--ease-out) 0.45s both;
        }
      `}</style>

      <div className="confirm-icon">
        <CheckCircle2 size={48} color="#10b981" />
      </div>

      <h1 className="confirm-title">
        <span className="text-gradient">Buyurtma qabul qilindi!</span> 🎉
      </h1>
      <p className="confirm-text">
        Buyurtmangiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 32, padding: '8px 16px', background: 'var(--bg-card)', borderRadius: 100, width: 'max-content', margin: '0 auto 32px' }}>
        <Hash size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
          ID: {orderId}
        </span>
      </div>

      <div className="confirm-card">
        <div className="confirm-card-title">Keyingi qadamlar</div>
        <div className="confirm-step">
          <div className="confirm-step-num">1</div>
          <div className="confirm-step-text">Operatorimiz buyurtmangizni ko'rib chiqadi</div>
        </div>
        <div className="confirm-step">
          <div className="confirm-step-num">2</div>
          <div className="confirm-step-text">Telegram orqali siz bilan bog'lanamiz</div>
        </div>
        <div className="confirm-step">
          <div className="confirm-step-num">3</div>
          <div className="confirm-step-text">Futbolkangiz tayyorlanadi va yetkaziladi</div>
        </div>
      </div>

      <div className="confirm-buttons">
        <button className="btn btn-primary btn-block btn-lg" onClick={handleNewOrder}>
          <Home size={18} /> Bosh sahifaga
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => navigate('/orders')}>
          <ShoppingBag size={18} /> Buyurtmalarim
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
