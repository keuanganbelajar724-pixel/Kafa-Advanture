import React, { useState } from 'react';
import { motion } from 'motion/react';
import { audio } from '../../services/audio';
import coverArt from '../../assets/images/robot_adventure_cover_1791412981632.jpg';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const handleEnter = () => {
    audio.playButtonClick();
    audio.playCoin();
    audio.startAmbientMusic();
    onStart();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-sky-900 flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Background Graphic */}
      <img
        src={coverArt}
        alt="Petualangan Pintar Robot Cover"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-sky-950/60 pointer-events-none" />

      {/* Top Header & Mute Button */}
      <div className="relative z-10 pt-6 w-full max-w-4xl flex items-center justify-between px-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 bg-amber-400 text-amber-950 font-black rounded-full text-xs uppercase tracking-widest font-game shadow-lg border-2 border-amber-200 flex items-center gap-1.5"
        >
          <span>👑</span>
          <span>Edisi Resmi Sahabat Kafa • Game Petualangan Robot SD</span>
        </motion.div>

        {/* Quick MUTE Button */}
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-game font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all ${
            isMuted
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
              : 'bg-slate-900/80 hover:bg-slate-800 border-white/30 text-white'
          }`}
          title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span>{isMuted ? 'BISU (MUTED)' : 'SUARA'}</span>
        </button>
      </div>

      {/* Center Title Logo */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4">
        {/* SAHABAT KAFA OFFICIAL BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/35 via-amber-400/50 to-amber-500/35 border-2 border-amber-300 text-amber-200 font-game font-black text-xs sm:text-sm tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center gap-2"
        >
          <span>👑</span>
          <span>SAHABAT KAFA OFFICIAL EDITION</span>
          <span>👑</span>
        </motion.div>

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-4xl sm:text-5xl md:text-7xl font-black text-white font-game drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] tracking-wide leading-tight"
        >
          PETUALANGAN PINTAR<br />
          <span className="text-amber-400 drop-shadow-[0_6px_18px_rgba(245,158,11,0.7)]">ROBOT SD</span>
        </motion.h1>

        {/* Multi-Subject Badges for Grade 1 SD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="px-3 py-1 rounded-full bg-sky-500/90 text-white border border-sky-300 text-xs font-black font-game shadow flex items-center gap-1">
            <span>📐</span>
            <span>Matematika</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white border border-emerald-300 text-xs font-black font-game shadow flex items-center gap-1">
            <span>🔬</span>
            <span>IPA Sains</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-200 text-xs font-black font-game shadow flex items-center gap-1">
            <span>🇬🇧</span>
            <span>B. Inggris</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-rose-500/90 text-white border border-rose-300 text-xs font-black font-game shadow flex items-center gap-1">
            <span>🇮🇩</span>
            <span>B. Indonesia</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-3 flex flex-col items-center gap-1"
        >
          <span className="text-base sm:text-lg md:text-xl font-black text-amber-100 font-game drop-shadow">
            Belajar Semua Pelajaran SD Sambil Berpetualang Ceria!
          </span>
          <span className="text-xs md:text-sm text-sky-200 font-bold">
            Tantangan Khusus Anak Kelas 1 SD • Bersuara Pengucapan & Kuis Interaktif 🇮🇩
          </span>
        </motion.div>
      </div>

      {/* Bottom Start Tap CTA */}
      <div className="relative z-10 pb-10 w-full max-w-xs flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnter}
          className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.6)] border-4 border-white font-game flex items-center justify-center gap-3 animate-pulse cursor-pointer"
        >
          <span>AYO MAIN SEKARANG</span>
          <span>🎮</span>
        </motion.button>
        <span className="mt-3 text-xs text-slate-300 font-semibold drop-shadow">
          Cocok untuk anak usia 6–10 tahun
        </span>
      </div>
    </div>
  );
};
