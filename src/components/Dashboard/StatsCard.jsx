import React from 'react';

const StatsCard = ({ icon, label, value, color, glow }) => {
  return (
    <div
      className="hacker-card"
      style={{
        borderColor: glow ? color : undefined,
        boxShadow: glow ? `0 0 15px ${color}30` : undefined
      }}
    >
      <span className="corner corner-tl"></span>
      <span className="corner corner-tr"></span>
      <span className="corner corner-bl"></span>
      <span className="corner corner-br"></span>

      <div className="stat-content">
        <span
          className="stat-icon"
          style={{
            color: color,
            textShadow: `0 0 10px ${color}`
          }}
        >
          {icon}
        </span>
        <div className="stat-data">
          <span
            className="stat-value"
            style={{ color: color }}
          >
            {value}
          </span>
          <span className="stat-label">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;