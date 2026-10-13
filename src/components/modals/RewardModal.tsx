import React from 'react';
import { motion } from 'motion/react';
import { GameLevel } from '../../types/game';
import { GAME_LEVELS } from '../../data/gameData';
import { audio } from '../../services/audio';

interface RewardModalProps {
  currentLevel: GameLevel;
  onClose: () => void;
  onGoToNextLevel: () => void;
  onOpenLevelSelect: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  currentLevel,
  onClose,
  onGoToNextLevel,
  onOpenLevelSelect,
}) => {
  const nextLevel = GAME_LEVELS.find(l => l.id === currentLevel.id + 1);

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 30 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 via-white to-amber-100 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 text-center flex flex-col items-center"
      >
        <div className="text-5xl animate-bounce">
          🎉
        </div>

        <div className="mt-2 text-2xl font-black text-amber-950 font-game tracking-wider uppercase">
          MISI LEVEL {currentLevel.id} SELESAI!
        </div>

        <div className="text-xs font-bold text-slate-600 font-game mt-0.5">
          {currentLevel.nameId} · {currentLevel.mission.title}
        </div>

        {/* Reward Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 w-full">
          <div className="bg-amber-100 p-2.5 rounded-2xl border-2 border-amber-300 flex flex-col items-center shadow-sm">
            <span className="text-2xl">✨</span>
            <span className="text-xs font-black text-amber-900 font-game mt-1">+{currentLevel.mission.reward.xp} XP</span>
          </div>

          <div className="bg-amber-200 p-2.5 rounded-2xl border-2 border-amber-400 flex flex-col items-center shadow-sm">
            <span className="text-2xl">🪙</span>
            <span className="text-xs font-black text-amber-950 font-game mt-1">+{currentLevel.mission.reward.coins} Koin</span>
          </div>

          <div className="bg-yellow-200 p-2.5 rounded-2xl border-2 border-yellow-400 flex flex-col items-center shadow-sm">
            <span className="text-2xl">⭐</span>
            <span className="text-xs font-black text-yellow-950 font-game mt-1">+{currentLevel.mission.reward.stars} Bintang</span>
          </div>
        </div>

        {/* Vocabulary Discovered Summary */}
        <div className="mt-4 w-full bg-white p-3.5 rounded-2xl border border-amber-200 text-left shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-game">
            Benda yang Berhasil Dikuasai:
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
            {currentLevel.mission.targetWords.map(wordId => {
              const item = currentLevel.vocabItems.find(v => v.id === wordId);
              if (!item) return null;
              return (
                <span key={item.id} className="px-2.5 py-1 bg-sky-100 text-sky-900 rounded-xl text-xs font-black font-game border border-sky-200">
                  {item.emoji} {item.word} ({item.translation})
                </span>
              );
            })}
          </div>
        </div>

        {/* Next Level Teaser */}
        {nextLevel ? (
          <div className="mt-3 px-3.5 py-2.5 bg-emerald-100 border-2 border-emerald-400 rounded-2xl text-emerald-950 text-xs font-bold font-game flex items-center gap-2 shadow-sm">
            <span className="text-2xl">{nextLevel.icon}</span>
            <span className="text-left">
              Hore! <b>Level {nextLevel.id}: {nextLevel.nameId}</b> telah TERBUKA!
            </span>
          </div>
        ) : (
          <div className="mt-3 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-2xl text-yellow-900 text-xs font-bold font-game">
            👑 Luar biasa! Kamu telah menyelesaikan semua petualangan!
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 w-full flex flex-col gap-2">
          {nextLevel ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audio.playButtonClick();
                onGoToNextLevel();
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-white font-black text-sm rounded-2xl shadow-xl border-3 border-emerald-300 font-game cursor-pointer flex items-center justify-center gap-1.5 ring-2 ring-emerald-300/50"
            >
              <span>LANJUT KE LEVEL {nextLevel.id}</span>
              <span>➔</span>
            </motion.button>
          ) : null}

          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenLevelSelect();
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black rounded-xl font-game shadow cursor-pointer border border-slate-700"
          >
            🗺️ Pilih Level Lain
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-full py-1 text-slate-500 hover:text-slate-800 text-xs font-bold font-game cursor-pointer"
          >
            Tetap di Level Ini
          </button>
        </div>
      </motion.div>
    </div>
  );
};
