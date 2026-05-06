import React, { useRef, useEffect, useCallback } from 'react';

const TShirtPreview = ({
  color = 'white',
  image,
  position = { x: 0, y: 0, scale: 1 },
  onPositionChange,
  interactive = false,
  onImageClick,
}) => {
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const colors = {
    white: { fill: '#ffffff', stroke: '#d1d1d1', shadow: 'rgba(0,0,0,0.1)' },
    black: { fill: '#0a0a0b', stroke: '#1a1a1c', shadow: 'rgba(0,0,0,0.5)' },
  };

  const c = colors[color] || colors.white;

  const handlePointerDown = useCallback((e) => {
    if (!interactive || !image) return;
    e.preventDefault();
    dragging.current = true;
    const pt = e.touches ? e.touches[0] : e;
    lastPos.current = { x: pt.clientX, y: pt.clientY };
  }, [interactive, image]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current || !interactive) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastPos.current.x;
    const dy = pt.clientY - lastPos.current.y;
    lastPos.current = { x: pt.clientX, y: pt.clientY };

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 380 / rect.height;

    onPositionChange?.({
      ...position,
      x: position.x + dx * scaleX,
      y: position.y + dy * scaleY,
    });
  }, [interactive, position, onPositionChange]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerUp]);

  return (
    <div 
      className="tshirt-preview-container" 
      ref={containerRef} 
      onClick={onImageClick}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '300 / 380',
        cursor: interactive && image ? 'move' : 'pointer',
        filter: `drop-shadow(0 30px 60px ${c.shadow})`
      }}
    >
      <svg 
        viewBox="0 0 300 380" 
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
      >
        <defs>
          <clipPath id="print-clip">
            <rect x="80" y="90" width="140" height="180" rx="8" />
          </clipPath>
          
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color === 'white' ? '#ffffff' : '#1e1e20'} />
            <stop offset="50%" stopColor={c.fill} />
            <stop offset="100%" stopColor={color === 'white' ? '#e0e0e0' : '#050505'} />
          </linearGradient>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Oversized Body Path (Dropped shoulders, wider sleeves) */}
        <path
          d="M 90,15 C 115,40 135,50 150,50 C 165,50 185,40 210,15 
             L 295,70 C 295,70 298,75 298,85 L 298,190 L 240,170 L 240,365 
             C 240,375 235,380 225,380 L 75,380 C 65,380 60,375 60,365 L 60,170 
             L 2,190 L 2,85 C 2,75 5,70 5,70 Z"
          fill={`url(#grad-${color})`}
          stroke={c.stroke}
          strokeWidth="0.5"
        />

        {/* Shading / Depth lines */}
        <path d="M 90,15 C 115,40 135,50 150,50 C 165,50 185,40 210,15" fill="none" stroke="black" strokeWidth="0.5" opacity="0.1" />
        <path d="M 60,170 L 240,170" fill="none" stroke="black" strokeWidth="0.2" opacity="0.05" />
        
        {/* Armpit curves */}
        <path d="M 60,150 Q 70,170 60,190" fill="none" stroke="black" strokeWidth="0.5" opacity="0.1" />
        <path d="M 240,150 Q 230,170 240,190" fill="none" stroke="black" strokeWidth="0.5" opacity="0.1" />

        {/* User Image */}
        {image && (
          <g clipPath="url(#print-clip)">
            <image
              href={image}
              x={80 + position.x - (140 * position.scale - 140) / 2}
              y={90 + position.y - (180 * position.scale - 180) / 2}
              width={140 * position.scale}
              height={180 * position.scale}
              preserveAspectRatio="xMidYMid meet"
              style={{ mixBlendMode: color === 'white' ? 'multiply' : 'screen' }}
            />
          </g>
        )}

        {!image && (
          <text x="150" y="180" textAnchor="middle" fontSize="10" fill={color === 'white' ? '#6366f1' : '#fff'} opacity="0.3" fontWeight="800">
            RASM QO'YISH
          </text>
        )}
      </svg>
    </div>
  );
};

export default TShirtPreview;
