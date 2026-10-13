import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { VocabItem } from '../../types/game';
import { audio } from '../../services/audio';

interface VocabModalProps {
  item: VocabItem | null;
  allLevelItems?: VocabItem[];
  onCorrectAnswer?: (item: VocabItem) => void;
  onClose: () => void;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  item,
  allLevelItems = [],
  onCorrectAnswer,
  onClose,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [options, setOptions] = useState<{ id: string; label: string; isCorrect: boolean }[]>([]);
  const [isSpeakingEn, setIsSpeakingEn] = useState<boolean>(false);
  const [isSpeakingId, setIsSpeakingId] = useState<boolean>(false);

  // Generate 3 random Indonesian quiz options when opened
  useEffect(() => {
    if (!item) return;

    // Pronounce the item on reveal
    audio.speak(item.word);

    // Pick 2 distractor Indonesian translations
    const distractors = allLevelItems
      .filter(v => v.id !== item.id)
      .map(v => ({ id: v.id, label: v.translation, isCorrect: false }));

    // Shuffle and pick 2
    const shuffled = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 2);
    // Combine with correct answer and shuffle
    const allOptions = [
      { id: item.id, label: item.translation, isCorrect: true },
      ...shuffled,
    ].sort(() => 0.5 - Math.random());

    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [item, allLevelItems]);

  if (!item) return null;

  const handleSpeakEn = () => {
    setIsSpeakingEn(true);
    audio.speak(item.word, () => setIsSpeakingEn(false));
  };

  const handleSpeakId = () => {
    setIsSpeakingId(true);
    audio.speakId(`${item.word} artinya ${item.translation}. ${item.description}`, () => setIsSpeakingId(false));
  };

  const handleSelectOption = (opt: { id: string; label: string; isCorrect: boolean }) => {
    if (isCorrect) return; // already solved

    setSelectedAnswer(opt.label);
    if (opt.isCorrect) {
      setIsCorrect(true);
      audio.playCorrect();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (onCorrectAnswer) {
        onCorrectAnswer(item);
      }
    } else {
      setIsCorrect(false);
      audio.playWrong();
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 md:p-6 shadow-2xl border-2 border-slate-700 text-center flex flex-col items-center overflow-hidden"
      >
        {/* Top Discovery Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full font-black text-xs font-game shadow-md">
          <span>✨</span>
          <span>KOSAKATA DITEMUKAN!</span>
        </div>

        {/* Big Illustration Emoji Container */}
        <motion.div
          animate={isCorrect ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          className="mt-3 w-24 h-24 rounded-2xl bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-5xl shadow-inner relative"
        >
          {item.emoji}
          <button
            onClick={handleSpeakEn}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg font-bold text-xs cursor-pointer active:scale-95"
            title="Dengarkan pengucapan bahasa Inggris"
          >
            {isSpeakingEn ? '🔊' : '🔈'}
          </button>
        </motion.div>

        {/* Big Clear Bilingual Pairing: e.g. DESK = MEJA */}
        <div className="mt-3 text-2xl md:text-3xl font-black text-amber-300 font-game tracking-wider uppercase flex items-center justify-center gap-2">
          <span>{item.word}</span>
          <span className="text-white text-lg">=</span>
          <span className="text-emerald-300">{item.translation}</span>
        </div>

        <div className="text-xs text-slate-300 font-medium mt-1">
          Pengucapan: <span className="font-mono text-amber-200">{item.phonetic}</span>
        </div>

        {/* Indonesian Audio Explanation Pill */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={handleSpeakEn}
            className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>🇬🇧 Suara Inggris</span>
          </button>
          <button
            onClick={handleSpeakId}
            className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>🇮🇩 Penjelasan</span>
          </button>
        </div>

        {/* Sentence Hint */}
        <div className="mt-2 text-[11px] text-slate-300 italic">
          "{item.exampleSentence}"
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE LEARNING QUIZ: Guess Indonesian Meaning */}
        {/* ======================================================== */}
        <div className="mt-4 w-full pt-3 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-200 mb-2 font-game">
            KUIS: APA ARTI DARI <span className="text-amber-300 font-black">"{item.word}"</span>?
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt.label;
              const isThisCorrect = isSelected && isCorrect === true;
              const isThisWrong = isSelected && isCorrect === false;

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isCorrect === true}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black font-game border transition-all cursor-pointer ${
                    isThisCorrect
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300'
                      : isThisWrong
                      ? 'bg-rose-600 border-rose-400 text-white animate-shake'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Message */}
          <div className="h-6 mt-2 flex items-center justify-center">
            {isCorrect === true && (
              <span className="text-xs font-bold text-emerald-400 animate-bounce">
                🎉 Tepat Sekali! {item.word} = {item.translation}! (+{item.xp} XP & +{item.coins} 🪙)
              </span>
            )}
            {isCorrect === false && (
              <span className="text-xs font-bold text-rose-400">
                Ayo coba lagi! Dengarkan suaranya.
              </span>
            )}
          </div>
        </div>

        {/* Close Button / Continue */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className={`mt-2 w-full py-2.5 rounded-xl font-black text-xs font-game transition-all cursor-pointer border ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-white border-emerald-300 shadow-xl'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {isCorrect ? 'SIMPAN KE TAS & LANJUTKAN ➔' : 'TUTUP'}
        </button>
      </motion.div>
    </div>
  );
};
