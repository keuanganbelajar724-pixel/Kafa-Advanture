import React from 'react';
import { WorldObstacle } from '../../types/game';

interface ObstaclePropProps {
  obstacle: WorldObstacle;
}

export const ObstacleProp: React.FC<ObstaclePropProps> = ({ obstacle }) => {
  const { type, w, h, label } = obstacle;

  return (
    <div className="relative select-none flex flex-col items-center group pointer-events-none">
      {/* Floor Contact Shadow */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/45 rounded-full blur-[3px]"
        style={{ width: `${w * 0.95}px`, height: '10px' }}
      />

      {/* 1. CRATE (Kotak Kayu Petualang) */}
      {type === 'crate' && (
        <svg
          width={w}
          height={h}
          viewBox="0 0 60 50"
          fill="none"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id="crateWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="metalRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Main Box */}
          <rect x="3" y="3" width="54" height="44" rx="4" fill="url(#crateWood)" stroke="#451A03" strokeWidth="2.5" />
          {/* Wooden Planks Inset */}
          <rect x="8" y="8" width="44" height="34" rx="2" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
          {/* Cross Diagonal Bracing */}
          <line x1="9" y1="9" x2="51" y2="41" stroke="#451A03" strokeWidth="3" />
          <line x1="9" y1="9" x2="51" y2="41" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="51" y1="9" x2="9" y2="41" stroke="#451A03" strokeWidth="3" />
          <line x1="51" y1="9" x2="9" y2="41" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.7" />
          {/* Corner Steel Brackets with Rivets */}
          <rect x="2" y="2" width="10" height="10" rx="1.5" fill="url(#metalRim)" stroke="#1E293B" strokeWidth="1" />
          <circle cx="5" cy="5" r="1" fill="#F8FAFC" />
          <rect x="48" y="2" width="10" height="10" rx="1.5" fill="url(#metalRim)" stroke="#1E293B" strokeWidth="1" />
          <circle cx="55" cy="5" r="1" fill="#F8FAFC" />
          <rect x="2" y="38" width="10" height="10" rx="1.5" fill="url(#metalRim)" stroke="#1E293B" strokeWidth="1" />
          <circle cx="5" cy="45" r="1" fill="#F8FAFC" />
          <rect x="48" y="38" width="10" height="10" rx="1.5" fill="url(#metalRim)" stroke="#1E293B" strokeWidth="1" />
          <circle cx="55" cy="45" r="1" fill="#F8FAFC" />
        </svg>
      )}

      {/* 2. ROCK (Batu Lumut Petualang) */}
      {type === 'rock' && (
        <svg
          width={w}
          height={h}
          viewBox="0 0 65 45"
          fill="none"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id="rockStone" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="40%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="mossCover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
          </defs>
          {/* Stone Body */}
          <path
            d="M6 38 C4 24 16 10 32 8 C48 6 58 16 61 32 C62 40 45 42 32 41 C16 41 7 42 6 38 Z"
            fill="url(#rockStone)"
            stroke="#1E293B"
            strokeWidth="2.5"
          />
          {/* Top Moss Cap */}
          <path
            d="M18 16 C24 10 36 9 46 12 C44 19 38 21 32 18 C26 21 21 19 18 16 Z"
            fill="url(#mossCover)"
            opacity="0.9"
          />
          {/* Rock Cracks & Facets */}
          <path d="M25 20 L29 28 L38 31" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M42 16 L48 24" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          {/* Specular Edge Highlights */}
          <path d="M14 18 C22 12 36 11 48 13" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      )}

      {/* 3. FENCE (Pagar Bambu / Kayu) */}
      {type === 'fence' && (
        <svg
          width={w}
          height={h}
          viewBox="0 0 70 45"
          fill="none"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id="fencePlank" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* Horizontal Rails */}
          <rect x="2" y="14" width="66" height="6" rx="2" fill="url(#fencePlank)" stroke="#451A03" strokeWidth="1.5" />
          <rect x="2" y="28" width="66" height="6" rx="2" fill="url(#fencePlank)" stroke="#451A03" strokeWidth="1.5" />
          {/* Vertical Pickets */}
          {[10, 28, 46, 62].map((xPos) => (
            <g key={xPos}>
              {/* Pointed top picket */}
              <polygon
                points={`${xPos - 5},8 ${xPos},2 ${xPos + 5},8 ${xPos + 5},42 ${xPos - 5},42`}
                fill="url(#fencePlank)"
                stroke="#451A03"
                strokeWidth="1.5"
              />
              <circle cx={xPos} cy="17" r="1" fill="#451A03" />
              <circle cx={xPos} cy="31" r="1" fill="#451A03" />
            </g>
          ))}
        </svg>
      )}

      {/* 4. PUDDLE (Kubangan Air) */}
      {type === 'puddle' && (
        <svg
          width={w}
          height={h}
          viewBox="0 0 70 30"
          fill="none"
          className="overflow-visible"
        >
          <defs>
            <radialGradient id="puddleWater" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <ellipse cx="35" cy="15" rx="32" ry="12" fill="url(#puddleWater)" stroke="#7DD3FC" strokeWidth="1.5" />
          {/* Gentle water ripples */}
          <ellipse cx="30" cy="14" rx="16" ry="6" stroke="#BAE6FD" strokeWidth="1" strokeDasharray="4 2" fill="none" opacity="0.8" />
          <ellipse cx="34" cy="16" rx="8" ry="3" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.9" />
          <circle cx="20" cy="12" r="1" fill="#FFFFFF" />
          <circle cx="48" cy="16" r="1" fill="#FFFFFF" />
        </svg>
      )}

      {/* Subtle Hint Label if hover or near */}
      {label && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[9px] font-bold text-amber-200 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-400 font-game whitespace-nowrap shadow-md pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
};
