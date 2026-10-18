import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PS3GraphicSettings, PS3TrophyNotification } from '../../types/game';

interface PS3GraphicsLayerProps {
  cameraX: number;
  worldWidth: number;
  worldHeight: number;
  worldScale: number;
  levelTheme: string;
  levelId: number;
  settings: PS3GraphicSettings;
  trophy: PS3TrophyNotification | null;
  onDismissTrophy: () => void;
}

export const DEFAULT_PS3_GRAPHICS: PS3GraphicSettings = {
  cleanBackgroundMode: true,
  bloomGlow: true,
  volumetricRays: true,
  parallaxBokeh: true,
  heroRimLight: true,
  cinematicVignette: true,
  dualshockPrompts: true,
  highDefShadows: true,
  cameraZoom: 'wide',
};

export const PS3GraphicsLayer: React.FC<PS3GraphicsLayerProps> = ({
  cameraX,
  worldWidth,
  worldHeight,
  worldScale,
  levelTheme,
  levelId,
  settings,
  trophy,
  onDismissTrophy,
}) => {
  // Theme-specific light colors & ambience (PS3 Color Grading)
  const getThemeAtmosphere = () => {
    switch (levelId) {
      case 1: // Little Home
        return {
          rayColor: 'from-amber-300/20 via-yellow-200/5 to-transparent',
          bokehColors: ['bg-amber-300/30', 'bg-yellow-400/25', 'bg-orange-300/20'],
          particleEmoji: ['✨', '🌟', '✨', '🍂'],
          ambientTint: 'bg-gradient-to-b from-amber-500/5 via-transparent to-black/15',
        };
      case 2: // Forest Adventure
        return {
          rayColor: 'from-emerald-300/20 via-teal-200/5 to-transparent',
          bokehColors: ['bg-emerald-300/30', 'bg-lime-400/25', 'bg-teal-300/20'],
          particleEmoji: ['🍃', '✨', '✨', '🍃'],
          ambientTint: 'bg-gradient-to-b from-emerald-600/5 via-transparent to-black/20',
        };
      case 3: // Sekolah Ceria (Classroom)
        return {
          rayColor: 'from-amber-100/15 via-sky-100/5 to-transparent',
          bokehColors: ['bg-sky-300/25', 'bg-indigo-300/20', 'bg-amber-200/25'],
          particleEmoji: ['✨', '🌟', '✨', '⭐'],
          ambientTint: 'bg-gradient-to-b from-amber-500/5 via-transparent to-black/15',
        };
      case 4: // Pasar Kuliner
        return {
          rayColor: 'from-rose-300/20 via-amber-200/5 to-transparent',
          bokehColors: ['bg-rose-400/25', 'bg-amber-400/25', 'bg-yellow-300/20'],
          particleEmoji: ['✨', '🌟', '✨', '🏮'],
          ambientTint: 'bg-gradient-to-b from-rose-500/5 via-transparent to-black/15',
        };
      case 5: // Safari Fauna
        return {
          rayColor: 'from-amber-400/20 via-orange-300/5 to-transparent',
          bokehColors: ['bg-amber-400/25', 'bg-orange-400/25', 'bg-yellow-200/20'],
          particleEmoji: ['🍃', '✨', '🌟', '🌾'],
          ambientTint: 'bg-gradient-to-b from-amber-600/5 via-transparent to-black/20',
        };
      case 6: // Crystal Cavern
        return {
          rayColor: 'from-cyan-300/25 via-fuchsia-300/10 to-transparent',
          bokehColors: ['bg-cyan-300/30', 'bg-fuchsia-400/25', 'bg-purple-300/25'],
          particleEmoji: ['💎', '✨', '🔷', '⭐'],
          ambientTint: 'bg-gradient-to-b from-indigo-950/20 via-transparent to-black/25',
        };
      case 7: // Cosmic Space
      default:
        return {
          rayColor: 'from-violet-400/25 via-pink-300/10 to-transparent',
          bokehColors: ['bg-violet-400/30', 'bg-pink-400/25', 'bg-amber-300/20'],
          particleEmoji: ['🚀', '✨', '🌟', '🪐'],
          ambientTint: 'bg-gradient-to-b from-purple-950/25 via-transparent to-black/30',
        };
    }
  };

  const atmo = getThemeAtmosphere();

  return (
    <>
      {/* ======================================================== */}
      {/* 1. CINEMATIC POST-PROCESSING & VIGNETTE (PS3 ENGINES)   */}
      {/* ======================================================== */}
      {settings.cinematicVignette && (
        <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
          {/* Subtle HDR edge falloff */}
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55)] md:shadow-[inset_0_0_180px_rgba(0,0,0,0.65)]" />
          {/* Top subtle letterbox tint */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          {/* Bottom subtle shadow grounding */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Atmospheric Theme Color Grading */}
      <div className={`absolute inset-0 pointer-events-none z-[380] ${atmo.ambientTint}`} />

      {/* ======================================================== */}
      {/* 2. VOLUMETRIC GOD RAYS & SUN SHAFTS (CELL PROCESSOR HDR) */}
      {/* ======================================================== */}
      {settings.volumetricRays && (
        <div
          className="absolute top-0 left-0 pointer-events-none z-[350] overflow-hidden will-change-transform"
          style={{
            width: `${worldWidth}px`,
            height: `${worldHeight}px`,
            transform: `scale(${worldScale}) translateX(-${cameraX * 0.9}px)`,
            transformOrigin: 'top left',
          }}
        >
          {/* Dynamic Light Streams filtering through canopy / windows */}
          {[280, 850, 1550, 2300, 3100, 3950].map((rayX, i) => (
            <motion.div
              key={rayX}
              animate={{
                opacity: [0.35, 0.75, 0.4],
                skewX: [-14, -10, -14],
              }}
              transition={{
                duration: 5 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute top-0 w-80 h-full bg-gradient-to-b ${atmo.rayColor} blur-xl pointer-events-none`}
              style={{ left: `${rayX}px` }}
            />
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. 2.5D FOREGROUND PARALLAX DEPTH LAYER (BOKEH & MOTES) */}
      {/* Passes faster in front of the camera (1.35x parallax)   */}
      {/* ======================================================== */}
      {settings.parallaxBokeh && (
        <div
          className="absolute inset-0 pointer-events-none z-[450] overflow-hidden will-change-transform"
          style={{
            transform: `translateX(-${(cameraX * 1.35) % 1200}px)`,
            width: '2400px',
          }}
        >
          {/* Foreground Out-Of-Focus Bokeh Spheres (Lens Blur Depth) */}
          {[
            { id: 1, x: 120, y: 80, size: 90, color: atmo.bokehColors[0] },
            { id: 2, x: 420, y: 340, size: 70, color: atmo.bokehColors[1] },
            { id: 3, x: 780, y: 120, size: 110, color: atmo.bokehColors[2] },
            { id: 4, x: 1100, y: 410, size: 85, color: atmo.bokehColors[0] },
            { id: 5, x: 1450, y: 95, size: 100, color: atmo.bokehColors[1] },
            { id: 6, x: 1820, y: 320, size: 75, color: atmo.bokehColors[2] },
            { id: 7, x: 2150, y: 140, size: 120, color: atmo.bokehColors[0] },
          ].map(b => (
            <motion.div
              key={b.id}
              animate={{
                y: [0, -15, 0],
                opacity: [0.25, 0.55, 0.25],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 4 + b.id,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute rounded-full blur-md ${b.color}`}
              style={{
                left: `${b.x}px`,
                top: `${b.y}px`,
                width: `${b.size}px`,
                height: `${b.size}px`,
              }}
            />
          ))}

          {/* Drifting Golden Embers & Spores */}
          {[
            { id: 101, x: 200, y: 220, emoji: atmo.particleEmoji[0] },
            { id: 102, x: 580, y: 180, emoji: atmo.particleEmoji[1] },
            { id: 103, x: 920, y: 280, emoji: atmo.particleEmoji[2] },
            { id: 104, x: 1320, y: 160, emoji: atmo.particleEmoji[3] || '✨' },
            { id: 105, x: 1720, y: 240, emoji: atmo.particleEmoji[0] },
            { id: 106, x: 2050, y: 190, emoji: atmo.particleEmoji[1] },
          ].map(p => (
            <motion.div
              key={p.id}
              animate={{
                x: [0, 45, 0],
                y: [0, -25, 0],
                rotate: [0, 40, -10, 0],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 5 + (p.id % 4),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute text-lg filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. AUTHENTIC PS3 TROPHY POPUP NOTIFICATION               */}
      {/* Slides in from top right with classic dual-tone shine    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {trophy && (
          <motion.div
            initial={{ opacity: 0, x: 160, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 160, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="fixed top-4 right-4 z-[999] pointer-events-auto cursor-pointer max-w-sm"
            onClick={onDismissTrophy}
          >
            {/* PS3 Trophy Card Design (Glossy Piano Black + Gold Rim) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-2 border-amber-400/80 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(251,191,36,0.35)] backdrop-blur-xl p-3.5 flex items-center gap-3.5 group">
              {/* Top Glass Sheen */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

              {/* Trophy Icon with Tier Ring */}
              <div className="relative shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-2 ${
                    trophy.tier === 'platinum'
                      ? 'bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-600 border-cyan-200 shadow-cyan-500/50'
                      : trophy.tier === 'gold'
                      ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 border-amber-200 shadow-amber-500/50'
                      : trophy.tier === 'silver'
                      ? 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 border-white shadow-slate-400/50'
                      : 'bg-gradient-to-br from-amber-700 via-orange-800 to-stone-900 border-amber-600 shadow-orange-700/50'
                  }`}
                >
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {trophy.icon || '🏆'}
                  </motion.span>
                </div>
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-amber-400/30 blur-sm -z-10 animate-pulse" />
              </div>

              {/* Trophy Text Information */}
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 font-game flex items-center gap-1">
                    <span>🎮</span>
                    <span>TROPHY UNLOCKED</span>
                  </span>
                  <span
                    className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full font-game ${
                      trophy.tier === 'platinum'
                        ? 'bg-cyan-400 text-slate-950'
                        : trophy.tier === 'gold'
                        ? 'bg-amber-400 text-slate-950'
                        : trophy.tier === 'silver'
                        ? 'bg-slate-200 text-slate-900'
                        : 'bg-amber-800 text-amber-100'
                    }`}
                  >
                    {trophy.tier}
                  </span>
                </div>
                <h4 className="text-white font-black text-sm font-game truncate mt-0.5 group-hover:text-amber-200 transition-colors">
                  {trophy.title}
                </h4>
                <p className="text-slate-300 text-xs truncate mt-0.5">
                  {trophy.description}
                </p>
              </div>

              {/* Close Button / Tap to dismiss */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissTrophy();
                }}
                className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="Tutup Notifikasi"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
