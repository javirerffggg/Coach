import React from 'react';

const MacroRing = ({ label, current, target, unit, color }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90 w-28 h-28">
          {/* Fondo del anillo */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          {/* Progreso del anillo */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-1">
          {Math.round(current)} / {Math.round(target)} {unit}
        </p>
      </div>
    </div>
  );
};

export default MacroRing;
