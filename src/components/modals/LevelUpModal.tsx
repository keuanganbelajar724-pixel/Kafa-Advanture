import React from 'react';
import { motion } from 'motion/react';
import { audio } from '../../services/audio';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  return (
    <div className="fixed inset-0 z-[970] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.5, rotate: 8, opacity: 0 }}
        className="relative w-full max-w-xs bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(251,191,36,0.8)] border-4 border-white text-center flex flex-col items-center text-white"
      >
        {/* Level Star Badge */}
        <div className="w-24 h-24 bg-white rounded-full border-4 border-yellow-300 shadow-xl flex items-center justify-center text-amber-500 text-5xl font-black font-game -mt-12 animate-pulse">
          {newLevel}
        </div>

        <div className="mt-3 text-3xl font-black text-white font-game drop-shadow-md tracking-wider uppercase">
          NAIK LEVEL!
        </div>

        <div className="mt-1 text-sm font-extrabold text-amber-100 font-game">
          Sekarang kamu Petualang Level {newLevel}!
        </div>

        <div className="mt-4 w-full bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl border border-white/30 text-xs font-bold leading-relaxed text-left">
          ⭐ Karakter bergerak lebih gesit!
          <br />
          ⭐ Wilayah baru & kata-kata baru siap dijelajahi!
          <br />
          ⭐ Bintang & bonus koin bertambah!
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="mt-6 w-full py-3 bg-white hover:bg-amber-50 text-amber-900 font-black text-base rounded-2xl shadow-xl font-game cursor-pointer"
        >
          Hore! Lanjutkan ⭐
        </motion.button>
      </motion.div>
    </div>
  );
};
