import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <>
      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: var(--safe-top) 0 0;
          background: rgba(6, 6, 12, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          max-width: 480px;
          margin: 0 auto;
        }
        .header-back {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .header-back:hover {
          background: rgba(255,255,255,0.12);
          border-color: var(--border-light);
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 16px;
          color: white;
        }
        .header-logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .header-spacer {
          width: 36px;
        }
      `}</style>
      <header className="header">
        <div className="header-inner">
          {!isHome ? (
            <button className="header-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="header-spacer" />
          )}
          <div className="header-logo">
            <div className="header-logo-icon">M</div>
            <span className="header-logo-text">Brand</span>
          </div>
          <div className="header-spacer" />
        </div>
      </header>
    </>
  );
};

export default Header;
