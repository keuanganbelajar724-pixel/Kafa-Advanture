import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PS3GraphicSettings } from '../../types/game';
import { audio } from '../../services/audio';

interface PS3GraphicsModalProps {
  isOpen: boolean;
  settings: PS3GraphicSettings;
  onUpdateSettings: (newSettings: PS3GraphicSettings) => void;
  onClose: () => void;
  onTestTrophy?: () => void;
}

export const PS3GraphicsModal: React.FC<PS3GraphicsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  onTestTrophy,
}) => {
  if (!isOpen) return null;

  const toggleSetting = (key: keyof PS3GraphicSettings) => {
    audio.playButtonClick();
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleTestTrophy = () => {
    audio.playTrophyUnlock();
    if (onTestTrophy) onTestTrophy();
  };

  const isAllMax = Object.values(settings).every(Boolean);

  const enableAll = () => {
    audio.playPowerUp();
    onUpdateSettings({
      cleanBackgroundMode: true,
      bloomGlow: true,
      volumetricRays: true,
      parallaxBokeh: true,
      heroRimLight: true,
      cinematicVignette: true,
      dualshockPrompts: true,
      highDefShadows: true,
    });
  };

  const enableStandard = () => {
    audio.playButtonClick();
    onUpdateSettings({
      cleanBackgroundMode: true,
      bloomGlow: false,
      volumetricRays: false,
      parallaxBokeh: false,
      heroRimLight: false,
      cinematicVignette: false,
      dualshockPrompts: false,
      highDefShadows: false,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-3 border-amber-400/80 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(251,191,36,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Glass Gloss */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

          {/* Modal Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-2xl shadow-lg border-2 border-white/30">
                🎮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-game">
                    GRAPHICS ENGINE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    PS3 HD REMASTER
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-game">
                  Pengaturan Visual & Konsol
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playButtonClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-sm">
            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={enableAll}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 font-game transition-all cursor-pointer ${
                  isAllMax
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <span>✨</span>
                  <span>ULTRA PS3 HD</span>
                </div>
                <span className="text-[10px] text-slate-400 text-center">
                  Semua efek visual konsol aktif (Rekomendasi!)
                </span>
              </button>

              <button
                onClick={enableStandard}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 font-game transition-all cursor-pointer ${
                  !isAllMax
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-indigo-400/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <span>⚡</span>
                  <span>MODE HEMAT</span>
                </div>
                <span className="text-[10px] text-slate-400 text-center">
                  Visual standar ringan untuk perangkat lama
                </span>
              </button>
            </div>

            {/* Individual Graphics Toggles */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-game">
                Detail Efek Grafis & Kejernihan Visual:
              </h4>

              {/* Toggle 0: Mode Latar Bersih & Jernih (Fokus Bermain) */}
              <div
                onClick={() => toggleSetting('cleanBackgroundMode')}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/60 hover:from-emerald-950/60 border border-emerald-400/40 cursor-pointer transition-colors shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌿</span>
                  <div>
                    <div className="font-bold text-emerald-300 font-game text-xs md:text-sm flex items-center gap-1.5">
                      <span>Latar Bersih & Luas (Fokus Bermain)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">DIREKOMENDASIKAN</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Mengurangi keramaian latar agar karakter, benda, & jalur pijakan terlihat sangat jelas
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                    settings.cleanBackgroundMode ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.cleanBackgroundMode ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 1: Volumetric God Rays */}
              <div
                onClick={() => toggleSetting('volumetricRays')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">☀️</span>
                  <div>
                    <div className="font-bold text-white font-game text-xs md:text-sm">
                      Volumetric God Rays (Sinar Matahari 3D)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Berkas cahaya matahari sinematik menembus dedaunan & jendela
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.volumetricRays ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.volumetricRays ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 2: 2.5D Parallax Bokeh & Floating Motes */}
              <div
                onClick={() => toggleSetting('parallaxBokeh')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔮</span>
                  <div>
                    <div className="font-bold text-white font-game text-xs md:text-sm">
                      2.5D Foreground Parallax & Bokeh
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Efek kedalaman lensa kamera, partikel melayang di depan layar
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.parallaxBokeh ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.parallaxBokeh ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 3: Hero Rim-Light */}
              <div
                onClick={() => toggleSetting('heroRimLight')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <div className="font-bold text-white font-game text-xs md:text-sm">
                      Hero Rim-Lighting (Siluet 3D Karakter)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Pencahayaan Fresnel tepi tubuh membuat model 3D menonjol
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.heroRimLight ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.heroRimLight ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 4: Cinematic Vignette */}
              <div
                onClick={() => toggleSetting('cinematicVignette')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎬</span>
                  <div>
                    <div className="font-bold text-white font-game text-xs md:text-sm">
                      Cinematic Vignette & Grading
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Gradasi kontras sinematik pada tepi layar ala konsol
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.cinematicVignette ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.cinematicVignette ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Toggle 5: DualShock Controller Button Badges */}
              <div
                onClick={() => toggleSetting('dualshockPrompts')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎮</span>
                  <div>
                    <div className="font-bold text-white font-game text-xs md:text-sm">
                      Tombol PS3 DualShock (△ ◯ ✕ ▢)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Tampilkan ikon kontrol khas PlayStation pada layar aksi
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    settings.dualshockPrompts ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-slate-950 shadow-md"
                    animate={{ x: settings.dualshockPrompts ? 24 : 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Test PS3 Trophy Chime */}
            <div className="pt-2">
              <button
                onClick={handleTestTrophy}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400/60 hover:border-amber-400 text-amber-300 font-black font-game text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-md"
              >
                <span>🏆</span>
                <span>TES DING TROPHY PS3 (Chime Kristal)</span>
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Bunyikan!
                </span>
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 flex justify-end">
            <button
              onClick={() => {
                audio.playButtonClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-game text-sm shadow-xl cursor-pointer active:scale-95 transition-all"
            >
              SIMPAN & KEMBALI 🚀
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
