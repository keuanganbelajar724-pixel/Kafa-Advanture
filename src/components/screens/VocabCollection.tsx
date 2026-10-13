import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { EXTENDED_VOCAB_COLLECTION } from '../../data/gameData';
import { VocabItem, SDSubject } from '../../types/game';
import { audio } from '../../services/audio';
import { SD_SUBJECTS, getSubjectLearning } from '../../data/sdCurriculum';

interface VocabCollectionProps {
  discoveredWords: string[];
  onBack: () => void;
}

export const VocabCollection: React.FC<VocabCollectionProps> = ({
  discoveredWords,
  onBack,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VocabItem | null>(null);
  const [activeModalSubject, setActiveModalSubject] = useState<SDSubject>('inggris');
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const discoveredCount = EXTENDED_VOCAB_COLLECTION.filter(w =>
    discoveredWords.includes(w.id)
  ).length;

  const filteredWords = EXTENDED_VOCAB_COLLECTION.filter(item => {
    if (selectedSubject === 'all') return true;
    return item.primarySubject === selectedSubject || true; // All items have learning for all subjects
  });

  const handleCardClick = (item: VocabItem) => {
    if (!discoveredWords.includes(item.id)) return;
    audio.playButtonClick();
    setSelectedItem(item);
    setActiveModalSubject(selectedSubject !== 'all' ? (selectedSubject as SDSubject) : 'inggris');
    setQuizAnswered(false);
    setIsAnswerCorrect(null);
  };

  const handleModalAnswer = (chosenIdx: number, correctIdx: number) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    const correct = chosenIdx === correctIdx;
    setIsAnswerCorrect(correct);
    if (correct) {
      audio.playCorrect();
      confetti({ particleCount: 40, spread: 50 });
    } else {
      audio.playWrong();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={() => {
            audio.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full border border-slate-700 shadow-md text-xs font-game cursor-pointer transition-all active:scale-95"
        >
          <span>⬅ Kembali ke Petualangan</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 font-game drop-shadow-md flex items-center gap-2">
            <span>📚</span>
            <span>BUKU PINTAR 5 MATA PELAJARAN SD</span>
          </h1>
          <span className="text-xs text-slate-300 font-bold mt-0.5">
            Koleksi Pengetahuan: {discoveredCount} dari {EXTENDED_VOCAB_COLLECTION.length} Benda Berhasil Dibuka
          </span>
        </div>

        {/* Progress Pill */}
        <div className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black rounded-full font-game shadow">
          {Math.round((discoveredCount / EXTENDED_VOCAB_COLLECTION.length) * 100)}% Terbuka
        </div>
      </div>

      {/* 5 SD Subjects Tabs Filter */}
      <div className="w-full max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        <button
          onClick={() => {
            audio.playButtonClick();
            setSelectedSubject('all');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black font-game whitespace-nowrap transition-all cursor-pointer border ${
            selectedSubject === 'all'
              ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span>🌟</span>
          <span>Semua Pelajaran SD</span>
        </button>

        {SD_SUBJECTS.map(subj => (
          <button
            key={subj.id}
            onClick={() => {
              audio.playButtonClick();
              setSelectedSubject(subj.id);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black font-game whitespace-nowrap transition-all cursor-pointer border ${
              selectedSubject === subj.id
                ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>{subj.icon}</span>
            <span>{subj.name}</span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 flex-1">
        {filteredWords.map((item, i) => {
          const isUnlocked = discoveredWords.includes(item.id);
          const activeSubjKey = selectedSubject !== 'all' ? (selectedSubject as SDSubject) : 'inggris';
          const learning = getSubjectLearning(item, activeSubjKey);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => handleCardClick(item)}
              className={`relative rounded-3xl p-3.5 flex flex-col items-center text-center justify-between border-2 shadow-lg transition-all ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-700/80 hover:border-amber-400 hover:scale-102 cursor-pointer group'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60 pointer-events-none'
              }`}
            >
              {isUnlocked ? (
                <>
                  {/* Item Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner my-1 group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>

                  {/* Title & Translation */}
                  <div className="mt-1 text-base font-black text-amber-300 font-game uppercase tracking-wide">
                    {item.translation}
                  </div>
                  <div className="text-[11px] font-bold text-slate-300">
                    EN: <span className="text-white font-mono">{item.word}</span>
                  </div>

                  {/* Subject Snippet */}
                  <div className="mt-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 w-full text-left">
                    <div className="text-[9px] font-black text-amber-400 font-game truncate">
                      {learning.title}
                    </div>
                    <p className="text-[9px] text-slate-300 line-clamp-2 leading-tight mt-0.5">
                      {learning.fact}
                    </p>
                  </div>

                  {/* Action Badge */}
                  <div className="mt-2.5 w-full py-1 bg-amber-400/15 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 rounded-xl text-[10px] font-black font-game border border-amber-400/40 transition-all flex items-center justify-center gap-1">
                    <span>📖</span>
                    <span>Buka Pelajaran SD</span>
                  </div>
                </>
              ) : (
                <div className="my-auto py-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-2xl text-slate-500">
                    🔒
                  </div>
                  <div className="mt-3 text-xs font-bold text-slate-400 font-game">
                    Belum Ditemukan
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Jelajahi Dunia Game
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-slate-400 mt-6 font-semibold max-w-xl mx-auto">
        💡 Temukan semua benda di dunia petualangan untuk membuka rangkuman lengkap 5 Mata Pelajaran SD!
      </div>

      {/* DETAILED MULTI-SUBJECT STUDY MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[950] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                    {selectedItem.emoji}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-amber-300 font-game leading-tight uppercase">
                      {selectedItem.translation} ({selectedItem.word})
                    </h2>
                    <p className="text-xs text-slate-300 font-mono">
                      Pelafalan: {selectedItem.phonetic} • Kategori: {selectedItem.category}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-sm font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Subject Tabs Inside Modal */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SD_SUBJECTS.map(subj => {
                  const isActive = activeModalSubject === subj.id;
                  return (
                    <button
                      key={subj.id}
                      onClick={() => {
                        audio.playButtonClick();
                        setActiveModalSubject(subj.id);
                        setQuizAnswered(false);
                        setIsAnswerCorrect(null);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black font-game whitespace-nowrap transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-white shadow-md font-extrabold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>{subj.icon}</span>
                      <span>{subj.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subject Knowledge Content */}
              {(() => {
                const learning = getSubjectLearning(selectedItem, activeModalSubject);
                const meta = SD_SUBJECTS.find(s => s.id === activeModalSubject) || SD_SUBJECTS[0];

                return (
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className={`text-sm font-black font-game ${meta.textColor} flex items-center gap-1.5`}>
                        <span>{meta.icon}</span>
                        <span>{learning.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Kurikulum SD
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                      {learning.fact}
                    </p>

                    {/* Interactive Subject Quiz */}
                    {learning.quiz && (
                      <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                        <span className="text-xs font-black text-amber-300 font-game flex items-center gap-1.5">
                          <span>🎯</span>
                          <span>Kuis Cepat {meta.shortName}: {learning.quiz.question}</span>
                        </span>

                        <div className="grid grid-cols-1 gap-1.5">
                          {learning.quiz.options.map((opt: string, optIdx: number) => {
                            const isRight = optIdx === learning.quiz?.answerIndex;
                            let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
                            if (quizAnswered) {
                              if (isRight) {
                                btnClass = 'bg-emerald-600 text-white border-emerald-400 font-black animate-pulse';
                              } else {
                                btnClass = 'bg-slate-900 text-slate-500 border-slate-800 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizAnswered}
                                onClick={() => handleModalAnswer(optIdx, learning.quiz!.answerIndex)}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-game text-left border transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                {quizAnswered && isRight && <span className="font-black text-emerald-200">✓ Tepat Sekali!</span>}
                              </button>
                            );
                          })}
                        </div>

                        {quizAnswered && (
                          <div
                            className={`p-2 rounded-xl text-xs font-bold ${
                              isAnswerCorrect ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600' : 'bg-amber-950/80 text-amber-300 border border-amber-600'
                            }`}
                          >
                            💡 <span className="font-black">Penjelasan:</span> {learning.quiz.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Audio Controls Row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => audio.speak(selectedItem.word)}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black font-game flex items-center justify-center gap-2 cursor-pointer shadow active:scale-95 transition-all"
                >
                  <span>🇬🇧</span>
                  <span>Dengarkan Bahasa Inggris</span>
                  <span>🔊</span>
                </button>
                <button
                  onClick={() => audio.speakId(`${selectedItem.translation}.`)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black font-game flex items-center justify-center gap-2 cursor-pointer shadow active:scale-95 transition-all"
                >
                  <span>🇮🇩</span>
                  <span>Suara Bahasa Indonesia</span>
                  <span>🔊</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
