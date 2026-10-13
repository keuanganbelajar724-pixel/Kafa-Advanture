import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MiniGameType } from '../../types/game';
import { audio } from '../../services/audio';
import {
  SD_MATH_QUESTIONS,
  SD_SCIENCE_QUESTIONS,
  SD_RELIGION_QUESTIONS,
  SD_ENGLISH_QUESTIONS,
  SD_INDONESIA_QUESTIONS,
  SD_PPKN_QUESTIONS,
  SDQuizQuestion,
} from '../../data/sdCurriculum';

interface MiniGameHubProps {
  initialGame?: MiniGameType;
  onClose: () => void;
  onWinReward: (xp: number, coins: number) => void;
}

export const MiniGameHub: React.FC<MiniGameHubProps> = ({
  initialGame = 'FIND_IT',
  onClose,
  onWinReward,
}) => {
  const [selectedGame, setSelectedGame] = useState<MiniGameType>(initialGame);

  return (
    <div className="fixed inset-0 z-[900] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎪</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white font-game leading-tight">
              ARENA MINI-GAME
            </h2>
            <p className="text-[11px] text-amber-300 font-bold">
              Bermain & Uji Kosakata Bahasa Inggrismu!
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            audio.playButtonClick();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 flex items-center justify-center border-2 border-slate-600 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Mini-Game Tab Selector with Indonesian & English labels */}
      <div className="w-full max-w-xl flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto mb-4 scrollbar-none">
        {[
          { type: 'ENGLISH_QUEST' as MiniGameType, label: '1. Petualangan Inggris', icon: '🇬🇧' },
          { type: 'MATH_CHALLENGE' as MiniGameType, label: '2. Matematika SD', icon: '📐' },
          { type: 'SCIENCE_QUIZ' as MiniGameType, label: '3. IPA Sains SD', icon: '🔬' },
          { type: 'INDONESIA_CHALLENGE' as MiniGameType, label: '4. B. Indonesia SD', icon: '🇮🇩' },
          { type: 'PPKN_CHALLENGE' as MiniGameType, label: '5. PPKn & Nusantara', icon: '🦅' },
          { type: 'RELIGION_VALUES' as MiniGameType, label: '6. Budi Pekerti & Agama', icon: '🕌' },
          { type: 'FIND_IT' as MiniGameType, label: '7. Cari Benda', icon: '🔍' },
          { type: 'MATCH_IT' as MiniGameType, label: '8. Cocokkan', icon: '🃏' },
          { type: 'LISTEN_AND_FIND' as MiniGameType, label: '9. Dengar Suara', icon: '🎧' },
          { type: 'WORD_PUZZLE' as MiniGameType, label: '10. Susun Huruf', icon: '🔤' },
          { type: 'BUILD_SENTENCE' as MiniGameType, label: '11. Susun Kalimat', icon: '💬' },
        ].map(tab => (
          <button
            key={tab.type}
            onClick={() => {
              audio.playButtonClick();
              setSelectedGame(tab.type);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-game whitespace-nowrap transition-all cursor-pointer ${
              selectedGame === tab.type
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Play Area */}
      <div className="w-full max-w-xl bg-white rounded-3xl p-5 md:p-6 shadow-2xl border-4 border-amber-300">
        {selectedGame === 'ENGLISH_QUEST' && (
          <SDSubjectQuizGame
            title="Kuis Petualangan Bahasa Inggris SD"
            emoji="🇬🇧"
            questions={SD_ENGLISH_QUESTIONS}
            accentColor="amber"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'MATH_CHALLENGE' && (
          <SDSubjectQuizGame
            title="Tantangan Berhitung Matematika SD"
            emoji="📐"
            questions={SD_MATH_QUESTIONS}
            accentColor="blue"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'SCIENCE_QUIZ' && (
          <SDSubjectQuizGame
            title="Kuis Cerdas IPA & Sains Alam SD"
            emoji="🔬"
            questions={SD_SCIENCE_QUESTIONS}
            accentColor="emerald"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'INDONESIA_CHALLENGE' && (
          <SDSubjectQuizGame
            title="Kuis Kosakata & Sastra Bahasa Indonesia"
            emoji="🇮🇩"
            questions={SD_INDONESIA_QUESTIONS}
            accentColor="red"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'PPKN_CHALLENGE' && (
          <SDSubjectQuizGame
            title="Pendidikan Pancasila & Wawasan Nusantara"
            emoji="🦅"
            questions={SD_PPKN_QUESTIONS}
            accentColor="indigo"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'RELIGION_VALUES' && (
          <SDSubjectQuizGame
            title="Tebak Akhlak, Doa & Budi Pekerti SD"
            emoji="🕌"
            questions={SD_RELIGION_QUESTIONS}
            accentColor="purple"
            onWin={onWinReward}
          />
        )}
        {selectedGame === 'FIND_IT' && (
          <FindItGame onWin={onWinReward} />
        )}
        {selectedGame === 'MATCH_IT' && (
          <MatchItGame onWin={onWinReward} />
        )}
        {selectedGame === 'LISTEN_AND_FIND' && (
          <ListenAndFindGame onWin={onWinReward} />
        )}
        {selectedGame === 'WORD_PUZZLE' && (
          <WordPuzzleGame onWin={onWinReward} />
        )}
        {selectedGame === 'BUILD_SENTENCE' && (
          <BuildSentenceGame onWin={onWinReward} />
        )}
      </div>
    </div>
  );
};

// ==========================================
// MINI GAME 1: FIND IT
// ==========================================
function FindItGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const rounds = [
    { targetWord: 'BOOK', targetId: 'Buku', targetEmoji: '📖', options: ['📖', '🎒', '👟', '⚽'] },
    { targetWord: 'BAG', targetId: 'Tas', targetEmoji: '🎒', options: ['🪟', '🎒', '🚪', '🐱'] },
    { targetWord: 'CAT', targetId: 'Kucing', targetEmoji: '🐱', options: ['🪵', '🪑', '🐱', '📖'] },
  ];

  const current = rounds[round];

  const handleSelect = (emoji: string) => {
    if (emoji === current.targetEmoji) {
      audio.playCorrect();
      const nextScore = score + 1;
      setScore(nextScore);

      if (round + 1 < rounds.length) {
        setRound(round + 1);
      } else {
        setIsDone(true);
        confetti({ particleCount: 70, spread: 60 });
        onWin(30, 15);
      }
    } else {
      audio.playWrong();
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-game">
        Permainan 1: Cari Benda (Find It)
      </div>

      {!isDone ? (
        <>
          <div className="mt-2 text-2xl font-black text-slate-900 font-game">
            Cari: <span className="text-amber-500 underline uppercase">{current.targetWord}</span>!
          </div>

          <div className="mt-1 text-sm font-bold text-slate-600">
            Artinya: <span className="text-emerald-700 font-black">{current.targetId}</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => audio.speak(`Find the ${current.targetWord}`)}
              className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-sky-200 cursor-pointer"
            >
              <span>🔊</span>
              <span>Dengar Bahasa Inggris</span>
            </button>
            <button
              onClick={() => audio.speakId(`Cari ${current.targetId}`)}
              className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-amber-200 cursor-pointer"
            >
              <span>🇮🇩</span>
              <span>Dengar Arti</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
            {current.options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt)}
                className="h-28 bg-sky-50 hover:bg-amber-100 border-2 border-sky-200 hover:border-amber-400 rounded-3xl flex items-center justify-center text-5xl shadow-md transition-colors cursor-pointer"
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-xs font-bold text-slate-500 font-game">
            Babak {round + 1} dari {rounds.length}
          </div>
        </>
      ) : (
        <div className="py-6 flex flex-col items-center">
          <div className="text-5xl animate-bounce">🏆</div>
          <div className="text-2xl font-black text-amber-950 font-game mt-2">
            Hebat Sekali! Semua Ditemukan!
          </div>
          <div className="text-sm font-bold text-emerald-600 mt-1">
            +30 XP · +15 Koin Berhasil Didapatkan!
          </div>
          <button
            onClick={() => {
              setRound(0);
              setScore(0);
              setIsDone(false);
            }}
            className="mt-5 px-6 py-2.5 bg-amber-400 text-slate-950 rounded-2xl font-bold font-game shadow-md hover:bg-amber-300 cursor-pointer"
          >
            Main Lagi 🔄
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MINI GAME 2: MATCH IT (Pairs matching)
// ==========================================
function MatchItGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const cards = [
    { id: '1', word: 'APPLE', label: 'APPLE (Apel)', emoji: '🍎', type: 'word' },
    { id: '2', word: 'APPLE', label: '🍎', emoji: '🍎', type: 'emoji' },
    { id: '3', word: 'BALL', label: 'BALL (Bola)', emoji: '⚽', type: 'word' },
    { id: '4', word: 'BALL', label: '⚽', emoji: '⚽', type: 'emoji' },
    { id: '5', word: 'SHOES', label: 'SHOES (Sepatu)', emoji: '👟', type: 'word' },
    { id: '6', word: 'SHOES', label: '👟', emoji: '👟', type: 'emoji' },
  ];

  const [selectedFirst, setSelectedFirst] = useState<number | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  const handleCardClick = (index: number) => {
    if (matched.includes(cards[index].word)) return;
    if (selectedFirst === null) {
      audio.playButtonClick();
      setSelectedFirst(index);
    } else {
      if (selectedFirst === index) return;
      const first = cards[selectedFirst];
      const second = cards[index];

      if (first.word === second.word && first.type !== second.type) {
        audio.playCorrect();
        const nextMatched = [...matched, first.word];
        setMatched(nextMatched);
        setSelectedFirst(null);

        if (nextMatched.length === 3) {
          confetti({ particleCount: 70, spread: 60 });
          onWin(35, 20);
        }
      } else {
        audio.playWrong();
        setTimeout(() => setSelectedFirst(null), 500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-game">
        Permainan 2: Cocokkan Pasangan (Match It)
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900 font-game">
        Pasangkan Kata dengan Gambarnya!
      </div>
      <div className="text-xs font-semibold text-slate-500 mt-1">
        Tekan kata bahasa Inggris lalu tekan gambar yang cocok.
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 w-full">
        {cards.map((card, i) => {
          const isMatched = matched.includes(card.word);
          const isSelected = selectedFirst === i;

          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(i)}
              className={`h-24 rounded-2xl border-2 flex items-center justify-center font-black font-game text-xs md:text-sm shadow transition-all cursor-pointer p-2 ${
                isMatched
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60'
                  : isSelected
                  ? 'bg-amber-300 border-amber-500 text-amber-950 scale-105'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50'
              }`}
            >
              {card.type === 'word' ? (
                <span className="text-center leading-tight">{card.label}</span>
              ) : (
                <span className="text-4xl">{card.emoji}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {matched.length === 3 && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-900 text-xs font-bold font-game">
          🎉 Luar Biasa! Semua kartu cocok! +35 XP · +20 Koin
        </div>
      )}
    </div>
  );
}

// ==========================================
// MINI GAME 3: LISTEN & FIND
// ==========================================
function ListenAndFindGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [round, setRound] = useState(0);
  const [completed, setCompleted] = useState(false);

  const questions = [
    { targetWord: 'BALL', phrase: 'Find the ball', idHint: 'Cari bola bundar', options: ['⚽', '🎒', '📖', '🪑'], correct: '⚽' },
    { targetWord: 'CAT', phrase: 'Where is the cat?', idHint: 'Di mana kucingnya?', options: ['🚪', '🐱', '🪟', '👟'], correct: '🐱' },
    { targetWord: 'BED', phrase: 'Point to the bed', idHint: 'Tunjukkan tempat tidur', options: ['🪵', '🛏️', '🍎', '⚽'], correct: '🛏️' },
  ];

  const currentQ = questions[round];

  const playAudioEn = () => {
    audio.speak(currentQ.phrase);
  };

  const playAudioId = () => {
    audio.speakId(currentQ.idHint);
  };

  const handlePick = (opt: string) => {
    if (opt === currentQ.correct) {
      audio.playCorrect();
      if (round + 1 < questions.length) {
        setRound(round + 1);
      } else {
        setCompleted(true);
        confetti({ particleCount: 70, spread: 60 });
        onWin(35, 20);
      }
    } else {
      audio.playWrong();
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-game">
        Permainan 3: Dengar & Tebak (Listen & Find)
      </div>

      {!completed ? (
        <>
          <div className="mt-2 text-xl font-black text-slate-900 font-game">
            Tekan Speaker, Dengarkan, Lalu Pilih Bendanya!
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAudioEn}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl border-2 border-indigo-300 shadow-xl flex items-center gap-2 text-sm font-black font-game cursor-pointer animate-pulse"
            >
              <span className="text-xl">🔊</span>
              <span>Dengar Bahasa Inggris</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAudioId}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl border-2 border-white shadow-xl flex items-center gap-1.5 text-xs font-black font-game cursor-pointer"
            >
              <span>🇮🇩</span>
              <span>Bantuan Arti</span>
            </motion.button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
            {currentQ.options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePick(opt)}
                className="h-24 bg-sky-50 hover:bg-indigo-50 border-2 border-sky-200 hover:border-indigo-300 rounded-2xl flex items-center justify-center text-4xl shadow cursor-pointer"
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-xs font-bold text-slate-500 font-game">
            Babak {round + 1} dari {questions.length}
          </div>
        </>
      ) : (
        <div className="py-6 flex flex-col items-center">
          <div className="text-5xl animate-bounce">🎧</div>
          <div className="text-2xl font-black text-indigo-950 font-game mt-2">
            Pendengar yang Sangat Pintar!
          </div>
          <div className="text-sm font-bold text-emerald-600 mt-1">
            +35 XP · +20 Koin Berhasil Didapatkan!
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MINI GAME 4: WORD PUZZLE (Letter Unscramble)
// ==========================================
function WordPuzzleGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [wordIdx, setWordIdx] = useState(0);
  const words = [
    { word: 'BAG', idWord: 'Tas', emoji: '🎒', letters: ['G', 'B', 'A'] },
    { word: 'BOOK', idWord: 'Buku', emoji: '📖', letters: ['O', 'B', 'K', 'O'] },
    { word: 'CAT', idWord: 'Kucing', emoji: '🐱', letters: ['T', 'A', 'C'] },
  ];

  const current = words[wordIdx];
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>(current.letters);
  const [isSuccess, setIsSuccess] = useState(false);

  const addLetter = (letter: string, index: number) => {
    audio.playButtonClick();
    const nextUser = [...userLetters, letter];
    const nextAvail = availableLetters.filter((_, i) => i !== index);
    setUserLetters(nextUser);
    setAvailableLetters(nextAvail);

    // Check completion
    if (nextUser.join('') === current.word) {
      audio.playCorrect();
      setIsSuccess(true);
      if (wordIdx + 1 < words.length) {
        setTimeout(() => {
          setWordIdx(wordIdx + 1);
          setUserLetters([]);
          setAvailableLetters(words[wordIdx + 1].letters);
          setIsSuccess(false);
        }, 1200);
      } else {
        confetti({ particleCount: 70, spread: 60 });
        onWin(40, 20);
      }
    } else if (nextUser.length === current.word.length) {
      audio.playWrong();
    }
  };

  const resetWord = () => {
    setUserLetters([]);
    setAvailableLetters(current.letters);
    setIsSuccess(false);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-game">
        Permainan 4: Susun Huruf (Word Puzzle)
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900 font-game">
        Susun Huruf: {current.emoji} {current.word}
      </div>
      <div className="text-xs font-bold text-amber-800">
        Artinya: {current.idWord}
      </div>

      {/* Target Slots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {current.word.split('').map((_, i) => (
          <div
            key={i}
            className={`w-14 h-16 rounded-2xl border-4 flex items-center justify-center text-2xl font-black font-game shadow ${
              userLetters[i]
                ? isSuccess
                  ? 'bg-emerald-400 border-emerald-600 text-white'
                  : 'bg-amber-400 border-amber-600 text-slate-950'
                : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
            }`}
          >
            {userLetters[i] || ''}
          </div>
        ))}
      </div>

      {/* Available Letter Tiles to Tap */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {availableLetters.map((l, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addLetter(l, i)}
            className="w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-2xl font-black font-game border-b-4 border-sky-700 shadow-lg cursor-pointer"
          >
            {l}
          </motion.button>
        ))}
      </div>

      <button
        onClick={resetWord}
        className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-700 underline font-game cursor-pointer"
      >
        Ulangi Huruf ↺
      </button>
    </div>
  );
}

// ==========================================
// MINI GAME 5: BUILD THE SENTENCE
// ==========================================
function BuildSentenceGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([
    'LIKE', 'I', 'APPLES'
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAdd = (token: string, idx: number) => {
    audio.playButtonClick();
    const nextSelected = [...selectedTokens, token];
    const nextAvail = availableTokens.filter((_, i) => i !== idx);
    setSelectedTokens(nextSelected);
    setAvailableTokens(nextAvail);

    if (nextSelected.join(' ') === 'I LIKE APPLES') {
      audio.playCorrect();
      setIsSuccess(true);
      confetti({ particleCount: 70, spread: 60 });
      onWin(40, 25);
    } else if (nextSelected.length === 3) {
      audio.playWrong();
    }
  };

  const handleReset = () => {
    setSelectedTokens([]);
    setAvailableTokens(['LIKE', 'I', 'APPLES']);
    setIsSuccess(false);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-game">
        Permainan 5: Susun Kalimat (Sentence Builder)
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900 font-game">
        Susun Kalimat Bahasa Inggris 🍎
      </div>

      <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
        Arti Kalimat: "Saya suka apel"
      </div>

      {/* Sentence Drop Zone */}
      <div className="mt-6 min-h-16 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-2.5 flex items-center justify-center gap-2">
        {selectedTokens.length === 0 ? (
          <span className="text-xs text-slate-400 font-bold">Tekan kata di bawah ini secara berurutan...</span>
        ) : (
          selectedTokens.map((w, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-xl text-sm font-black font-game shadow ${
                isSuccess ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'
              }`}
            >
              {w}
            </span>
          ))
        )}
      </div>

      {/* Word Blocks */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {availableTokens.map((w, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAdd(w, i)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm font-game border-b-4 border-indigo-900 shadow-lg cursor-pointer"
          >
            {w}
          </motion.button>
        ))}
      </div>

      {isSuccess && (
        <div className="mt-4 p-2 bg-emerald-100 rounded-xl text-emerald-900 text-xs font-bold font-game">
          🎉 Benar Sekali! "I LIKE APPLES." (Saya Suka Apel) +40 XP · +25 Koin!
        </div>
      )}

      <button
        onClick={handleReset}
        className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-700 underline font-game cursor-pointer"
      >
        Hapus Kalimat ↺
      </button>
    </div>
  );
}

// ==========================================
// DEDICATED SD SUBJECT QUIZ ENGINE
// ==========================================
interface SDSubjectQuizGameProps {
  title: string;
  emoji: string;
  questions: SDQuizQuestion[];
  accentColor: 'blue' | 'emerald' | 'purple' | 'amber' | 'red' | 'indigo';
  onWin: (xp: number, coins: number) => void;
}

function SDSubjectQuizGame({
  title,
  emoji,
  questions,
  accentColor,
  onWin,
}: SDSubjectQuizGameProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const current = questions[index];

  const handleChoose = (optIdx: number) => {
    if (isAnswered) return;

    setSelectedOpt(optIdx);
    setIsAnswered(true);

    const isCorrect = optIdx === current.answerIndex;
    if (isCorrect) {
      audio.playCorrect();
      setScore(s => s + 1);
    } else {
      audio.playWrong();
    }
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex(i => i + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsDone(true);
      confetti({ particleCount: 80, spread: 70 });
      onWin(score * 20 + 30, score * 10 + 15);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setIsDone(false);
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <span className="text-6xl animate-bounce mb-3">{emoji}</span>
        <h3 className="text-2xl font-black text-slate-800 font-game">
          Luar Biasa, Siswa Pintar! 🎓
        </h3>
        <p className="text-sm font-bold text-slate-600 mt-1">
          Kamu menjawab <span className="text-emerald-600 font-black">{score}</span> dari {questions.length} tantangan dengan benar!
        </p>

        <div className="my-5 p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-center justify-center gap-4">
          <span className="text-xs font-black text-amber-950 font-game">
            Hadiah Belajar: +{score * 20 + 30} XP • +{score * 10 + 15} 🪙 Koin
          </span>
        </div>

        <button
          onClick={handleRestart}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-sm font-game shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          Mainkan Lagi ↺
        </button>
      </div>
    );
  }

  const badgeBg =
    accentColor === 'blue'
      ? 'bg-blue-600'
      : accentColor === 'emerald'
      ? 'bg-emerald-600'
      : accentColor === 'amber'
      ? 'bg-amber-500'
      : accentColor === 'red'
      ? 'bg-rose-600'
      : accentColor === 'indigo'
      ? 'bg-indigo-600'
      : 'bg-purple-600';

  return (
    <div className="flex flex-col items-center">
      {/* Quiz Progress Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs font-black font-game text-slate-800">{title}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] font-game">
          Soal {index + 1} / {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 my-2 text-center">
        <span className="text-3xl block mb-2">{current.hintEmoji}</span>
        <p className="text-base font-black text-slate-800 leading-snug font-game">
          {current.question}
        </p>
      </div>

      {/* Answer Options */}
      <div className="w-full grid grid-cols-1 gap-2 my-2">
        {current.options.map((opt, optIdx) => {
          const isChosen = selectedOpt === optIdx;
          const isRight = optIdx === current.answerIndex;

          let btnClass = 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200';
          if (isAnswered) {
            if (isRight) {
              btnClass = 'bg-emerald-500 text-white border-2 border-emerald-600 font-black animate-pulse';
            } else if (isChosen && !isRight) {
              btnClass = 'bg-rose-500 text-white border-2 border-rose-600 font-bold';
            } else {
              btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
            }
          }

          return (
            <button
              key={optIdx}
              disabled={isAnswered}
              onClick={() => handleChoose(optIdx)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-game font-bold text-left transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-98 ${btnClass}`}
            >
              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
              {isAnswered && isRight && <span className="font-black text-sm">✓ Benar!</span>}
              {isAnswered && isChosen && !isRight && <span className="font-black text-sm">✕ Kurang Tepat</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner & Next Button */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-2 flex flex-col gap-2"
        >
          <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 text-left">
            💡 <span className="font-black text-slate-800">Penjelasan:</span> {current.explanation}
          </div>

          <button
            onClick={handleNext}
            className={`w-full py-3 ${badgeBg} hover:opacity-90 text-white rounded-xl font-black text-xs font-game shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5`}
          >
            <span>Lanjut Soal Berikutnya</span>
            <span>➔</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
