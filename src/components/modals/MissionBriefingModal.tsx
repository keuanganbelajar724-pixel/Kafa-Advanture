import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameLevel } from '../../types/game';
import { audio } from '../../services/audio';

interface MissionBriefingModalProps {
  level: GameLevel;
  onClose: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  level,
  onClose,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayInstructionsAudio = () => {
    setIsPlayingAudio(true);
    const textToSpeak = `Selamat datang di Level ${level.id}, ${level.nameId}! Perintah misimu adalah: ${level.mission.description}. Caranya: gerakkan karakter mendekati benda bertanda panah emas, lalu tekan tombol Periksa atau Spasi untuk mempelajarinya. Selamat bertualang!`;
    audio.speakId(textToSpeak, () => setIsPlayingAudio(false));
  };

  return (
    <div className="fixed inset-0 z-[970] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 md:p-7 shadow-2xl border-4 border-amber-400 text-white flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{level.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full font-game">
                  LEVEL {level.id} DARI 5
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  {level.subtitleId}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-amber-300 font-game mt-0.5">
                {level.nameId} ({level.name})
              </h2>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-left">
          {/* Main Command / Objective Card */}
          <div className="p-4 bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-transparent rounded-2xl border-2 border-amber-400/60 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-game flex items-center gap-1.5">
                <span>🎯</span> PERINTAH MISI (TUGAS UTAMA):
              </span>
              <button
                onClick={handlePlayInstructionsAudio}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-full shadow font-game cursor-pointer active:scale-95"
              >
                <span>{isPlayingAudio ? '🔊' : '🔈'}</span>
                <span>{isPlayingAudio ? 'Bicara...' : 'Dengar Suara'}</span>
              </button>
            </div>
            <div className="text-base md:text-lg font-black text-white font-game mt-1.5 leading-snug">
              {level.mission.title}
            </div>
            <div className="text-xs md:text-sm font-semibold text-amber-100 mt-1">
              👉 {level.mission.description}
            </div>
          </div>

          {/* Target Objects to find */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-300 font-game mb-2 flex items-center gap-1.5">
              <span>🔍</span> DAFTAR BENDA YANG DISURUH DICARI:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {level.mission.targetWords.map((wordId) => {
                const item = level.vocabItems.find((v) => v.id === wordId);
                if (!item) return null;
                const hint = level.missionHints[wordId];

                return (
                  <div
                    key={wordId}
                    className="p-3 bg-slate-800/80 rounded-2xl border-2 border-slate-700 flex flex-col items-center text-center shadow-md hover:border-amber-400 transition-colors"
                  >
                    <div className="text-3xl mb-1">{item.emoji}</div>
                    <div className="text-sm font-black text-amber-300 font-game">
                      {item.word}
                    </div>
                    <div className="text-xs font-bold text-white">
                      ({item.translation})
                    </div>
                    {hint && (
                      <div className="text-[10px] text-amber-200/90 font-medium mt-1 leading-tight">
                        {hint}
                      </div>
                    )}
                    <button
                      onClick={() => audio.speak(item.word)}
                      className="mt-2 text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded-full font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔊</span> Baca: {item.phonetic}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Instructions: "DISURUH NGAPAIN?" */}
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 font-game mb-2.5 flex items-center gap-1.5">
              <span>🕹️</span> CARA BERMAIN & LANGKAHNYA (SANGAT MUDAH!):
            </div>
            <div className="space-y-2 text-xs text-slate-200 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white">Gerakkan Karaktermu:</strong> Gunakan tombol panah ⬅️ ➡️ di keyboard, tombol WASD, atau Joystick bulat di layar HP/tablet.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white">Ikuti Petunjuk Arah:</strong> Lihat kompas panah emas di bagian bawah layar yang menunjukkan letak benda (misal: "Jalan ke kanan ➔").
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white">Dekati Benda:</strong> Saat kamu mendekat, benda akan memancarkan cahaya dan tombol kuning <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold font-game">PERIKSA 🔍</span> akan menyala!
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-white">Tekan Tombol [PERIKSA 🔍] atau [SPASI]:</strong> Kosakata akan terbaca dengan suara jernih, masuk ke kamus petualangmu, dan memberimu XP serta Koin!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Tekan tombol kapan saja jika ingin membaca ulang petunjuk.
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl font-game cursor-pointer flex items-center justify-center gap-2 border-2 border-white ring-4 ring-amber-300/40"
          >
            <span>🚀</span>
            <span>SAYA MENGERTI, AYO CARI SEKARANG!</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
