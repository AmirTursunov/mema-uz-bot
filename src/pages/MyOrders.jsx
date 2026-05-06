import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Clock, CheckCircle2, Plus } from 'lucide-react';

const MyOrders = () => {
  const navigate = useNavigate();
  // TODO: Fetch from Firebase when configured
  const orders = [];

  return (
    <div>
      <style>{`
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
      `}</style>

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
          <div key={i} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>#{o.id?.slice(0,8)}</span>
              <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : 'primary'}`}>
                {o.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
