import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { AnimalCompanion } from '../../data/sdCurriculum';
import { audio } from '../../services/audio';

interface AnimalCompanionModalProps {
  animal: AnimalCompanion;
  onClose: () => void;
  onReward: (xp: number, coins: number) => void;
}

export const AnimalCompanionModal: React.FC<AnimalCompanionModalProps> = ({
  animal,
  onClose,
  onReward,
}) => {
  const [hasReceivedReward, setHasReceivedReward] = useState<boolean>(false);
  const [isSpeakingId, setIsSpeakingId] = useState<boolean>(false);
  const [isSpeakingEn, setIsSpeakingEn] = useState<boolean>(false);

  const handleSpeakId = () => {
    setIsSpeakingId(true);
    audio.speakId(`${animal.name} berkata: ${animal.dialogue}. Fakta sains seru: ${animal.knowledgeTip}`, () =>
      setIsSpeakingId(false)
    );
  };

  const handleSpeakEn = () => {
    setIsSpeakingEn(true);
    audio.speak(animal.englishDialogue, () => setIsSpeakingEn(false));
  };

  const handleClaimFriendship = () => {
    if (hasReceivedReward) return;
    setHasReceivedReward(true);
    audio.playPowerUp();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#FBBF24', '#38BDF8'],
    });
    onReward(animal.rewardXp, animal.rewardCoins);
  };

  return (
    <div className="fixed inset-0 z-[965] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-rose-950/40 to-slate-950 rounded-3xl p-5 md:p-7 shadow-2xl border-3 border-rose-400/80 text-white flex flex-col my-auto"
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

        {/* Animal Avatar & Name Header */}
        <div className="flex flex-col items-center text-center mb-3">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-amber-400 to-yellow-400 border-4 border-white shadow-2xl flex items-center justify-center text-4xl mb-2 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]"
          >
            {animal.emoji}
          </motion.div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full font-black text-xs font-game bg-rose-500 text-white border border-rose-300 shadow">
              {animal.tag}
            </span>
            <span className="text-[10px] font-bold text-amber-300 font-game bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              {animal.species}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white font-game drop-shadow-md">
            {animal.name}
          </h2>
        </div>

        {/* Indonesian Friendly Greeting Box with Read-Aloud */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-rose-400/40 shadow-inner mb-3 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-rose-300 font-game flex items-center gap-1.5">
              <span>💬</span>
              <span>SAPAAN HANGAT TEMAN SATWA:</span>
            </span>
            <button
              onClick={handleSpeakId}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-black text-[10px] font-game cursor-pointer active:scale-95 transition-all shadow"
              title="Dengarkan suara ramah teman satwa"
            >
              <span>{isSpeakingId ? '🔊' : '🗣️'}</span>
              <span>Dengar Suara</span>
            </button>
          </div>

          <div className="text-sm md:text-base font-bold text-yellow-100 leading-relaxed italic">
            "{animal.dialogue}"
          </div>
        </div>

        {/* English Bilingual Box */}
        <div className="p-3.5 bg-indigo-950/60 rounded-2xl border border-indigo-400/30 mb-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-cyan-300 font-game flex items-center gap-1">
              <span>🇬🇧</span>
              <span>ENGLISH VOICE GREETING</span>
            </span>
            <button
              onClick={handleSpeakEn}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full font-black text-[10px] font-game cursor-pointer active:scale-95 transition-all shadow"
              title="Dengarkan bahasa Inggris"
            >
              <span>{isSpeakingEn ? '🔊' : '🔈'}</span>
              <span>Listen 🇬🇧</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200">
            "{animal.englishDialogue}"
          </div>
        </div>

        {/* Science & Nature Fact Insight */}
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4 flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
          <span className="text-lg shrink-0 mt-0.5">🧠</span>
          <div>
            <span className="font-bold text-amber-300">Fakta Sains Hewan: </span>
            {animal.knowledgeTip}
          </div>
        </div>

        {/* Reward / Friendship Gift Button */}
        {!hasReceivedReward ? (
          <button
            onClick={handleClaimFriendship}
            className="w-full py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black rounded-2xl shadow-xl font-game text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 animate-pulse mb-2"
          >
            <span>❤️ Jalin Persahabatan (+{animal.rewardXp} XP & +{animal.rewardCoins} 🪙 Koin)</span>
          </button>
        ) : (
          <div className="w-full p-2.5 mb-2 bg-emerald-500/20 border border-emerald-400/60 rounded-2xl text-center text-xs font-black font-game text-emerald-300 flex items-center justify-center gap-1.5">
            <span>💖</span>
            <span>Kalian sekarang adalah sahabat sejati! (+{animal.rewardXp} XP & +{animal.rewardCoins} Koin Diterima)</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl font-game text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
        >
          <span>Lanjutkan Berpetualang Bersama Robot! 🤖</span>
          <span>➡️</span>
        </button>
      </motion.div>
    </div>
  );
};
