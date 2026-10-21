import React from 'react';
import { motion } from 'motion/react';

export interface RoboHeroProps {
  gender?: 'boy' | 'girl'; // backward compatibility
  robotModel?: string;
  outfitColor?: string;
  backpackColor?: string;
  hat?: string;
  state: 'idle' | 'walking' | 'running' | 'jumping' | 'celebrating';
  facing: 'left' | 'right';
  jumpZ: number;
  isPowerActive?: boolean;
  isSahabatKafaBuff?: boolean;
}

export const RoboHero: React.FC<RoboHeroProps> = ({
  outfitColor = '#0EA5E9',
  backpackColor = '#F59E0B',
  hat = 'antenna',
  state,
  facing,
  jumpZ,
  isPowerActive = false,
  isSahabatKafaBuff = false,
}) => {
  const isWalking = state === 'walking' || state === 'running';
  const isJumping = state === 'jumping' || jumpZ > 2;
  const isIdle = state === 'idle';
  const isCelebrating = state === 'celebrating';

  const primaryColor = outfitColor || '#0EA5E9';
  const packColor = backpackColor || '#F59E0B';

  return (
    <div
      className={`relative will-change-transform ${
        facing === 'left' ? '-scale-x-100' : 'scale-x-100'
      }`}
      style={{
        transform: `translateY(-${jumpZ}px)`,
      }}
    >
      {/* SAHABAT KAFA CELESTIAL CROWN & ENERGY AURA */}
      {(isSahabatKafaBuff || isPowerActive) && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 select-none">
          {/* Glowing Divine Golden Crown with Floating Animation */}
          <motion.div
            animate={{ y: [-3, 3, -3], scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="text-2xl filter drop-shadow-[0_0_12px_rgba(245,158,11,1)]">👑</div>
            <div className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[7px] tracking-wider uppercase shadow-md border border-yellow-100 font-game whitespace-nowrap">
              SAHABAT KAFA
            </div>
          </motion.div>
          {/* Golden Pulse Shockwave Ring */}
          <div className="absolute top-2 w-16 h-8 rounded-full border-2 border-amber-300/80 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-ping opacity-60" />
        </div>
      )}

      {/* TURBO SPRINT SPEEDLINE PARTICLES */}
      {state === 'running' && (
        <div className="absolute -left-8 top-8 flex flex-col gap-2 pointer-events-none z-10 select-none">
          <motion.div
            animate={{ opacity: [0.8, 0, 0.8], x: [0, -16, 0] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
          <motion.div
            animate={{ opacity: [0.9, 0.1, 0.9], x: [-4, -20, -4] }}
            transition={{ repeat: Infinity, duration: 0.25 }}
            className="w-10 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          />
          <motion.div
            animate={{ opacity: [0.7, 0, 0.7], x: [2, -14, 2] }}
            transition={{ repeat: Infinity, duration: 0.18 }}
            className="w-6 h-1 rounded-full bg-gradient-to-r from-sky-300 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
        </div>
      )}

      {/* Ultra-Smooth GPU-Composited Robot Body Animation with Console Squash & Stretch */}
      <div
        className={`will-change-transform ${
          isWalking ? 'animate-robo-walk' : isIdle ? 'animate-robo-idle' : ''
        }`}
        style={
          isJumping
            ? { transform: 'scale(0.92, 1.14) translateY(-3px)' }
            : state === 'running'
            ? { transform: 'scale(1.05, 0.96) skewX(-4deg)' }
            : isCelebrating
            ? { transform: 'translateY(-6px) scale(1.08)' }
            : undefined
        }
      >
        <svg width="98" height="124" viewBox="0 0 114 144" fill="none" className="filter drop-shadow-2xl overflow-visible">
          {/* DEFINITIONS & GRADIENTS FOR HIGH-TECH METALLIC ROBOT SHADING */}
          <defs>
            <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="40%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="visorScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#090D16" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="armorPaintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="70%" stopColor={primaryColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="coreReactorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="boosterFireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* 1. CYBER ROCKET BOOSTER / BATTERY BACKPACK */}
          <g>
            {/* Main Cyber Tank */}
            <rect x="10" y="48" width="26" height="42" rx="10" fill={packColor} stroke="#0F172A" strokeWidth="2.5" />
            {/* Battery Level Indicators */}
            <rect x="15" y="55" width="16" height="4" rx="2" fill="#22C55E" />
            <rect x="15" y="62" width="16" height="4" rx="2" fill="#22C55E" />
            <rect x="15" y="69" width="16" height="4" rx="2" fill="#EAB308" />
            <rect x="15" y="76" width="16" height="4" rx="2" fill="#38BDF8" />
            {/* Thruster Nozzle Exhaust */}
            <rect x="14" y="88" width="8" height="6" rx="2" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="24" y="88" width="8" height="6" rx="2" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />

            {/* Jumping Rocket Thruster Plasma Flames */}
            {isJumping && (
              <motion.g
                animate={{ scaleY: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
              >
                <path d="M14 94 L18 114 L22 94 Z" fill="url(#boosterFireGrad)" />
                <path d="M24 94 L28 114 L32 94 Z" fill="url(#boosterFireGrad)" />
              </motion.g>
            )}
          </g>

          {/* 2. ROBOTIC LEGS & MAGNETIC STRIDE FEET */}
          <g>
            {/* BACK / LEFT ROBOT LEG */}
            <motion.g
              animate={
                isWalking
                  ? { rotate: [-24, 24, -24], originX: '42px', originY: '95px' }
                  : isJumping
                  ? { rotate: -30, originX: '42px', originY: '95px' }
                  : { rotate: 0 }
              }
              transition={isWalking ? { repeat: Infinity, duration: 0.35, ease: 'easeInOut' } : { duration: 0.15 }}
            >
              {/* Hydraulic Thigh & Shin */}
              <rect x="36" y="93" width="12" height="25" rx="5" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="2" />
              {/* Cyber Knee Joint Bolt */}
              <circle cx="42" cy="104" r="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
              {/* Magnetic Foot Boot */}
              <rect x="28" y="117" width="26" height="12" rx="5" fill="#334155" stroke="#0F172A" strokeWidth="2" />
              {/* Glowing Soles */}
              <rect x="30" y="125" width="22" height="3" rx="1.5" fill="#38BDF8" />
            </motion.g>

            {/* FRONT / RIGHT ROBOT LEG */}
            <motion.g
              animate={
                isWalking
                  ? { rotate: [24, -24, 24], originX: '64px', originY: '95px' }
                  : isJumping
                  ? { rotate: 26, y: -6, originX: '64px', originY: '95px' }
                  : { rotate: 0 }
              }
              transition={isWalking ? { repeat: Infinity, duration: 0.35, ease: 'easeInOut' } : { duration: 0.15 }}
            >
              {/* Hydraulic Thigh & Shin */}
              <rect x="58" y="93" width="12" height="25" rx="5" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="2" />
              {/* Cyber Knee Joint Bolt */}
              <circle cx="64" cy="104" r="3.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
              {/* Magnetic Foot Boot */}
              <rect x="50" y="117" width="26" height="12" rx="5" fill="#334155" stroke="#0F172A" strokeWidth="2" />
              {/* Glowing Soles */}
              <rect x="52" y="125" width="22" height="3" rx="1.5" fill="#38BDF8" />
            </motion.g>
          </g>

          {/* 3. ROBOTIC TORSO & ARC REACTOR CHEST */}
          <g>
            {/* Waist Hydraulic Swivel */}
            <rect x="38" y="86" width="34" height="9" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="55" cy="90" r="3" fill="#E2E8F0" />

            {/* Main Robot Armor Chestplate */}
            <rect x="30" y="47" width="50" height="43" rx="12" fill="url(#armorPaintGrad)" stroke="#0F172A" strokeWidth="2.5" />

            {/* Chest Center High-Tech Arc Reactor Core */}
            <circle cx="55" cy="67" r="9" fill="url(#coreReactorGrad)" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="55" cy="67" r="5" fill="#E0F2FE" />
            {/* Core Glow Pulse */}
            <motion.circle
              cx="55"
              cy="67"
              r="7"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              animate={{ r: [6, 9, 6], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Shoulder Armor Pauldrons */}
            <rect x="22" y="47" width="14" height="10" rx="4" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="74" y="47" width="14" height="10" rx="4" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="1.5" />
          </g>

          {/* 4. MECHANICAL ARMS & CYBER CLAW HANDS */}
          <g>
            {/* BACK MECHANICAL ARM */}
            <motion.g
              animate={
                isWalking
                  ? { rotate: [26, -26, 26], originX: '26px', originY: '52px' }
                  : isJumping
                  ? { rotate: 30, originX: '26px', originY: '52px' }
                  : isCelebrating
                  ? { rotate: -130, originX: '26px', originY: '52px' }
                  : { rotate: 0 }
              }
              transition={isWalking ? { repeat: Infinity, duration: 0.35, ease: 'easeInOut' } : { duration: 0.15 }}
            >
              {/* Arm Segment */}
              <rect x="18" y="52" width="11" height="28" rx="5" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="2" />
              {/* Wrist Joint */}
              <circle cx="23.5" cy="78" r="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />
              {/* Cyber Gripper Claws */}
              <path d="M19 82 C16 88 20 92 24 92 C28 92 32 88 29 82 Z" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
            </motion.g>

            {/* FRONT MECHANICAL ARM (RAISED JUMP POSE OR CELEBRATE) */}
            <motion.g
              animate={
                isWalking
                  ? { rotate: [-26, 26, -26], originX: '82px', originY: '52px' }
                  : isJumping
                  ? { rotate: -145, originX: '82px', originY: '52px' }
                  : isCelebrating
                  ? { rotate: -130, originX: '82px', originY: '52px' }
                  : { rotate: 0 }
              }
              transition={isWalking ? { repeat: Infinity, duration: 0.35, ease: 'easeInOut' } : { duration: 0.15 }}
            >
              {/* Arm Segment */}
              <rect x="79" y="52" width="11" height="28" rx="5" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="2" />
              {/* Wrist Joint */}
              <circle cx="84.5" cy="78" r="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="1" />
              {/* Cyber Gripper Claws */}
              <path d="M80 82 C77 88 81 92 85 92 C89 92 93 88 90 82 Z" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
              {/* Palm Repulsor Light */}
              <circle cx="85" cy="86" r="2.5" fill="#38BDF8" />
            </motion.g>
          </g>

          {/* 5. CUTE EXPRESSIVE ROBOT HEAD & GLOWING LED VISOR (100% NON-HUMAN) */}
          <motion.g
            animate={
              isIdle
                ? { rotate: [0, 1.5, 0, -1.5, 0], originX: '55px', originY: '35px' }
                : isJumping
                ? { y: -2, rotate: 2 }
                : isCelebrating
                ? { rotate: [0, -5, 5, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            {/* Robot Neck Cylinder */}
            <rect x="49" y="42" width="12" height="7" rx="2" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />

            {/* Robot Ear Audio Bolts */}
            <g>
              <rect x="23" y="22" width="6" height="18" rx="3" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="26" cy="31" r="3" fill="#38BDF8" />
              <rect x="81" y="22" width="6" height="18" rx="3" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="84" cy="31" r="3" fill="#38BDF8" />
            </g>

            {/* Rounded Friendly Robot Head Chassis */}
            <rect x="27" y="10" width="56" height="35" rx="14" fill="url(#chassisGrad)" stroke="#0F172A" strokeWidth="2.5" />

            {/* Glossy Black Visor Screen */}
            <rect x="33" y="16" width="44" height="23" rx="9" fill="url(#visorScreenGrad)" stroke="#334155" strokeWidth="1.5" />

            {/* Visor Glass Glare / Glossy Reflection */}
            <path d="M37 18 Q55 17 73 19 L71 23 Q55 21 39 23 Z" fill="#FFFFFF" opacity="0.3" />

            {/* EXPRESSIVE GLOWING CYAN LED EYES (NO HUMAN FACE!) */}
            {isCelebrating ? (
              /* Joyful Arched LED Happy Eyes ^ _ ^ */
              <g>
                <path d="M42 29 Q47 23 52 29" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M58 29 Q63 23 68 29" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Cheerful Robot Cheek Lights */}
                <circle cx="39" cy="32" r="2.5" fill="#F43F5E" opacity="0.8" />
                <circle cx="71" cy="32" r="2.5" fill="#F43F5E" opacity="0.8" />
              </g>
            ) : isJumping ? (
              /* Star Eyes for Superpower Jump! ★ ★ */
              <g>
                <text x="40" y="32" fill="#FBBF24" fontSize="13" fontWeight="bold">★</text>
                <text x="59" y="32" fill="#FBBF24" fontSize="13" fontWeight="bold">★</text>
              </g>
            ) : (
              /* Friendly Round Glowing Robot Eyes with Digital Pupils */
              <g>
                {/* Left LED Eye */}
                <ellipse cx="46" cy="27" rx="5" ry="6" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="47" cy="26" r="2.5" fill="#E0F2FE" />
                {/* Right LED Eye */}
                <ellipse cx="64" cy="27" rx="5" ry="6" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="65" cy="26" r="2.5" fill="#E0F2FE" />
                {/* Cute Mini Mouth LED Pixel Bar */}
                <line x1="52" y1="33" x2="58" y2="33" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* 6. ROBOT HEAD ACCESSORIES (ANTENNA, RADAR, OR PROPELLER) */}
            {hat === 'radar' ? (
              <g>
                <line x1="55" y1="10" x2="55" y2="2" stroke="#475569" strokeWidth="2.5" />
                <ellipse cx="55" cy="2" rx="9" ry="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="55" cy="2" r="2" fill="#FBBF24" />
              </g>
            ) : hat === 'propeller' ? (
              <g>
                <line x1="55" y1="10" x2="55" y2="3" stroke="#475569" strokeWidth="2.5" />
                <rect x="37" y="1" width="36" height="3" rx="1.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
                <circle cx="55" cy="2.5" r="2" fill="#FBBF24" />
              </g>
            ) : hat === 'horns' ? (
              <g>
                <path d="M38 10 L34 2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                <circle cx="34" cy="2" r="2.5" fill="#FBBF24" />
                <path d="M72 10 L76 2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                <circle cx="76" cy="2" r="2.5" fill="#FBBF24" />
              </g>
            ) : (
              /* Default: Cute Cyber Antenna with Pulsing Beacon */
              <g>
                <line x1="55" y1="10" x2="55" y2="1" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                <circle cx="55" cy="1" r="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="55" cy="1" r="2.5" fill="#FEF08A" />
                {/* Antenna Signal Ring */}
                <motion.circle
                  cx="55"
                  cy="1"
                  r="7"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  animate={{ r: [5, 9, 5], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                />
              </g>
            )}
          </motion.g>
        </svg>
      </div>
    </div>
  );
};

export const FacelessCharacter = RoboHero;
