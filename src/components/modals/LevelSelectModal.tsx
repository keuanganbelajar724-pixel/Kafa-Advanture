import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GAME_LEVELS } from '../../data/gameData';
import { audio } from '../../services/audio';

interface LevelSelectModalProps {
  currentLevelId: number;
  unlockedLevelIds: number[];
  completedMissions: string[];
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  unlockedLevelIds,
  completedMissions,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 25 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 md:p-7 shadow-2xl border-4 border-amber-400 text-white flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🗺️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-amber-300 font-game">
                PILIH LEVEL PETUALANGAN
              </h2>
              <p className="text-xs text-slate-300 font-bold">
                Jelajahi berbagai dunia & pelajari kosakata bahasa Inggris baru!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white font-bold text-lg border border-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {GAME_LEVELS.map(lvl => {
            const isUnlocked = unlockedLevelIds.includes(lvl.id);
            const isCurrent = currentLevelId === lvl.id;
            const isCompleted = completedMissions.includes(lvl.mission.id);

            return (
              <motion.div
                key={lvl.id}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`relative rounded-2xl p-4 border-3 transition-all flex items-center justify-between gap-3 overflow-hidden ${
                  !isUnlocked
                    ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-400/50 cursor-pointer'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500 hover:border-emerald-400 shadow-lg cursor-pointer'
                    : 'bg-slate-900/80 border-slate-700 hover:border-indigo-400 shadow cursor-pointer'
                }`}
              >
                {/* Background image preview thumbnail */}
                <div className="absolute right-0 top-0 bottom-0 w-48 opacity-20 pointer-events-none overflow-hidden">
                  <img
                    src={lvl.bgImage}
                    alt={lvl.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
                </div>

                {/* Left: Level Icon & Number */}
                <div className="flex items-center gap-3.5 z-10">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 shrink-0 ${
                      !isUnlocked
                        ? 'bg-slate-800 border-slate-700 text-slate-500'
                        : isCurrent
                        ? 'bg-amber-400 text-amber-950 border-white text-2xl animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-300 text-2xl'
                        : 'bg-indigo-600 text-white border-indigo-400 text-2xl'
                    }`}
                  >
                    <span>{lvl.icon}</span>
                    <span className="text-[10px] font-game">LVL {lvl.id}</span>
                  </div>

                  {/* Level Details */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm md:text-base font-black text-amber-200 font-game">
                        {lvl.name}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        ({lvl.nameId})
                      </span>
                      <span className="px-2 py-0.5 bg-sky-950/90 border border-sky-400 text-sky-300 text-[10px] font-black rounded-full font-game">
                        🧭 {lvl.worldWidth}m • {lvl.zones?.length || 3} Zona
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full font-game">
                          SELESAI ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-300/90 font-bold mt-0.5">
                      🎯 Misi: {lvl.mission.title}
                    </div>
                    {/* 5 SD Subjects Badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {lvl.id === 1 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-600 text-rose-300 text-[9px] font-bold">🇮🇩 B. Indonesia</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[9px] font-bold">🇬🇧 English</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-600 text-purple-300 text-[9px] font-bold">🕌 Adab & Syukur</span>
                        </>
                      )}
                      {lvl.id === 2 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-[9px] font-bold">🔬 IPA Sains & Ekosistem</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[9px] font-bold">🇬🇧 English</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-600 text-purple-300 text-[9px] font-bold">🕌 Kelestarian Ciptaan</span>
                        </>
                      )}
                      {lvl.id === 3 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-600 text-blue-300 text-[9px] font-bold">📐 Matematika & Ukur</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-600 text-rose-300 text-[9px] font-bold">🇮🇩 B. Indonesia</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-[9px] font-bold">🔬 Sains Kelas</span>
                        </>
                      )}
                      {lvl.id === 4 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-600 text-blue-300 text-[9px] font-bold">📐 Matematika Jual-Beli</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-600 text-purple-300 text-[9px] font-bold">🕌 Kejujuran Transaksi</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[9px] font-bold">🇬🇧 Food English</span>
                        </>
                      )}
                      {lvl.id >= 5 && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-[9px] font-bold">🔬 IPA Hewan & Tata Surya</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[9px] font-bold">🌟 5 Pelajaran Terpadu</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Button / Lock Status */}
                <div className="z-10 shrink-0">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold border border-slate-700">
                      <span>🔒</span>
                      <span>Terkunci</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="px-4 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs font-game shadow-lg border-2 border-white flex items-center gap-1">
                      <span>▶</span>
                      <span>SEDANG DIMAINKAN</span>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs font-game shadow-lg border-2 border-emerald-400 flex items-center gap-1 cursor-pointer">
                      <span>MASUK ➔</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>💡 Selesaikan misi di setiap level untuk membuka level berikutnya!</span>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
