import React from 'react';
import { Check } from 'lucide-react';

const COLORS = [
  { id: 'white', label: 'Oq', hex: '#f5f5f5', border: '#d4d4d4' },
  { id: 'black', label: 'Qora', hex: '#1c1c1e', border: '#444' },
];

const ColorPicker = ({ selected, onChange }) => {
  return (
    <>
      <style>{`
        .color-picker {
          display: flex;
          gap: 12px;
        }
        .color-swatch {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .color-swatch-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid transparent;
          transition: all var(--duration-normal) var(--ease-spring);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .color-swatch.active .color-swatch-circle {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2), var(--shadow-glow);
          transform: scale(1.1);
        }
        .color-swatch-inner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: transform var(--duration-fast) var(--ease-spring);
        }
        .color-swatch:hover .color-swatch-inner {
          transform: scale(1.05);
        }
        .color-swatch-check {
          position: absolute;
          color: white;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }
        .color-swatch-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color var(--duration-fast);
        }
        .color-swatch.active .color-swatch-label {
          color: var(--text-primary);
        }
      `}</style>
      <div className="color-picker">
        {COLORS.map(c => (
          <button
            key={c.id}
            className={`color-swatch ${selected === c.id ? 'active' : ''}`}
            onClick={() => onChange(c.id)}
          >
            <div className="color-swatch-circle">
              <div
                className="color-swatch-inner"
                style={{
                  backgroundColor: c.hex,
                  border: `1px solid ${c.border}`,
                }}
              />
              {selected === c.id && (
                <Check
                  className="color-swatch-check"
                  size={16}
                  style={{ color: c.id === 'white' ? '#6366f1' : '#fff' }}
                />
              )}
            </div>
            <span className="color-swatch-label">{c.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default ColorPicker;
