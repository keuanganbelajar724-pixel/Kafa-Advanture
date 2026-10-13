import React from 'react';
import { motion } from 'motion/react';
import { GAME_BADGES } from '../../data/gameData';
import { audio } from '../../services/audio';

interface BadgesScreenProps {
  unlockedBadges: string[];
  coins: number;
  discoveredWordsCount: number;
  onBack: () => void;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({
  unlockedBadges,
  coins,
  discoveredWordsCount,
  onBack,
}) => {
  const badgeTranslationsId: Record<string, { title: string; desc: string }> = {
    first_adventure: {
      title: 'Langkah Pertama (First Step)',
      desc: 'Selesaikan misi kosakatamu yang pertama bersama Kapten Leo.',
    },
    vocab_hunter: {
      title: 'Kolektor Kata (Word Collector)',
      desc: 'Temukan dan pelajari 8 kata bahasa Inggris di sekitar rumah.',
    },
    super_jumper: {
      title: 'Akrobat Cilik (Little Acrobat)',
      desc: 'Lompat melewati 5 rintangan batu atau kolam air di kebun.',
    },
    puzzle_master: {
      title: 'Juara Teka-Teki (Puzzle Genius)',
      desc: 'Menangkan salah satu tantangan permainan mini-game.',
    },
    coin_magnet: {
      title: 'Pencari Harta (Treasure Seeker)',
      desc: 'Kumpulkan 50 koin emas berkilau di sepanjang perjalanan.',
    },
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-900 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => {
            audio.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full border border-slate-700 shadow-md text-xs font-game cursor-pointer"
        >
          <span>⬅ Kembali (Back)</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-black text-yellow-400 font-game drop-shadow-md">
            PIALA & MEDALI PENGHARGAAN 🏆
          </h1>
          <span className="text-xs text-slate-300 font-bold">
            {unlockedBadges.length} dari {GAME_BADGES.length} Medali Berhasil Dikumpulkan
          </span>
        </div>

        <div className="w-24" />
      </div>

      {/* Badges Grid */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {GAME_BADGES.map((badge, idx) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          const idInfo = badgeTranslationsId[badge.id] || { title: badge.title, desc: badge.description };

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-4 rounded-3xl border-2 flex items-center gap-4 shadow-xl backdrop-blur-md ${
                isUnlocked
                  ? 'bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/10 border-amber-400'
                  : 'bg-slate-800/60 border-slate-700 opacity-60'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                  isUnlocked ? 'bg-amber-400 text-slate-950 border-2 border-white' : 'bg-slate-700 text-slate-500'
                }`}
              >
                {badge.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white font-game">
                    {idInfo.title}
                  </h3>
                  {isUnlocked && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full font-game shadow">
                      TERBUKA ✓
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {idInfo.desc}
                </p>

                {/* Progress Indicator */}
                {!isUnlocked && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            badge.id === 'coin_magnet'
                              ? (coins / 50) * 100
                              : badge.id === 'vocab_hunter'
                              ? (discoveredWordsCount / 8) * 100
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-game">
                      {badge.id === 'coin_magnet'
                        ? `${coins}/50 Koin`
                        : badge.id === 'vocab_hunter'
                        ? `${discoveredWordsCount}/8 Kata`
                        : '0/1'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-300 mt-6 font-semibold">
        Terus jelajahi dunia dan mainkan mini-game untuk mengumpulkan semua piala petualang!
      </div>
    </div>
  );
};
