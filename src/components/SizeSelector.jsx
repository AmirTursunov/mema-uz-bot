import React, { useState } from 'react';
import { Ruler, X } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const SIZE_CHART = {
  S: { chest: '48', length: '68', shoulder: '42' },
  M: { chest: '50', length: '70', shoulder: '44' },
  L: { chest: '52', length: '72', shoulder: '46' },
  XL: { chest: '56', length: '74', shoulder: '48' },
  XXL: { chest: '60', length: '76', shoulder: '50' },
};

const SizeSelector = ({ selected, onChange }) => {
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <style>{`
        .size-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .size-btn {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-light);
          background: var(--bg-glass);
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 700;
          font-family: var(--font-display);
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-spring);
        }
        .size-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
          background: rgba(99,102,241,0.05);
        }
        .size-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
          transform: scale(1.05);
        }
        .size-chart-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 0;
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--duration-fast);
        }
        .size-chart-btn:hover {
          color: var(--accent-secondary);
        }
        .size-chart-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .size-chart-modal {
          width: 100%;
          max-width: 480px;
          background: var(--bg-secondary);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          border: 1px solid var(--border-subtle);
          border-bottom: none;
          padding: 24px 20px;
          padding-bottom: calc(24px + var(--safe-bottom));
          animation: slideUp 0.3s var(--ease-out);
        }
        .size-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .size-chart-title {
          font-size: 18px;
          font-weight: 700;
          font-family: var(--font-display);
        }
        .size-chart-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: var(--bg-glass-strong);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .size-chart-table {
          width: 100%;
          border-collapse: collapse;
        }
        .size-chart-table th,
        .size-chart-table td {
          padding: 12px 16px;
          text-align: center;
          font-size: 14px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .size-chart-table th {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .size-chart-table td {
          color: var(--text-primary);
          font-weight: 500;
        }
        .size-chart-table td:first-child {
          font-weight: 700;
          color: var(--accent-primary);
        }
      `}</style>
      <div>
        <div className="size-selector">
          {SIZES.map(s => (
            <button
              key={s}
              className={`size-btn ${selected === s ? 'active' : ''}`}
              onClick={() => onChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="size-chart-btn" onClick={() => setShowChart(true)}>
          <Ruler size={14} />
          O'lcham jadvali
        </button>
      </div>

      {showChart && (
        <div className="size-chart-overlay" onClick={() => setShowChart(false)}>
          <div className="size-chart-modal" onClick={e => e.stopPropagation()}>
            <div className="size-chart-header">
              <h3 className="size-chart-title">O'lcham jadvali (sm)</h3>
              <button className="size-chart-close" onClick={() => setShowChart(false)}>
                <X size={18} />
              </button>
            </div>
            <table className="size-chart-table">
              <thead>
                <tr>
                  <th>O'lcham</th>
                  <th>Ko'krak</th>
                  <th>Uzunlik</th>
                  <th>Yelka</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map(s => (
                  <tr key={s}>
                    <td>{s}</td>
                    <td>{SIZE_CHART[s].chest}</td>
                    <td>{SIZE_CHART[s].length}</td>
                    <td>{SIZE_CHART[s].shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default SizeSelector;
