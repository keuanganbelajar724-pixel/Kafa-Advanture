import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { AdventureChest } from '../../data/sdCurriculum';
import { audio } from '../../services/audio';

interface TreasureChestModalProps {
  chest: AdventureChest;
  onClose: () => void;
  onReward: (xp: number, coins: number) => void;
}

export const TreasureChestModal: React.FC<TreasureChestModalProps> = ({
  chest,
  onClose,
  onReward,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleSpeakQuestion = () => {
    setIsSpeaking(true);
    const textToRead = `${chest.title}. ${chest.riddleQuestion}. Pilihan jawaban: A, ${chest.options[0]}. B, ${chest.options[1]}. C, ${chest.options[2]}.`;
    audio.speakId(textToRead, () => setIsSpeaking(false));
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === chest.correctIndex) {
      audio.playCorrect();
      audio.playPowerUp();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8', '#EC4899'],
      });
      onReward(chest.rewardXp, chest.rewardCoins);
    } else {
      audio.playWrong();
    }
  };

  const isCorrect = selectedAnswer === chest.correctIndex;

  const subjectBadgeColor =
    chest.subject === 'MATH'
      ? 'bg-sky-500 text-white border-sky-300'
      : chest.subject === 'SCIENCE'
      ? 'bg-emerald-500 text-white border-emerald-300'
      : 'bg-amber-400 text-slate-950 border-amber-200';

  return (
    <div className="fixed inset-0 z-[965] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-5 md:p-7 shadow-2xl border-3 border-amber-400 text-white flex flex-col my-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm border border-slate-600 shadow cursor-pointer transition-all active:scale-95"
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Chest Animated Graphic */}
        <div className="flex flex-col items-center text-center mb-2">
          <motion.div
            animate={
              isAnswered && isCorrect
                ? { scale: [1, 1.25, 1.1], rotate: [0, -6, 6, 0] }
                : { y: [0, -6, 0] }
            }
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 border-4 border-amber-200 shadow-2xl flex items-center justify-center text-4xl mb-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          >
            {isAnswered && isCorrect ? '👑' : chest.emoji}
          </motion.div>

          {/* Subject Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-3 py-1 rounded-full font-black text-xs font-game border shadow ${subjectBadgeColor}`}>
              {chest.badgeText}
            </span>
            <span className="text-[10px] font-bold text-amber-300 font-game bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/40">
              PETI HARTA KARUN CILIK
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-amber-300 font-game drop-shadow-md">
            {chest.title}
          </h2>
        </div>

        {/* Riddle / Question Box with Read-Aloud Button */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-400/40 shadow-inner mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-amber-300 font-game flex items-center gap-1.5">
              <span>🗝️</span>
              <span>KUNCI PEMBUKA PETI:</span>
            </span>
            <button
              onClick={handleSpeakQuestion}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-[10px] font-game cursor-pointer active:scale-95 transition-all shadow"
              title="Dengarkan pembacaan teka-teki"
            >
              <span>{isSpeaking ? '🔊' : '📢'}</span>
              <span>Bacakan 🗣️</span>
            </button>
          </div>

          <div className="text-sm md:text-base font-bold text-white leading-relaxed">
            "{chest.riddleQuestion}"
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {chest.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isTheCorrectOne = idx === chest.correctIndex;
            let btnClass = 'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border-slate-700 hover:border-amber-400/50';

            if (isAnswered) {
              if (isTheCorrectOne) {
                btnClass = 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)] font-bold';
              } else if (isSelected) {
                btnClass = 'bg-rose-600 text-white border-rose-400 font-bold';
              } else {
                btnClass = 'bg-slate-900/60 text-slate-500 border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass} ${
                  !isAnswered ? 'active:scale-98' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-950/70 text-[11px] flex items-center justify-center font-bold text-amber-300">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm">{opt}</span>
                </div>
                {isAnswered && isTheCorrectOne && <span className="font-game text-xs font-black">✅ Benar!</span>}
                {isAnswered && isSelected && !isTheCorrectOne && <span className="font-game text-xs font-black">❌ Coba Lagi</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback / Reward Banner */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl text-center text-xs font-black font-game flex flex-col items-center justify-center gap-1 mb-4 ${
                isCorrect
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-200 border-2 border-amber-400/70 shadow-xl'
                  : 'bg-rose-500/25 text-rose-200 border border-rose-400/60'
              }`}
            >
              {isCorrect ? (
                <>
                  <div className="flex items-center gap-1.5 text-sm text-yellow-300">
                    <span>🎉</span>
                    <span>PETI HARTA KARUN BERHASIL DIBUKA!</span>
                  </div>
                  <div className="text-white text-xs">
                    Hadiah: +{chest.rewardXp} XP Robot & +{chest.rewardCoins} Koin Emas! 🪙⭐💎
                  </div>
                  <div className="text-[11px] font-normal text-amber-100 mt-1">
                    {chest.explanation}
                  </div>
                </>
              ) : (
                <>
                  <div>Jawaban pembuka yang benar: {chest.options[chest.correctIndex]}</div>
                  <div className="text-[11px] font-normal text-slate-300">
                    Jangan khawatir! Teruslah menjelajah untuk menemukan peti rahasia lainnya! 🌟
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-slate-950 font-black rounded-2xl shadow-xl font-game text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>{isAnswered ? 'Ambil Hadiah & Lanjutkan Petualangan! 🤖' : 'Tutup Peti'}</span>
          <span>➡️</span>
        </button>
      </motion.div>
    </div>
  );
};
