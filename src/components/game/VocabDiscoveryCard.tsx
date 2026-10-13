import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { VocabItem, SDSubject } from '../../types/game';
import { audio } from '../../services/audio';
import { SD_SUBJECTS, getSubjectLearning } from '../../data/sdCurriculum';

interface VocabDiscoveryCardProps {
  item: VocabItem | null;
  allLevelItems?: VocabItem[];
  onCorrectAnswer?: (item: VocabItem) => void;
  onClose: () => void;
}

export const VocabDiscoveryCard: React.FC<VocabDiscoveryCardProps> = ({
  item,
  allLevelItems = [],
  onCorrectAnswer,
  onClose,
}) => {
  const [activeSubject, setActiveSubject] = useState<SDSubject>('inggris');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (!item) return;

    // Polite audio pronunciation on discovery
    audio.speak(item.word);

    // Reset states
    setActiveSubject(item.primarySubject || 'inggris');
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(null);
    setShowQuiz(false);

    // Gentle auto-close after 9 seconds if user is idle so it doesn't linger indefinitely
    const timer = setTimeout(() => {
      onClose();
    }, 9000);

    return () => clearTimeout(timer);
  }, [item, onClose]);

  if (!item) return null;

  const currentLearning = getSubjectLearning(item, activeSubject);
  const activeMeta = SD_SUBJECTS.find(s => s.id === activeSubject) || SD_SUBJECTS[0];

  const handleSpeakEn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    audio.speak(item.word, () => setIsSpeaking(false));
  };

  const handleSpeakId = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.speakId(`${item.translation}. ${currentLearning.fact}`);
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    if (quizSubmitted || !currentLearning.quiz) return;

    setSelectedOption(optionIdx);
    setQuizSubmitted(true);

    const correct = optionIdx === currentLearning.quiz.answerIndex;
    setIsCorrect(correct);

    if (correct) {
      audio.playCorrect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2, x: 0.8 },
      });
      if (onCorrectAnswer) {
        onCorrectAnswer(item);
      }
    } else {
      audio.playWrong();
    }
  };

  return (
    <div className="fixed top-14 right-3 md:right-6 z-[780] pointer-events-none max-w-md w-[92vw] sm:w-96 select-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl rounded-2xl border-2 border-amber-400 shadow-[0_15px_40px_rgba(0,0,0,0.7)] p-3.5 text-white flex flex-col gap-2.5 overflow-hidden ring-4 ring-amber-400/20"
        >
          {/* Top Bar: Title & Reward Chip */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs font-game">
              <span className="text-sm animate-bounce">🎒</span>
              <span>BELAJAR TEMA SD: {item.translation.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-500/50 shadow-sm">
                +{item.xp} XP • +{item.coins} 🪙
              </span>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                title="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Item Banner */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-400/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {item.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-amber-300 font-game tracking-wider uppercase truncate">
                  {item.word}
                </span>
                <span className="text-xs font-mono text-slate-400">{item.phonetic}</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                Bahasa Indonesia: <span className="text-amber-200 font-black">{item.translation}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={handleSpeakEn}
                className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] flex items-center gap-1 cursor-pointer shadow active:scale-95"
                title="Dengarkan pengucapan bahasa Inggris"
              >
                <span>{isSpeaking ? '🔊' : '🇬🇧'}</span>
                <span>Voice</span>
              </button>
              <button
                onClick={handleSpeakId}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer border border-slate-700 active:scale-95"
                title="Dengarkan penjelasan bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span>Suara</span>
              </button>
            </div>
          </div>

          {/* 5 SD Subjects Tabs Selector */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {SD_SUBJECTS.map(subj => {
              const isActive = activeSubject === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    audio.playButtonClick();
                    setActiveSubject(subj.id);
                    setSelectedOption(null);
                    setQuizSubmitted(false);
                    setIsCorrect(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black font-game whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-102 font-extrabold'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Active Subject Learning Card */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black font-game ${activeMeta.textColor} flex items-center gap-1`}>
                <span>{activeMeta.icon}</span>
                <span>{currentLearning.title}</span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">
                {activeMeta.name}
              </span>
            </div>

            <p className="text-[11px] text-slate-200 leading-snug">
              {currentLearning.fact}
            </p>

            {/* Quick Interactive Quiz for this Subject */}
            {currentLearning.quiz && (
              <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex flex-col gap-1.5">
                {!showQuiz && !quizSubmitted ? (
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-500/30 text-amber-300 rounded-lg text-[10px] font-black font-game border border-amber-400/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    <span>🎯</span>
                    <span>Tantangan Kuis {activeMeta.shortName} (Bonus +20 XP)</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-200 leading-tight">
                      ❓ {currentLearning.quiz.question}
                    </span>

                    <div className="grid grid-cols-1 gap-1">
                      {currentLearning.quiz.options.map((opt: string, optIdx: number) => {
                        const isChosen = selectedOption === optIdx;
                        const isRightAnswer = optIdx === currentLearning.quiz?.answerIndex;

                        let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
                        if (quizSubmitted) {
                          if (isRightAnswer) {
                            btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black animate-pulse';
                          } else if (isChosen && !isRightAnswer) {
                            btnStyle = 'bg-rose-600 text-white border-rose-400 font-bold';
                          } else {
                            btnStyle = 'bg-slate-900 text-slate-500 border-slate-800 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleAnswerQuiz(optIdx)}
                            className={`w-full py-1 px-2.5 rounded-md text-[10px] font-game text-left border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isRightAnswer && <span>✓ Benar!</span>}
                            {quizSubmitted && isChosen && !isRightAnswer && <span>✕</span>}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[9px] font-bold p-1 rounded ${
                          isCorrect ? 'text-emerald-300 bg-emerald-950/60' : 'text-amber-300 bg-amber-950/60'
                        }`}
                      >
                        💡 {currentLearning.quiz.explanation}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auto-Dismiss Timer Line */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 9, ease: 'linear' }}
            className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full origin-left -mb-1"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
