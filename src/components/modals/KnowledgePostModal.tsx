import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { AdventureKnowledgePost } from '../../data/sdCurriculum';
import { audio } from '../../services/audio';

interface KnowledgePostModalProps {
  post: AdventureKnowledgePost;
  onClose: () => void;
  onReward: (xp: number, coins: number) => void;
}

export const KnowledgePostModal: React.FC<KnowledgePostModalProps> = ({
  post,
  onClose,
  onReward,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isSpeakingEn, setIsSpeakingEn] = useState<boolean>(false);
  const [isSpeakingId, setIsSpeakingId] = useState<boolean>(false);
  const [isSpeakingQuiz, setIsSpeakingQuiz] = useState<boolean>(false);

  const handleSpeakEn = () => {
    setIsSpeakingEn(true);
    audio.speak(post.englishSentence, () => setIsSpeakingEn(false));
  };

  const handleSpeakId = () => {
    setIsSpeakingId(true);
    audio.speakId(`${post.title}. ${post.indonesianSentence}. ${post.explanation}`, () => setIsSpeakingId(false));
  };

  const handleSpeakQuiz = () => {
    setIsSpeakingQuiz(true);
    const textToRead = `${post.quiz.question}. Pilihan jawaban: A, ${post.quiz.options[0]}. B, ${post.quiz.options[1]}. C, ${post.quiz.options[2]}.`;
    audio.speakId(textToRead, () => setIsSpeakingQuiz(false));
  };

  const handleChooseOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === post.quiz.correctIndex) {
      audio.playCorrect();
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
      onReward(40, 20);
    } else {
      audio.playWrong();
    }
  };

  const isCorrect = selectedAnswer === post.quiz.correctIndex;

  const subjectBadgeColor =
    post.subject === 'MATH'
      ? 'bg-sky-500 text-white border-sky-300 shadow-sky-500/30'
      : post.subject === 'SCIENCE'
      ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-500/30'
      : 'bg-amber-400 text-slate-950 border-amber-200 shadow-amber-500/30';

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-5 md:p-7 shadow-2xl border-2 border-amber-400/70 text-white flex flex-col my-auto"
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

        {/* Top Header Grade 1 SD Subject Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className={`px-3 py-1 rounded-full font-black text-xs font-game shadow flex items-center gap-1.5 border ${subjectBadgeColor}`}>
            <span>{post.emoji}</span>
            <span>{post.badgeText || (post.subject === 'MATH' ? '🔢 MATEMATIKA KELAS 1 SD' : post.subject === 'SCIENCE' ? '🔬 IPA SAINS KELAS 1 SD' : '🇬🇧 BAHASA INGGRIS KELAS 1 SD')}</span>
          </div>
          <span className="text-[10px] font-bold text-amber-300/90 font-game tracking-wider bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">
            {post.targetAudience || 'KELAS 1 SD'} • {post.tag}
          </span>
        </div>

        {/* Main Title */}
        <h2 className="text-xl md:text-2xl font-black text-white font-game drop-shadow-md">
          {post.title}
        </h2>
        <span className="text-xs text-indigo-300 font-semibold mb-3">
          {post.englishTitle}
        </span>

        {/* English Learning Showcase Box with Dual Pronunciation */}
        <div className="p-4 bg-indigo-900/40 rounded-2xl border border-indigo-400/40 shadow-inner mb-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-amber-300 font-game tracking-wider flex items-center gap-1">
              <span>🇬🇧</span>
              <span>KOSAKATA & KALIMAT BAHASA INGGRIS</span>
            </span>
            <button
              onClick={handleSpeakEn}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-[11px] shadow cursor-pointer active:scale-95 transition-all font-game"
              title="Dengarkan pengucapan bahasa Inggris"
            >
              <span>{isSpeakingEn ? '🔊' : '🔈'}</span>
              <span>Listen 🇬🇧</span>
            </button>
          </div>

          <div className="text-base md:text-lg font-black text-yellow-200 tracking-wide leading-relaxed font-game">
            "{post.englishSentence}"
          </div>

          {/* Indonesian Translation & Speech */}
          <div className="mt-2.5 pt-2 border-t border-indigo-700/50 flex items-center justify-between gap-2">
            <div className="text-xs md:text-sm text-slate-100 font-semibold italic">
              🇮🇩 "{post.indonesianSentence}"
            </div>
            <button
              onClick={handleSpeakId}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold rounded-lg border border-slate-700 cursor-pointer shrink-0 font-game"
              title="Dengarkan pembacaan bahasa Indonesia"
            >
              {isSpeakingId ? '🔊 Suara...' : 'Dengar 🇮🇩'}
            </button>
          </div>
        </div>

        {/* Science/Math Insight & Tips Belajar Cilik */}
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 mb-3 text-xs text-slate-200 leading-relaxed space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-lg shrink-0 mt-0.5">🧠</span>
            <div>
              <span className="font-bold text-amber-300">Wawasan Pengetahuan: </span>
              {post.explanation}
            </div>
          </div>
          {post.learningTip && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] text-cyan-300 font-medium">
              <span className="text-sm">💡</span>
              <span><strong>Tips Belajar:</strong> {post.learningTip}</span>
            </div>
          )}
        </div>

        {/* Mini Quiz Challenge Tailored for Grade 1 SD */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-xs font-black text-amber-400 font-game flex items-center gap-1.5">
              <span>🎯</span>
              <span>TANTANGAN KELAS 1 SD</span>
            </div>
            {/* Audio Read-Aloud for Quiz Question for young children */}
            <button
              onClick={handleSpeakQuiz}
              className="flex items-center gap-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-full font-bold text-[10px] font-game cursor-pointer active:scale-95 transition-all shadow"
              title="Bacakan soal dengan suara ramah"
            >
              <span>{isSpeakingQuiz ? '🔊' : '📢'}</span>
              <span>Bacakan Soal 🗣️</span>
            </button>
          </div>

          <div className="text-sm font-bold text-white mb-3">
            {post.quiz.question}
          </div>

          <div className="space-y-2">
            {post.quiz.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isTheCorrectOne = idx === post.quiz.correctIndex;
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
                  onClick={() => handleChooseOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass} ${
                    !isAnswered ? 'active:scale-98' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-950/70 text-[11px] flex items-center justify-center font-bold text-amber-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-xs sm:text-sm">{opt}</span>
                  </div>
                  {isAnswered && isTheCorrectOne && <span className="font-game text-xs font-bold">✅ Benar!</span>}
                  {isAnswered && isSelected && !isTheCorrectOne && <span className="font-game text-xs font-bold">❌ Coba Lagi</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback & Reward Banner */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-3 rounded-xl text-center text-xs font-black font-game flex flex-col items-center justify-center gap-1 ${
                  isCorrect
                    ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/60 shadow-lg'
                    : 'bg-rose-500/25 text-rose-200 border border-rose-400/60'
                }`}
              >
                {isCorrect ? (
                  <>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>🎉</span>
                      <span>HEBAT & PINTAR SEKALI!</span>
                    </div>
                    <div className="text-amber-300 text-xs">
                      Kamu Mendapat +40 XP Robot & +20 Koin Emas! 🪙⭐
                    </div>
                    {post.quiz.explanationOnAnswer && (
                      <div className="text-[11px] font-normal text-emerald-100 mt-0.5">
                        {post.quiz.explanationOnAnswer}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>Jawaban yang benar: {post.quiz.options[post.quiz.correctIndex]}</div>
                    <div className="text-[11px] font-normal text-slate-300">
                      Tetap semangat belajar ya! Setiap kesalahan membuat kita makin pintar! 🌟
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bottom Button */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-98 text-slate-950 font-black rounded-2xl shadow-xl font-game text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Lanjutkan Petualangan Robot! 🤖</span>
          <span>➡️</span>
        </button>
      </motion.div>
    </div>
  );
};
