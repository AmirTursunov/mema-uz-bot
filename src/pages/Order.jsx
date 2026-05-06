import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, calculateTotal, formatPrice } from '../context/OrderContext';
import { Send, Truck, Store, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { submitOrder } from '../services/api';

const Order = () => {
  const navigate = useNavigate();
  const { order, setCustomerInfo, resetOrder } = useOrder();
  const [receiptImage, setReceiptImage] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const cardDetails = {
    number: "8600 1234 5678 9012",
    name: "AMIR TURSUNOV",
    bank: "MEMA UZ OFFICIAL"
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cardDetails.number.replace(/\s/g, ''));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    if (!receiptImage) {
      alert("Iltimos, to'lov chekini yuklang!");
      return;
    }
    setLoading(true);

    try {
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      const orderDataToSubmit = {
        ...order,
        telegramUserId: telegramUser?.id || 'unknown',
        telegramUsername: telegramUser?.username || telegramUser?.first_name || 'unknown',
        paymentReceipt: receiptImage, // Add the receipt image
      };

      const orderId = await submitOrder(orderDataToSubmit);
      navigate('/confirmation', { state: { orderId } });
    } catch (err) {
      console.error('Order error:', err);
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
        
        .payment-card-box {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl); padding: 20px;
          display: flex; flex-direction: column; gap: 15px;
        }
        .pay-btn-trigger {
          background: var(--gradient-primary); color: white; border: none;
          padding: 12px; border-radius: var(--radius-lg); font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer;
        }
        .receipt-upload-btn {
          border: 2px dashed var(--border-light); padding: 20px; border-radius: var(--radius-lg);
          text-align: center; cursor: pointer; position: relative;
          transition: all 0.3s;
        }
        .receipt-upload-btn:hover { border-color: var(--accent-primary); background: rgba(99,102,241,0.05); }
        .receipt-preview { width: 100%; max-height: 150px; object-fit: contain; border-radius: 8px; }

        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
          z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .premium-card {
          width: 100%; max-width: 350px; height: 200px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border-radius: 20px; padding: 25px; position: relative;
          color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        .premium-card::before {
          content: ''; position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        .card-chip { width: 45px; height: 35px; background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%); border-radius: 6px; margin-bottom: 30px; }
        .card-number { font-size: 20px; font-weight: 700; letter-spacing: 2px; margin-bottom: 25px; font-family: monospace; }
        .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-holder { font-size: 14px; font-weight: 600; text-transform: uppercase; }
        .card-bank { font-size: 12px; opacity: 0.8; }
        .copy-hint { position: absolute; top: 20px; right: 20px; font-size: 11px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 20px; }

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

      {showCardModal && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="premium-card animate-scale-in" onClick={e => { e.stopPropagation(); copyToClipboard(); }}>
            <div className="copy-hint">{copySuccess ? "Nusxa olindi! ✅" : "Nusxa olish uchun bosing"}</div>
            <div className="card-chip"></div>
            <div className="card-number">{cardDetails.number}</div>
            <div className="card-bottom">
              <div>
                <div className="card-bank">{cardDetails.bank}</div>
                <div className="card-holder">{cardDetails.name}</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic' }}>HUMO</div>
            </div>
          </div>
        </div>
      )}

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

      <div className="order-section">
        <div className="order-section-title"><Send size={16} /> To'lov (100% oldindan to'lov)</div>
        <div className="payment-card-box">
          <button className="pay-btn-trigger" onClick={() => setShowCardModal(true)}>
            💳 Karta raqamni ko'rish
          </button>
          
          <label className="receipt-upload-btn">
            <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} />
            {receiptImage ? (
              <img src={receiptImage} alt="Chek" className="receipt-preview" />
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸</div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>To'lov chekini yuklang</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skrinshot yoki rasm</div>
              </div>
            )}
          </label>
        </div>
      </div>

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
