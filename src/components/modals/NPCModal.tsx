import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NPCCharacter, Mission } from '../../types/game';
import { audio } from '../../services/audio';

interface NPCModalProps {
  npc: NPCCharacter;
  mission: Mission;
  missionProgressCount: number;
  isMissionCompleted: boolean;
  onClose: () => void;
}

export const NPCModal: React.FC<NPCModalProps> = ({
  npc,
  mission,
  missionProgressCount,
  isMissionCompleted,
  onClose,
}) => {
  const [isSpeakingEn, setIsSpeakingEn] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState(false);

  const handleSpeakEn = () => {
    setIsSpeakingEn(true);
    audio.speak(npc.dialogue.speechPrompt, () => setIsSpeakingEn(false));
  };

  const handleSpeakId = () => {
    setIsSpeakingId(true);
    audio.speakId(npc.dialogue.indonesianText, () => setIsSpeakingId(false));
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-indigo-400 flex flex-col items-center text-center"
      >
        {/* NPC Avatar Header */}
        <div className="w-20 h-20 bg-indigo-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl -mt-12">
          {npc.emoji}
        </div>

        <div className="mt-2 text-xl font-black text-slate-900 font-game">
          {npc.name}
        </div>
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-game">
          {npc.role}
        </div>

        {/* Quest Status Pill */}
        <div className="mt-3 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-900 font-game">
          {isMissionCompleted
            ? '🎉 Misi Selesai! Kamu Hebat!'
            : `🧭 Progres Misi: ${missionProgressCount}/${mission.targetWords.length} Benda Ditemukan`}
        </div>

        {/* Dialogue Box: Indonesian first and clear English */}
        <div className="mt-4 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
          {/* Indonesian Dialogue (Crystal Clear) */}
          <div className="text-sm font-bold text-slate-800 leading-relaxed">
            🇮🇩 "{npc.dialogue.indonesianText}"
          </div>

          {/* English Voice Dialogue */}
          <div className="mt-2 text-xs font-semibold text-slate-500 italic border-t border-slate-200 pt-2">
            🇬🇧 "{npc.dialogue.text}"
          </div>

          {/* Voice Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleSpeakId}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold font-game shadow flex items-center justify-center gap-1 ${
                isSpeakingId ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <span>🇮🇩</span>
              <span>Suara Indonesia</span>
            </button>

            <button
              onClick={handleSpeakEn}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold font-game shadow flex items-center justify-center gap-1 ${
                isSpeakingEn ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <span>🔊</span>
              <span>English Voice</span>
            </button>
          </div>
        </div>

        {/* Quest Checklist Items */}
        <div className="mt-4 w-full flex items-center justify-around bg-sky-50 p-3 rounded-2xl border border-sky-200">
          <div className="text-xs font-bold text-sky-900 font-game">
            🎯 Target Misi: Cari {mission.targetWords.length} benda di level ini!
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl border-2 border-indigo-400 font-game cursor-pointer"
        >
          {isMissionCompleted ? 'Keren! Ayo Lanjut Berpetualang! 🚀' : 'Siap! Saya Cari Sekarang! 🚀'}
        </motion.button>
      </motion.div>
    </div>
  );
};
