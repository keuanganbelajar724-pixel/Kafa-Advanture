import React from 'react';
import { motion } from 'motion/react';
import { LevelEnemy } from '../../types/game';

interface EnemyProps {
  enemy: LevelEnemy;
  isStomped?: boolean;
}

export const EnemyCritter: React.FC<EnemyProps> = ({ enemy, isStomped }) => {
  const { type, direction } = enemy;
  const isFacingLeft = direction === 'left';

  return (
    <div
      className={`relative select-none pointer-events-none transition-transform will-change-transform ${
        isFacingLeft ? 'scale-x-100' : '-scale-x-100'
      }`}
    >
      {/* Floor Contact Shadow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/45 rounded-full blur-[2px]" />

      {/* 1. GOOMBA: GRUMPY LITTLE FOREST MUSHROOM */}
      {type === 'goomba' && (
        <motion.div
          animate={
            isStomped
              ? { scaleY: 0.22, scaleX: 1.45, y: 12, opacity: [1, 0.9, 0] }
              : { y: [0, -3, 0], scaleY: [1, 1.05, 1] }
          }
          transition={
            isStomped
              ? { duration: 0.5, ease: 'easeOut' }
              : { repeat: Infinity, duration: 0.35, ease: 'easeInOut' }
          }
          className="relative flex flex-col items-center"
        >
          <svg width="48" height="52" viewBox="0 0 48 52" fill="none" className="filter drop-shadow-lg overflow-visible">
            {/* Waddling Feet */}
            <motion.g
              animate={!isStomped ? { rotate: [-12, 12, -12], originX: '24px', originY: '46px' } : {}}
              transition={{ repeat: Infinity, duration: 0.28, ease: 'easeInOut' }}
            >
              <ellipse cx="14" cy="46" rx="8" ry="4.5" fill="#451A03" stroke="#1C0A00" strokeWidth="1.5" />
              <ellipse cx="34" cy="46" rx="8" ry="4.5" fill="#451A03" stroke="#1C0A00" strokeWidth="1.5" />
            </motion.g>

            {/* Mushroom Stem Body */}
            <path d="M14 44 C12 30 14 26 24 26 C34 26 36 30 34 44 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="2" />

            {/* Big Rounded Chestnut Cap */}
            <path d="M6 30 C3 12 14 4 24 4 C34 4 45 12 42 30 C34 32 14 32 6 30 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
            {/* Top Cap Highlights & Spots */}
            <ellipse cx="24" cy="11" rx="14" ry="4.5" fill="#B45309" opacity="0.8" />
            <circle cx="16" cy="18" r="3.5" fill="#FEF3C7" opacity="0.85" />
            <circle cx="33" cy="16" r="4" fill="#FEF3C7" opacity="0.85" />

            {/* Eyes (Grumpy or Dizzy X if stomped) */}
            {isStomped ? (
              <g>
                <text x="14" y="32" fontSize="11" fontWeight="black" fill="#451A03">×</text>
                <text x="27" y="32" fontSize="11" fontWeight="black" fill="#451A03">×</text>
              </g>
            ) : (
              <g>
                {/* Grumpy Eyebrows */}
                <path d="M14 20 L22 24" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M34 20 L26 24" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
                {/* Eyes */}
                <ellipse cx="18" cy="27" rx="3.5" ry="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
                <circle cx="19" cy="27" r="2" fill="#0F172A" />
                <circle cx="19.5" cy="26" r="0.8" fill="#FFFFFF" />

                <ellipse cx="30" cy="27" rx="3.5" ry="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
                <circle cx="29" cy="27" r="2" fill="#0F172A" />
                <circle cx="29.5" cy="26" r="0.8" fill="#FFFFFF" />

                {/* Cute Tiny Fangs */}
                <polygon points="19,34 21,37 23,34" fill="#FFFFFF" />
                <polygon points="25,34 27,37 29,34" fill="#FFFFFF" />
              </g>
            )}
          </svg>
        </motion.div>
      )}

      {/* 2. SPIKY: ARMORED SPIKY CRITTER (CANNOT BE STOMPED FROM ABOVE!) */}
      {type === 'spiky' && (
        <motion.div
          animate={
            isStomped
              ? { rotate: 180, y: 15, opacity: 0 }
              : { y: [0, -2, 0] }
          }
          transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }}
          className="relative flex flex-col items-center"
        >
          <svg width="52" height="46" viewBox="0 0 52 46" fill="none" className="filter drop-shadow-lg overflow-visible">
            {/* Walking Legs */}
            <circle cx="16" cy="40" r="4.5" fill="#B45309" stroke="#451A03" strokeWidth="1.5" />
            <circle cx="36" cy="40" r="4.5" fill="#B45309" stroke="#451A03" strokeWidth="1.5" />

            {/* Armored Spiky Shell (Bright Red) */}
            <path d="M8 36 C6 18 16 12 26 12 C36 12 46 18 44 36 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2.5" />
            
            {/* Dangerous Sharp Spikes! */}
            <polygon points="12,18 4,8 18,14" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <polygon points="26,12 26,0 31,13" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <polygon points="34,14 44,7 39,19" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

            {/* Face on side */}
            <ellipse cx="38" cy="30" rx="9" ry="7.5" fill="#FED7AA" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="41" cy="29" r="2.2" fill="#0F172A" />
            <circle cx="42" cy="28" r="0.8" fill="#FFFFFF" />
            <path d="M38 34 Q42 36 44 33" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>
      )}

      {/* 3. PIRANHA: CARNIVOROUS CHOMPER PLANT IN GREEN WARP PIPE */}
      {type === 'piranha' && (
        <div className="relative flex flex-col items-center">
          {/* Animated Snapping Head rising from Pipe */}
          <motion.div
            animate={{
              y: [28, -12, -12, 28],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              times: [0, 0.35, 0.65, 1],
              ease: 'easeInOut',
            }}
            className="relative z-0"
          >
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none" className="filter drop-shadow-md overflow-visible">
              {/* Green Stem & Leaves */}
              <rect x="20" y="24" width="6" height="24" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
              <ellipse cx="14" cy="36" rx="7" ry="4" fill="#22C55E" stroke="#15803D" strokeWidth="1" transform="rotate(-30 14 36)" />
              <ellipse cx="30" cy="36" rx="7" ry="4" fill="#22C55E" stroke="#15803D" strokeWidth="1" transform="rotate(30 30 36)" />

              {/* Snapping Head (Red with white spots) */}
              <circle cx="22" cy="16" r="14" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
              <circle cx="16" cy="11" r="3" fill="#FFFFFF" />
              <circle cx="28" cy="11" r="2.5" fill="#FFFFFF" />
              <circle cx="14" cy="20" r="2" fill="#FFFFFF" />

              {/* Sharp White Teeth & Wide Open Jaws */}
              <path d="M12 16 L32 16" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <polygon points="14,14 17,9 20,14" fill="#FFFFFF" />
              <polygon points="24,14 27,9 30,14" fill="#FFFFFF" />
              <polygon points="17,18 20,23 23,18" fill="#FFFFFF" />
              <polygon points="24,18 27,23 30,18" fill="#FFFFFF" />
            </svg>
          </motion.div>

          {/* Super Mario Iconic Green Warp Pipe */}
          <div className="relative z-10 -mt-2">
            <svg width="56" height="42" viewBox="0 0 56 42" fill="none" className="filter drop-shadow-lg">
              {/* Pipe Top Rim Lip */}
              <rect x="2" y="2" width="52" height="14" rx="3" fill="#16A34A" stroke="#052E16" strokeWidth="2.5" />
              <rect x="6" y="4" width="10" height="10" rx="1.5" fill="#4ADE80" opacity="0.6" />
              {/* Pipe Body Column */}
              <rect x="7" y="16" width="42" height="24" fill="#15803D" stroke="#052E16" strokeWidth="2.5" />
              <rect x="11" y="16" width="7" height="24" fill="#4ADE80" opacity="0.6" />
              <rect x="39" y="16" width="7" height="24" fill="#047857" opacity="0.8" />
            </svg>
          </div>
        </div>
      )}

      {/* 4. BEE: HOVERING BUZZY FOREST BEE */}
      {type === 'bee' && (
        <motion.div
          animate={
            isStomped
              ? { scale: 0.1, y: 15, opacity: 0 }
              : { y: [-6, 6, -6], rotate: [-4, 4, -4] }
          }
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          className="relative flex flex-col items-center"
        >
          <svg width="44" height="42" viewBox="0 0 44 42" fill="none" className="filter drop-shadow-md overflow-visible">
            {/* Fluttering Wings */}
            <motion.g
              animate={{ scaleY: [1, 0.3, 1], scaleX: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.12 }}
            >
              <ellipse cx="16" cy="10" rx="8" ry="12" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" transform="rotate(-30 16 10)" />
              <ellipse cx="26" cy="10" rx="8" ry="12" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" transform="rotate(30 26 10)" />
            </motion.g>

            {/* Striped Bee Body */}
            <ellipse cx="22" cy="24" rx="13" ry="10" fill="#FACC15" stroke="#78350F" strokeWidth="2" />
            <path d="M17 15 L17 33" stroke="#1E293B" strokeWidth="3" />
            <path d="M24 14 L24 34" stroke="#1E293B" strokeWidth="3" />

            {/* Cute Face & Antennae */}
            <circle cx="31" cy="22" r="2" fill="#0F172A" />
            <path d="M30 16 Q34 10 32 8" stroke="#1E293B" strokeWidth="1.5" fill="none" />
            <circle cx="32" cy="8" r="1.5" fill="#EF4444" />

            {/* Stinger */}
            <polygon points="9,24 4,22 4,26" fill="#1E293B" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
