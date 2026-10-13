import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '../../services/audio';

interface GameOverModalProps {
  isOpen: boolean;
  onRevive: () => void;
  onRestartLevel: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRevive,
  onRestartLevel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          className="relative max-w-sm w-full bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 text-white text-center shadow-[0_0_50px_rgba(244,63,94,0.4)] flex flex-col items-center gap-4"
        >
          {/* Avatar / Icon with gentle heartbeat animation */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-20 h-20 rounded-full bg-rose-500/20 border-4 border-rose-400 flex items-center justify-center text-5xl shadow-xl"
          >
            🩹
          </motion.div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-black text-rose-400 font-game tracking-wider">
              PETUALANG PINGSAN!
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
              Nyawamu habis karena serangan monster! Jangan menyerah, ayo bangkit kembali dan gunakan jurusmu!
            </p>
          </div>

          {/* Tips Pill */}
          <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span className="text-left font-semibold">
              Gunakan tombol <b className="text-amber-400">[F] / [J]</b> atau tombol <b>⚡ JURUS</b> untuk menembakkan bintang sihir ke monster dari jauh!
            </span>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => {
                audio.playPowerUp();
                onRevive();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-game text-sm rounded-2xl shadow-xl border-2 border-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce"
            >
              <span>💖</span>
              <span>BANGKIT KEMBALI (+3 NYAWA)</span>
            </button>

            <button
              onClick={() => {
                audio.playButtonClick();
                onRestartLevel();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold font-game text-xs rounded-xl border border-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <span>🔄 Ulangi Dari Awal Level</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
