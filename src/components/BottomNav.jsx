import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Home, label: 'Bosh sahifa' },
    { path: '/orders', icon: ShoppingBag, label: 'Buyurtmalar' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <>
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding-bottom: var(--safe-bottom);
          background: rgba(6, 6, 12, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
        }
        .bottom-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          max-width: 480px;
          margin: 0 auto;
          padding: 8px 0 6px;
        }
        .nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: all var(--duration-fast) var(--ease-out);
          position: relative;
        }
        .nav-tab.active {
          color: var(--accent-primary);
        }
        .nav-tab.active::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          background: var(--gradient-primary);
          border-radius: 2px;
        }
        .nav-tab-icon {
          width: 22px;
          height: 22px;
          transition: transform var(--duration-fast) var(--ease-spring);
        }
        .nav-tab.active .nav-tab-icon {
          transform: scale(1.1);
        }
        .nav-tab-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(tab => (
            <button
              key={tab.path}
              className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="nav-tab-icon" size={22} />
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
