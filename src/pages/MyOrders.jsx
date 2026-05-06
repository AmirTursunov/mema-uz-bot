import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Clock, CheckCircle2, Plus } from 'lucide-react';

import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  React.useEffect(() => {
    if (!telegramUser?.id) {
      setOrders(JSON.parse(localStorage.getItem('mema_my_orders') || '[]'));
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customerInfo.telegramUserId', '==', String(telegramUser.id)),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fbOrders = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().orderId,
        date: doc.data().createdAt?.toDate() || new Date(),
        status: doc.data().status === 'pending' ? 'Tekshirilmoqda' : 
                doc.data().status === 'accepted' ? 'Qabul qilindi' : 'Bekor qilindi'
      }));

      const localOrders = JSON.parse(localStorage.getItem('mema_my_orders') || '[]');
      const merged = [...fbOrders];
      localOrders.forEach(lo => {
        if (!merged.find(fo => fo.id === lo.id)) {
          merged.push(lo);
        }
      });
      
      setOrders(merged);
      setLoading(false);
    }, (err) => {
      console.warn('Firestore sync failed:', err);
      setOrders(JSON.parse(localStorage.getItem('mema_my_orders') || '[]'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [telegramUser?.id]);

  return (
    <div style={{ paddingBottom: '30px' }}>
      <style>{`
        .orders-page { animation: fadeInUp 0.4s var(--ease-out); }
        .orders-title { font-size: 22px; font-weight: 800; font-family: var(--font-display); margin-bottom: 20px; }
        .orders-empty {
          text-align: center; padding: 60px 20px;
          animation: fadeInUp 0.4s var(--ease-out);
        }
        .orders-empty-icon {
          width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%;
          background: rgba(99,102,241,0.08); display: flex; align-items: center;
          justify-content: center; color: var(--text-muted);
        }
        .orders-empty-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .orders-empty-text { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }
        
        .order-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px;
        }
        .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .order-id { font-size: 15px; font-weight: 800; font-family: var(--font-display); }
        .order-date { font-size: 12px; color: var(--text-muted); }
        .order-details { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
        .order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-light); padding-top: 12px; margin-top: 4px; }
        .order-price { font-size: 15px; font-weight: 700; color: var(--text-primary); }
      `}</style>

      <div className="orders-page">
        <h1 className="orders-title"><span className="text-gradient">Buyurtmalarim</span></h1>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon"><ShoppingBag size={32} /></div>
            <div className="orders-empty-title">Hali buyurtma yo'q</div>
            <div className="orders-empty-text">Birinchi futbolkangizni dizayn qiling!</div>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Plus size={18} /> Yangi buyurtma
            </button>
          </div>
        ) : (
          orders.map((o, i) => (
            <div key={i} className="order-card">
              <div className="order-header">
                <span className="order-id">#{o.id?.slice(0, 8)}</span>
                <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  {o.status}
                </span>
              </div>
              <div className="order-details">
                <div>Kiyim: <b>{o.color === 'white' ? 'Oq' : 'Qora'} futbolka</b></div>
                <div>O'lcham: <b>{o.size}</b></div>
                <div className="order-date">{new Date(o.date).toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="order-footer">
                <span className="order-price">{new Intl.NumberFormat('uz-UZ').format(o.totalPrice)} so'm</span>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate('/')}>
                  Yangi buyurtma
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
