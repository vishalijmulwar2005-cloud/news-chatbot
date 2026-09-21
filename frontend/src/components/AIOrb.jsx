import React from 'react';

export default function AIOrb({ size = 'md', className = '' }) {
  const sizeStyles = {
    sm: { width: '32px', height: '32px' },
    md: { width: '48px', height: '48px' },
    lg: { width: '84px', height: '84px' },
    xl: { width: '130px', height: '130px' },
  };

  return (
    <div className={`ai-orb-container ${className}`}>
      <div className="ai-orb" style={sizeStyles[size] || sizeStyles.md}>
        <div className="ai-orb-inner" />
      </div>
    </div>
  );
}
