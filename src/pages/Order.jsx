import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, calculateTotal, formatPrice } from '../context/OrderContext';
import { Send, Truck, Store, User, Phone, MapPin, Loader2 } from 'lucide-react';

const Order = () => {
  const navigate = useNavigate();
  const { order, setCustomerInfo } = useOrder();
  const [loading, setLoading] = useState(false);
  const total = calculateTotal(order);
  const info = order.customerInfo;

  const isValid = info.name.trim() && info.phone.trim() &&
    (info.deliveryType === 'pickup' || info.address.trim());

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      // Send order to Telegram bot via API
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const orderData = {
        telegramUserId: telegramUser?.id || 'unknown',
        telegramUsername: telegramUser?.username || telegramUser?.first_name || 'unknown',
        color: order.color,
        size: order.size,
        placements: Object.entries(order.placements)
          .filter(([, p]) => p.image)
          .map(([zone]) => zone),
        customerName: info.name,
        customerPhone: info.phone,
        deliveryType: info.deliveryType,
        deliveryAddress: info.address,
        totalPrice: total,
      };

      const resp = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!resp.ok) throw new Error('Order failed');
      navigate('/confirmation');
    } catch (err) {
      console.error('Order error:', err);
      // Still navigate to confirmation for demo
      navigate('/confirmation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <style>{`
        .order-page { padding-bottom: 20px; }
        .order-title { font-size: 22px; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .order-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; }
        .order-section { margin-bottom: 24px; }
        .order-section-title {
          font-size: 14px; font-weight: 700; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px; color: var(--text-primary);
        }
        .order-section-title svg { color: var(--accent-primary); }
        .delivery-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .delivery-option {
          padding: 16px; border-radius: var(--radius-lg);
          border: 1.5px solid var(--border-light); background: var(--bg-glass);
          cursor: pointer; text-align: center; transition: all var(--duration-normal) var(--ease-out);
        }
        .delivery-option:hover { border-color: var(--accent-primary); }
        .delivery-option.active {
          background: rgba(99,102,241,0.1); border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .delivery-option-icon { margin-bottom: 8px; color: var(--text-secondary); }
        .delivery-option.active .delivery-option-icon { color: var(--accent-primary); }
        .delivery-option-label { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .delivery-option-price { font-size: 12px; color: var(--text-muted); }
        .delivery-option.active .delivery-option-price { color: var(--accent-primary); }
        .order-total-bar {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 16px 20px; margin-bottom: 16px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .order-total-label { font-size: 14px; color: var(--text-secondary); }
        .order-total-value {
          font-size: 20px; font-weight: 800; font-family: var(--font-display);
          background: var(--gradient-primary); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
      `}</style>

      <div className="animate-fade-in-up">
        <h1 className="order-title"><span className="text-gradient">Buyurtma</span> 📦</h1>
        <p className="order-subtitle">Ma'lumotlaringizni kiriting</p>
      </div>

      <div className="order-section">
        <div className="order-section-title"><User size={16} /> Shaxsiy ma'lumotlar</div>
        <div className="input-group">
          <label className="input-label">Ism-familiya</label>
          <input className="input-field" placeholder="Ism familiyangiz" value={info.name}
            onChange={e => setCustomerInfo({ name: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Telefon raqam</label>
          <input className="input-field" type="tel" placeholder="+998 90 123 45 67" value={info.phone}
            onChange={e => setCustomerInfo({ phone: e.target.value })} />
        </div>
      </div>

      <div className="order-section">
        <div className="order-section-title"><Truck size={16} /> Yetkazib berish</div>
        <div className="delivery-options">
          <button className={`delivery-option ${info.deliveryType === 'delivery' ? 'active' : ''}`}
            onClick={() => setCustomerInfo({ deliveryType: 'delivery' })}>
            <div className="delivery-option-icon"><Truck size={24} /></div>
            <div className="delivery-option-label">Dastavka</div>
            <div className="delivery-option-price">{formatPrice(15000)}</div>
          </button>
          <button className={`delivery-option ${info.deliveryType === 'pickup' ? 'active' : ''}`}
            onClick={() => setCustomerInfo({ deliveryType: 'pickup' })}>
            <div className="delivery-option-icon"><Store size={24} /></div>
            <div className="delivery-option-label">Olib ketish</div>
            <div className="delivery-option-price">Bepul</div>
          </button>
        </div>
      </div>

      {info.deliveryType === 'delivery' && (
        <div className="order-section animate-fade-in-up">
          <div className="order-section-title"><MapPin size={16} /> Manzil</div>
          <div className="input-group">
            <textarea className="input-field" placeholder="To'liq manzilingizni kiriting" value={info.address}
              onChange={e => setCustomerInfo({ address: e.target.value })} rows={3} />
          </div>
        </div>
      )}

      <div className="order-total-bar">
        <span className="order-total-label">Jami to'lov:</span>
        <span className="order-total-value">{formatPrice(total)}</span>
      </div>

      <button className="btn btn-success btn-block btn-lg" onClick={handleSubmit} disabled={!isValid || loading}>
        {loading ? <><Loader2 size={18} className="spin" /> Yuborilmoqda...</> :
          <><Send size={18} /> Buyurtmani tasdiqlash</>}
      </button>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Order;
