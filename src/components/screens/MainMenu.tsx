import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerSaveData } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { audio } from '../../services/audio';

interface MainMenuProps {
  saveData: PlayerSaveData;
  onPlay: () => void;
  onOpenFarm?: () => void;
  onOpenMap: () => void;
  onOpenWords: () => void;
  onOpenBadges: () => void;
  onOpenCharacter: () => void;
  onOpenPS3Graphics?: () => void;
  onOpen3DRoom?: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onToggleLanguage: () => void;
  onResetProgress: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenFarm,
  onOpenMap,
  onOpenWords,
  onOpenBadges,
  onOpenCharacter,
  onOpenPS3Graphics,
  onOpen3DRoom,
  onToggleMusic,
  onToggleSfx,
  onToggleLanguage,
  onResetProgress,
}) => {
  const lang = saveData.languageMode || 'bilingual';
  const t = TRANSLATIONS[lang];
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Background Graphic: Clean Soft Cyber-Island & Farmland Atmosphere (Zero Human Figures) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Bar with Player Stats, Mute, & Settings */}
      <div className="relative z-10 w-full flex items-center justify-between">
        {/* Robot Character Mini Card */}
        <div
          onClick={onOpenCharacter}
          className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-amber-400 shadow-md cursor-pointer hover:border-amber-300 active:scale-95 transition-all"
        >
          {/* Robot Avatar Icon */}
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-slate-950 overflow-hidden flex items-center justify-center shadow">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="8" width="20" height="16" rx="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
              <rect x="9" y="11" width="14" height="10" rx="3" fill="#0F172A" />
              <circle cx="12.5" cy="15.5" r="2" fill="#38BDF8" />
              <circle cx="19.5" cy="15.5" r="2" fill="#38BDF8" />
              <line x1="16" y1="8" x2="16" y2="4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="4" r="2" fill="#FBBF24" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-amber-300 font-game leading-tight flex items-center gap-1">
              <span>{saveData.character.name || 'Robo-Cerdas'}</span>
              <span className="text-[10px]">🤖</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300">
              Lvl {saveData.level} Robot Penjelajah
            </span>
          </div>
        </div>

        {/* Currency & Audio & Language Controls */}
        <div className="flex items-center gap-2">
          {/* MUTE TOGGLE BUTTON (Prominent & Clear) */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-game font-black text-xs border-2 shadow cursor-pointer transition-all active:scale-95 ${
              isMuted
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white'
            }`}
            title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="text-[11px]">{isMuted ? 'BISU (MUTED)' : 'SUARA AKTIF'}</span>
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs shadow border-2 border-indigo-400 cursor-pointer font-game active:scale-95 transition-all"
            title="Pilih Bahasa"
          >
            <span>🇮🇩</span>
            <span className="hidden sm:inline">{lang === 'id' ? 'Indonesia' : lang === 'bilingual' ? 'Dwi-Bahasa' : 'English'}</span>
          </button>

          {/* Coins */}
          <div className="flex items-center gap-1 bg-amber-500/90 px-3 py-1 rounded-full text-xs font-black text-amber-950 font-game shadow">
            <span>🪙</span>
            <span>{saveData.coins}</span>
          </div>

          {/* Stars */}
          <div className="hidden xs:flex items-center gap-1 bg-yellow-400/90 px-3 py-1 rounded-full text-xs font-black text-yellow-950 font-game shadow">
            <span>⭐</span>
            <span>{saveData.stars}</span>
          </div>

          {/* BGM Toggle */}
          <button
            onClick={onToggleMusic}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow border cursor-pointer ${
              saveData.musicEnabled ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Musik Latar"
          >
            🎵
          </button>
        </div>
      </div>

      {/* Main Logo & Character Spotlight */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* SAHABAT KAFA OFFICIAL EDITION BADGE */}
          <div className="mb-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-amber-400/40 to-amber-500/30 border border-amber-400/80 text-amber-300 font-game font-black text-xs sm:text-sm tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 ring-1 ring-amber-300/40">
            <span className="animate-bounce">👑</span>
            <span>SAHABAT KAFA OFFICIAL EDITION</span>
            <span className="animate-bounce">⭐</span>
          </div>

          <div className="text-3xl md:text-5xl font-black text-white font-game drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)] tracking-wider flex items-center gap-2">
            <span>🤖</span>
            <span>PETUALANGAN</span>
            <span className="text-amber-400">PINTAR SD</span>
          </div>
          <div className="text-xs md:text-sm font-extrabold text-amber-200 font-game drop-shadow mt-1">
            Belajar 5 Mata Pelajaran SD & Petualangan Bertani Robot Harvest Moon
          </div>

          {/* 5 SD Subjects Badge Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
            {[
              { icon: '🇮🇩', label: 'B. Indonesia (Desk = Meja)' },
              { icon: '📐', label: 'Matematika' },
              { icon: '🔬', label: 'IPA Sains' },
              { icon: '🇬🇧', label: 'B. Inggris' },
              { icon: '🕌', label: 'Agama & Moral' },
            ].map(s => (
              <span
                key={s.label}
                className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/15 text-[10px] font-black text-amber-300 font-game shadow flex items-center gap-1"
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Big CTAs: Main Adventure + Harvest Moon Farming Mode */}
        <div className="mt-8 w-full max-w-md flex flex-col gap-3">
          {/* 1. Main 2.5D Adventure Mode */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playButtonClick();
              onPlay();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-slate-950 font-black text-xl md:text-2xl rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.5)] border-4 border-white font-game flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>{t.startPlaying}</span>
            <span>🚀</span>
          </motion.button>

          {/* 2. HARVEST MOON FARMING ADVENTURE MODE (Direct User Request) */}
          {onOpenFarm && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                audio.playButtonClick();
                onOpenFarm();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xl md:text-2xl rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.5)] border-4 border-white font-game flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>🚜</span>
              <span>KEBUN HARVEST MOON</span>
              <span>🌾</span>
            </motion.button>
          )}

          {/* 3. 3D INTERIOR ROOM EXPLORATION DIRECT BUTTON */}
          {onOpen3DRoom && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                audio.playDoorOpen();
                onOpen3DRoom();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-500 text-white font-black text-xl md:text-2xl rounded-2xl shadow-[0_10px_25px_rgba(99,102,241,0.5)] border-4 border-amber-300 font-game flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>🚪</span>
              <span>RUANGAN 3D INTERAKTIF</span>
              <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                REAL 3D
              </span>
            </motion.button>
          )}

          {/* PS3 HD Remaster Engine Status & Settings Button */}
          {onOpenPS3Graphics && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audio.playButtonClick();
                onOpenPS3Graphics();
              }}
              className="w-full py-2.5 px-4 bg-slate-950/80 hover:bg-slate-900/90 border-2 border-amber-400/80 rounded-2xl shadow-xl flex items-center justify-between text-amber-300 font-game cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">🎮</span>
                <div className="text-left">
                  <div className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>MODE GRAFIK PS3 HD</span>
                    <span className="text-[9px] bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                      AKTIF
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    God Rays, Parallax Bokeh, Rim-Light & Trophy
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">⚙️ ATUR</span>
            </motion.button>
          )}
        </div>

        {/* Secondary Navigation Grid with clear Indonesian subtitles */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl px-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playButtonClick();
              onOpenMap();
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border-2 border-blue-400/60 rounded-2xl flex flex-col items-center text-white shadow-lg backdrop-blur-sm cursor-pointer"
          >
            <span className="text-2xl">🗺️</span>
            <span className="text-xs font-black font-game mt-1">{t.worldMap}</span>
            <span className="text-[10px] text-slate-300">Peta Pulau SD</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playButtonClick();
              onOpenWords();
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border-2 border-emerald-400/60 rounded-2xl flex flex-col items-center text-white shadow-lg backdrop-blur-sm cursor-pointer"
          >
            <span className="text-2xl">🎒</span>
            <span className="text-xs font-black font-game mt-1">{t.myWords}</span>
            <span className="text-[10px] text-slate-300">Kamus Dwibahasa SD</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playButtonClick();
              onOpenBadges();
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border-2 border-yellow-400/60 rounded-2xl flex flex-col items-center text-white shadow-lg backdrop-blur-sm cursor-pointer"
          >
            <span className="text-2xl">🏆</span>
            <span className="text-xs font-black font-game mt-1">{t.badges}</span>
            <span className="text-[10px] text-slate-300">{saveData.unlockedBadges.length} Terkumpul</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playButtonClick();
              onOpenCharacter();
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border-2 border-cyan-400/60 rounded-2xl flex flex-col items-center text-white shadow-lg backdrop-blur-sm cursor-pointer"
          >
            <span className="text-2xl">🤖</span>
            <span className="text-xs font-black font-game mt-1">Ganti Robot</span>
            <span className="text-[10px] text-slate-300">Model & Armor Robot</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
        <span>PETUALANGAN ROBOT SD · 100% Karakter Robot Ramah Anak & Latar Nyaman</span>
        <button
          onClick={() => {
            if (window.confirm('Hapus dan ulang data petualangan?')) {
              onResetProgress();
            }
          }}
          className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
        >
          {t.resetData}
        </button>
      </div>
    </div>
  );
};
