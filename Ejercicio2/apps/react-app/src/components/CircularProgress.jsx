import React from 'react';

export default function CircularProgress({ value = 0, size = 80, thickness = 6 }) {
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((100 - value) / 100) * circumference;

  // Color basado en el porcentaje
  const getColor = () => {
    if (value >= 70) return '#22c55e'; // Verde para ≥70%
    if (value >= 40) return '#f59e0b'; // Amarillo para ≥40%
    return '#dc2626'; // Rojo para <40%
  };
  
  return (
    <div className="circular-progress" style={{ width: size, height: size, position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Fondo oscuro */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(15, 23, 42, 0.6)"
          strokeWidth={thickness}
          fill="none"
        />
        {/* Track claro */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth={thickness - 0.5}
          fill="none"
        />
        {/* Progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={thickness - 1}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease',
            filter: `drop-shadow(0 0 3px ${getColor()}40)`
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size / 3}px`,
          fontWeight: '600',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <span>{value}</span>
        <span style={{ fontSize: `${size / 5}px`, marginLeft: '1px', opacity: 0.8 }}>%</span>
      </div>
    </div>
  );
}