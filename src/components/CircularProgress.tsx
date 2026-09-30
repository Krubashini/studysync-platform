'use client';

import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: string; // e.g. '#58CC02', '#1CB0F6', etc.
  strokeWidth?: number;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  label,
  sublabel,
  icon,
  color,
  strokeWidth = 10,
  size = 110,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / (max || 1)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card-duo p-5 flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-[#84D8FF] transition-all">
      {/* Top Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <span className="font-extrabold text-sm uppercase tracking-wider text-gray-500">
          {label}
        </span>
      </div>

      {/* Circular Progress Wheel */}
      <div className="relative my-2 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E5E5"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Filled progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numerical Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-800 leading-none">
            {value}
          </span>
          <span className="text-[11px] font-bold text-gray-400 mt-0.5">
            / {max}
          </span>
        </div>
      </div>

      {/* Subtext info */}
      <div className="mt-2 text-xs font-bold text-gray-600">
        {sublabel || `${Math.round(percentage)}% Completed`}
      </div>
    </div>
  );
};
