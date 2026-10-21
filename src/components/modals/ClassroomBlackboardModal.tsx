import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { audio } from '../../services/audio';

interface ClassroomBlackboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (xp: number, coins: number, stars?: number) => void;
  initialTab?: 'QUIZ' | 'ASTRONOMI' | 'LITERASI' | 'TRIVIA' | 'DOODLE';
}

interface QuizQuestion {
  id: string;
  category: 'MATH' | 'ENGLISH' | 'SCIENCE' | 'CHARACTER' | 'ASTRONOMY';
  badge: string;
  question: string;
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
  funFact: string;
}

const CLASSROOM_QUESTIONS: QuizQuestion[] = [
  {
    id: 'math_1',
    category: 'MATH',
    badge: '🔢 MATEMATIKA CERIA',
    question: 'Kafa memiliki 15 buku cerita. Ia mendapat hadiah 10 buku lagi dari gurunya. Berapa jumlah seluruh buku Kafa sekarang?',
    options: [
      { label: 'A. 20 Buku', isCorrect: false },
      { label: 'B. 25 Buku', isCorrect: true },
      { label: 'C. 30 Buku', isCorrect: false },
    ],
    explanation: '15 + 10 = 25 buku. Penjumlahan adalah menggabungkan dua kelompok benda menjadi satu kesatuan!',
    funFact: 'Angka 0 (nol) pertama kali ditemukan dan digunakan oleh matematikawan India kuno bernama Brahmagupta pada abad ke-7!',
  },
  {
    id: 'astro_1',
    category: 'ASTRONOMY',
    badge: '🌌 ASTRONOMI & TATA SURYA',
    question: 'Planet apakah yang merupakan planet terbesar di sistem tata surya kita?',
    options: [
      { label: 'A. Mars', isCorrect: false },
      { label: 'B. Jupiter', isCorrect: true },
      { label: 'C. Saturnus', isCorrect: false },
    ],
    explanation: 'Jupiter adalah planet terbesar! Diameternya 11 kali lebih besar dari Bumi dan bisa memuat lebih dari 1.300 planet seukuran Bumi di dalamnya!',
    funFact: 'Jupiter memiliki badai raksasa berwarna merah (Great Red Spot) yang telah berputar tanpa henti selama lebih dari 350 tahun!',
  },
  {
    id: 'eng_1',
    category: 'ENGLISH',
    badge: '🇬🇧 BAHASA INGGRIS KELAS',
    question: 'Di kelas, kita menulis catatan menggunakan pensil dan menghapus kesalahan dengan...',
    options: [
      { label: 'A. ERASER (Penghapus)', isCorrect: true },
      { label: 'B. SCISSORS (Gunting)', isCorrect: false },
      { label: 'C. BACKPACK (Tas)', isCorrect: false },
    ],
    explanation: 'ERASER artinya penghapus. Di Inggris juga sering disebut "Rubber"!',
    funFact: 'Sebelum penghapus karet ditemukan pada tahun 1770, orang-orang zaman dulu menggunakan gumpalan roti tawar yang diremas untuk menghapus coretan pensil!',
  },
  {
    id: 'sci_1',
    category: 'SCIENCE',
    badge: '🔬 IPA & SAINS SD',
    question: 'Tumbuhan hijau membutuhkan cahaya matahari, air, dan udara untuk memasak makanannya sendiri. Proses ini disebut...',
    options: [
      { label: 'A. Fotosintesis', isCorrect: true },
      { label: 'B. Hibernasi', isCorrect: false },
      { label: 'C. Metamorfosis', isCorrect: false },
    ],
    explanation: 'Fotosintesis berasal dari kata "foto" (cahaya) dan "sintesis" (penggabungan). Hasilnya adalah oksigen segar yang kita hirup!',
    funFact: 'Satu pohon rindang berdaun lebat mampu menghasilkan oksigen bersih untuk kebutuhan bernapas 4 orang manusia setiap hari!',
  },
  {
    id: 'astro_2',
    category: 'ASTRONOMY',
    badge: '🌌 ASTRONOMI & TATA SURYA',
    question: 'Berapakah urutan posisi planet Bumi dari Matahari?',
    options: [
      { label: 'A. Planet Pertama', isCorrect: false },
      { label: 'B. Planet Kedua', isCorrect: false },
      { label: 'C. Planet Ketiga', isCorrect: true },
    ],
    explanation: 'Urutan planet dari Matahari: Merkurius (1), Venus (2), Bumi (3), Mars (4), Jupiter (5), Saturnus (6), Uranus (7), Neptunus (8).',
    funFact: 'Bumi berada di zona "Goldilocks", yaitu jarak yang sangat pas dari Matahari sehingga air bisa tetap cair dan kehidupan bisa berkembang subur!',
  },
  {
    id: 'math_2',
    category: 'MATH',
    badge: '🔢 MATEMATIKA CERIA',
    question: 'Berapakah hasil dari 8 dikali 5 (8 × 5)?',
    options: [
      { label: 'A. 35', isCorrect: false },
      { label: 'B. 40', isCorrect: true },
      { label: 'C. 45', isCorrect: false },
    ],
    explanation: '8 × 5 = 40. Perkalian adalah penjumlahan berulang: 8 + 8 + 8 + 8 + 8 = 40!',
    funFact: 'Perkalian angka 9 punya keajaiban unik: jika digit hasilnya dijumlahkan, selalu menghasilkan angka 9 (misal: 9×2=18 -> 1+8=9, 9×5=45 -> 4+5=9)!',
  },
  {
    id: 'eng_2',
    category: 'ENGLISH',
    badge: '🇬🇧 BAHASA INGGRIS KELAS',
    question: 'Apa arti kata bahasa Inggris "CHALKBOARD"?',
    options: [
      { label: 'A. Papan Tulis', isCorrect: true },
      { label: 'B. Papan Catur', isCorrect: false },
      { label: 'C. Papan Luncur', isCorrect: false },
    ],
    explanation: 'CHALKBOARD terdiri dari kata "Chalk" (kapur) dan "Board" (papan).',
    funFact: 'Papan tulis zaman dulu berwarna hitam legam karena terbuat dari batu tulis alam, sebelum berganti warna hijau karena lebih ramah di mata siswa!',
  },
  {
    id: 'char_1',
    category: 'CHARACTER',
    badge: '❤️ BUDI PEKERTI & PKN',
    question: 'Ketika bertemu bapak atau ibu guru di koridor sekolah, sikap terpuji yang harus kita lakukan adalah...',
    options: [
      { label: 'A. Pura-pura tidak melihat dan lari', isCorrect: false },
      { label: 'B. Mengucapkan salam dan tersenyum ramah', isCorrect: true },
      { label: 'C. Berbicara keras-keras', isCorrect: false },
    ],
    explanation: 'Menyapa guru dengan sopan dan tersenyum mencerminkan akhlak terpuji dan rasa hormat kepada pahlawan tanpa tanda jasa.',
    funFact: 'Tersenyum saat menyapa teman dan guru dapat memicu pelepasan hormon endorfin di otak yang membuat suasana kelas menjadi bahagia dan bersemangat!',
  },
  {
    id: 'math_3',
    category: 'MATH',
    badge: '🔢 MATEMATIKA CERIA',
    question: 'Sebuah bangun datar memiliki 3 sisi dan 3 sudut. Bangun apakah itu?',
    options: [
      { label: 'A. Segi Empat', isCorrect: false },
      { label: 'B. Segitiga', isCorrect: true },
      { label: 'C. Lingkaran', isCorrect: false },
    ],
    explanation: 'Segitiga memiliki 3 sisi dan 3 sudut. Jumlah seluruh sudut dalam segitiga selalu 180 derajat!',
    funFact: 'Piramida agung di Mesir dibangun dengan 4 sisi berbentuk segitiga karena bentuk ini menyebarkan beban secara merata ke tanah sehingga kokoh selama ribuan tahun!',
  },
];

export const ClassroomBlackboardModal: React.FC<ClassroomBlackboardModalProps> = ({
  isOpen,
  onClose,
  onReward,
  initialTab = 'QUIZ',
}) => {
  const [activeTab, setActiveTab] = useState<'QUIZ' | 'ASTRONOMI' | 'LITERASI' | 'TRIVIA' | 'DOODLE'>(initialTab);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [chalkColor, setChalkColor] = useState<string>('#FFFFFF');
  const [chalkSize, setChalkSize] = useState<number>(4);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedPlanetIndex, setSelectedPlanetIndex] = useState<number>(2); // Default: Bumi

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Doodle Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentQ = CLASSROOM_QUESTIONS[currentQuestionIndex];

  // Setup chalkboard canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'DOODLE') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high display DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial Chalkboard background wash
    ctx.fillStyle = '#0f291e';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Welcome chalk message
    ctx.font = 'bold 16px "Comic Sans MS", cursive, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('✏️ Papan Tulis Kapur Sahabat Kafa', 20, 36);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#A7F3D0';
    ctx.fillText('Ayo gambar atau tulis sesukamu di sini!', 20, 60);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSpeakQuestion = () => {
    setIsSpeaking(true);
    const textToRead = `${currentQ.question}. Pilihan A: ${currentQ.options[0].label}. Pilihan B: ${currentQ.options[1].label}. Pilihan C: ${currentQ.options[2].label}.`;
    audio.speakId(textToRead, () => setIsSpeaking(false));
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      audio.playCorrect();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      onReward(30, 15, 1);
    } else {
      audio.playWrong();
    }
  };

  const handleNextQuestion = () => {
    audio.playButtonClick();
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % CLASSROOM_QUESTIONS.length);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isDrawingRef.current = true;
    lastPosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = chalkSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 1.5;
    ctx.shadowColor = chalkColor;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastPosRef.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    audio.playButtonClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#0f291e';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const stampIcon = (icon: string) => {
    audio.playPowerUp();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.font = '36px sans-serif';
    ctx.fillText(icon, rect.width / 2 - 18 + (Math.random() * 80 - 40), rect.height / 2 + (Math.random() * 60 - 30));
  };

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c382b] via-[#142e22] to-[#0d2118] rounded-3xl p-5 md:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.3)] border-4 border-amber-600 text-white flex flex-col my-auto"
      >
        {/* Wooden Chalkboard Frame Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg border-2 border-white/40">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-game">
                  KELAS CERIA SAHABAT KAFA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                  PAPAN TULIS SD
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white font-game drop-shadow">
                Pusat Belajar & Kuis Interaktif
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm border border-slate-600 shadow cursor-pointer transition-all active:scale-95"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Feature Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveTab('QUIZ');
            }}
            className={`py-2 px-3 rounded-xl font-game text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'QUIZ'
                ? 'bg-amber-400 text-slate-950 shadow-lg scale-102 ring-2 ring-white'
                : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <span>📝</span>
            <span>KUIS PINTAR</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveTab('ASTRONOMI');
            }}
            className={`py-2 px-3 rounded-xl font-game text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ASTRONOMI'
                ? 'bg-cyan-400 text-slate-950 shadow-lg scale-102 ring-2 ring-white'
                : 'bg-slate-900/80 text-cyan-200 hover:bg-slate-800 border border-cyan-700/60'
            }`}
          >
            <span>🌌</span>
            <span>TATA SURYA</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveTab('LITERASI');
            }}
            className={`py-2 px-3 rounded-xl font-game text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'LITERASI'
                ? 'bg-amber-400 text-slate-950 shadow-lg scale-102 ring-2 ring-white'
                : 'bg-amber-950/80 text-amber-200 hover:bg-amber-900 border border-amber-700/60'
            }`}
          >
            <span>📚</span>
            <span>LITERASI NUSANTARA</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveTab('TRIVIA');
            }}
            className={`py-2 px-3 rounded-xl font-game text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'TRIVIA'
                ? 'bg-emerald-400 text-slate-950 shadow-lg scale-102 ring-2 ring-white'
                : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900 border border-emerald-700/60'
            }`}
          >
            <span>💡</span>
            <span>FAKTA SAINS</span>
          </button>

          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveTab('DOODLE');
            }}
            className={`py-2 px-3 rounded-xl font-game text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'DOODLE'
                ? 'bg-fuchsia-400 text-slate-950 shadow-lg scale-102 ring-2 ring-white'
                : 'bg-purple-950/80 text-purple-200 hover:bg-purple-900 border border-purple-700/60'
            }`}
          >
            <span>✏️</span>
            <span>TULIS KAPUR</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: KUIS PINTAR SD (EDUCATIONAL QUIZ)                 */}
        {/* ======================================================== */}
        {activeTab === 'QUIZ' && (
          <div className="space-y-4">
            {/* Question Card styled like chalk on blackboard */}
            <div className="bg-[#0b2118] border-2 border-emerald-500/50 rounded-2xl p-4 md:p-5 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-amber-300 font-game bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {currentQ.badge}
                </span>

                <button
                  onClick={handleSpeakQuestion}
                  className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400 text-amber-300 text-xs font-bold font-game flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Dengarkan Soal Dibacakan"
                >
                  <span>{isSpeaking ? '🔊 Membaca...' : '🔈 Dengarkan Soal'}</span>
                </button>
              </div>

              <p className="text-base md:text-lg font-bold text-white font-game leading-relaxed mb-3">
                "{currentQ.question}"
              </p>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isThisCorrect = isSelected && opt.isCorrect;
                  const isThisWrong = isSelected && !opt.isCorrect;

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full p-3 rounded-xl border-2 text-left font-game text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-between ${
                        isThisCorrect
                          ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg ring-2 ring-white scale-101'
                          : isThisWrong
                          ? 'bg-rose-600 border-rose-400 text-white animate-shake'
                          : 'bg-emerald-900/60 hover:bg-emerald-800/80 border-emerald-600/70 text-emerald-100 hover:border-amber-400'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isThisCorrect && <span>✅ BENAR! (+30 XP +15 🪙 +1 ⭐)</span>}
                      {isThisWrong && <span>❌ Coba Pikirkan Lagi</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Fun Fact on Answer */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-3 border-t border-emerald-700/60 space-y-2 text-xs"
                >
                  <div className="p-3 bg-emerald-900/70 rounded-xl border border-emerald-500/40 text-emerald-200">
                    <span className="font-bold text-amber-300">💡 Penjelasan: </span>
                    {currentQ.explanation}
                  </div>
                  <div className="p-2.5 bg-amber-950/60 rounded-xl border border-amber-400/40 text-amber-200 text-[11px] italic">
                    <span className="font-bold text-yellow-300">⭐ Fakta Menarik: </span>
                    "{currentQ.funFact}"
                  </div>
                </motion.div>
              )}
            </div>

            {/* Next Question Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-emerald-300/80 font-game">
                Soal {currentQuestionIndex + 1} dari {CLASSROOM_QUESTIONS.length}
              </span>
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black font-game text-xs shadow-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>SOAL BERIKUTNYA</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ASTRONOMI & SISTEM TATA SURYA                       */}
        {/* ======================================================== */}
        {activeTab === 'ASTRONOMI' && (
          <div className="space-y-4">
            {/* Planet Selector Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { name: 'Matahari', en: 'Sun', emoji: '☀️', color: 'from-amber-500 to-yellow-400' },
                { name: 'Merkurius', en: 'Mercury', emoji: '🌑', color: 'from-stone-400 to-slate-500' },
                { name: 'Venus', en: 'Venus', emoji: '🌕', color: 'from-amber-300 to-orange-400' },
                { name: 'Bumi', en: 'Earth', emoji: '🌍', color: 'from-blue-500 to-emerald-400' },
                { name: 'Mars', en: 'Mars', emoji: '🔴', color: 'from-rose-600 to-red-500' },
                { name: 'Jupiter', en: 'Jupiter', emoji: '🪐', color: 'from-orange-400 to-amber-600' },
                { name: 'Saturnus', en: 'Saturn', emoji: '🪐', color: 'from-yellow-300 to-amber-500' },
                { name: 'Uranus', en: 'Uranus', emoji: '🌐', color: 'from-cyan-300 to-blue-400' },
                { name: 'Neptunus', en: 'Neptune', emoji: '🔵', color: 'from-blue-600 to-indigo-600' },
              ].map((pl, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => {
                    audio.playButtonClick();
                    setSelectedPlanetIndex(pIdx);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer min-w-[70px] ${
                    selectedPlanetIndex === pIdx
                      ? 'bg-gradient-to-b ' + pl.color + ' border-white text-slate-950 scale-105 shadow-lg font-black'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl animate-pulse">{pl.emoji}</span>
                  <span className="text-[10px] font-game mt-1 truncate">{pl.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Planet Feature Card */}
            {(() => {
              const PLANET_DATA = [
                {
                  id: 'sun',
                  name: 'MATAHARI (THE SUN)',
                  title: 'Bintang Raksasa Pusat Tata Surya',
                  icon: '☀️',
                  distance: 'Pusat Tata Surya (0 km)',
                  diameter: '1.392.700 km (109x Bumi)',
                  temp: '5.500°C di permukaan, 15 juta°C di inti',
                  fact: 'Matahari menghasilkan cahaya dan energi panas melalui reaksi fusi nuklir. Tanpa sinar Matahari, bumi akan membeku dan tidak akan ada tumbuhan atau kehidupan!',
                  color: 'from-amber-950 via-yellow-950 to-slate-950 border-amber-400',
                  badge: 'BINTANG INDUK',
                },
                {
                  id: 'mercury',
                  name: 'MERKURIUS (MERCURY)',
                  title: 'Planet Terdekat & Tercepat Mengelilingi Matahari',
                  icon: '🌑',
                  distance: '58 juta km dari Matahari',
                  diameter: '4.879 km (Sedikit lebih besar dari Bulan)',
                  temp: 'Siang: 430°C • Malam: -180°C',
                  fact: 'Merkurius mengitari Matahari hanya dalam 88 hari Bumi! Namun karena hampir tidak memiliki atmosfer untuk menahan panas, perbedaan suhu siang dan malamnya sangat ekstrem.',
                  color: 'from-stone-950 via-slate-900 to-slate-950 border-slate-400',
                  badge: 'PLANET KE-1',
                },
                {
                  id: 'venus',
                  name: 'VENUS (BINTANG KEJORA)',
                  title: 'Planet Terpanas di Tata Surya',
                  icon: '🌕',
                  distance: '108 juta km dari Matahari',
                  diameter: '12.104 km (Kembaran ukuran Bumi)',
                  temp: '465°C konstan siang dan malam',
                  fact: 'Venus lebih panas dari Merkurius meskipun letaknya lebih jauh dari Matahari! Hal ini disebabkan oleh atmosfer tebal gas karbon dioksida yang menimbulkan efek rumah kaca super kuat.',
                  color: 'from-amber-950 via-orange-950 to-slate-950 border-orange-400',
                  badge: 'PLANET KE-2',
                },
                {
                  id: 'earth',
                  name: 'BUMI (OUR PLANET EARTH)',
                  title: 'Rumah Kita yang Penuh Kehidupan & Air Biru',
                  icon: '🌍',
                  distance: '150 juta km (1 AU)',
                  diameter: '12.742 km',
                  temp: 'Rata-rata 15°C (Sangat nyaman)',
                  fact: 'Bumi adalah satu-satunya tempat yang kita ketahui memiliki kehidupan dan air berbentuk cairan! 71% permukaan bumi tertutup samudera dan dilindungi atmosfer kaya oksigen & nitrogen.',
                  color: 'from-blue-950 via-emerald-950 to-slate-950 border-cyan-400',
                  badge: 'PLANET KE-3',
                },
                {
                  id: 'mars',
                  name: 'MARS (PLANET MERAH)',
                  title: 'Planet Berpasir Besi & Gunung Tertinggi',
                  icon: '🔴',
                  distance: '228 juta km dari Matahari',
                  diameter: '6.779 km (Setengah Bumi)',
                  temp: 'Rata-rata -60°C',
                  fact: 'Warna merah Mars berasal dari karat besi di permukaannya. Mars memiliki gunung berapi Olympus Mons yang tingginya 22 km, hampir 3 kali lipat tinggi Gunung Everest di Bumi!',
                  color: 'from-rose-950 via-red-950 to-slate-950 border-rose-400',
                  badge: 'PLANET KE-4',
                },
                {
                  id: 'jupiter',
                  name: 'JUPITER (THE GIANT)',
                  title: 'Raksasa Gas Terbesar di Tata Surya',
                  icon: '🪐',
                  distance: '778 juta km dari Matahari',
                  diameter: '139.820 km (11x Bumi)',
                  temp: '-110°C di puncak awan',
                  fact: 'Jupiter sangat besar hingga semua planet lain di tata surya bisa muat di dalamnya! Memiliki setidaknya 95 satelit alami, salah satunya Ganymede yang lebih besar dari Merkurius.',
                  color: 'from-amber-950 via-orange-900 to-slate-950 border-yellow-400',
                  badge: 'PLANET KE-5',
                },
                {
                  id: 'saturn',
                  name: 'SATURNUS (LORD OF THE RINGS)',
                  title: 'Planet Tercantik Berhias Cincin Es Spektakuler',
                  icon: '🪐',
                  distance: '1,4 miliar km dari Matahari',
                  diameter: '116.460 km (9x Bumi)',
                  temp: '-140°C',
                  fact: 'Cincin Saturnus terbuat dari miliaran serpihan es, debu, dan batuan luar angkasa. Saturnus sangat ringan karena terbuat dari gas; jika ada bak mandi raksasa, Saturnus bisa terapung di air!',
                  color: 'from-yellow-950 via-amber-950 to-slate-950 border-amber-300',
                  badge: 'PLANET KE-6',
                },
                {
                  id: 'uranus',
                  name: 'URANUS (RAKSASA ES BIRU)',
                  title: 'Planet Es yang Menggelinding Miring',
                  icon: '🌐',
                  distance: '2,9 miliar km dari Matahari',
                  diameter: '50.724 km (4x Bumi)',
                  temp: '-195°C',
                  fact: 'Uranus berotasi miring hampir 98 derajat, sehingga tampak seperti bola yang menggelinding mengitari Matahari! Atmosfernya mengandung gas metana yang menyerap cahaya merah dan memantulkan warna biru muda.',
                  color: 'from-cyan-950 via-teal-950 to-slate-950 border-cyan-300',
                  badge: 'PLANET KE-7',
                },
                {
                  id: 'neptune',
                  name: 'NEPTUNUS (PLANET ANGIN BADAI)',
                  title: 'Planet Biru Terjauh dari Tata Surya Kita',
                  icon: '🔵',
                  distance: '4,5 miliar km dari Matahari',
                  diameter: '49.244 km',
                  temp: '-200°C',
                  fact: 'Neptunus membutuhkan 165 tahun Bumi untuk satu kali mengitari Matahari! Di planet ini berhembus angin supersonik tercepat di tata surya dengan kecepatan mencapai 2.100 km/jam.',
                  color: 'from-blue-950 via-indigo-950 to-slate-950 border-blue-400',
                  badge: 'PLANET KE-8',
                },
              ];

              const currentPlanet = PLANET_DATA[selectedPlanetIndex] || PLANET_DATA[3];

              return (
                <div className={`p-4 md:p-5 rounded-2xl bg-gradient-to-br ${currentPlanet.color} border-2 shadow-2xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl animate-bounce">{currentPlanet.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                            {currentPlanet.badge}
                          </span>
                          <span className="text-xs text-slate-300 font-mono">Tata Surya SD</span>
                        </div>
                        <h3 className="text-base md:text-lg font-black text-white font-game drop-shadow">
                          {currentPlanet.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        audio.speakId(`${currentPlanet.name}. ${currentPlanet.title}. ${currentPlanet.fact}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-bold font-game flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow"
                    >
                      <span>🔊</span>
                      <span>Dengarkan Suara</span>
                    </button>
                  </div>

                  <p className="text-xs text-amber-200 font-bold mb-3 italic">
                    "{currentPlanet.title}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-slate-400 text-[10px]">Jarak dari Matahari</div>
                      <div className="font-bold text-white font-mono mt-0.5">{currentPlanet.distance}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-slate-400 text-[10px]">Ukuran Diameter</div>
                      <div className="font-bold text-cyan-300 font-mono mt-0.5">{currentPlanet.diameter}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-slate-400 text-[10px]">Suhu Permukaan</div>
                      <div className="font-bold text-yellow-300 font-mono mt-0.5">{currentPlanet.temp}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-amber-400/30 text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-amber-300">💡 Pengetahuan Sains Seru: </span>
                    {currentPlanet.fact}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: LITERASI & BUDI PEKERTI NUSANTARA                    */}
        {/* ======================================================== */}
        {activeTab === 'LITERASI' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {[
              {
                icon: '🇮🇩',
                title: 'Ki Hajar Dewantara - Bapak Pendidikan Nasional',
                category: 'TOKOH TELADAN',
                quote: 'Ing Ngarso Sung Tulodo, Ing Madyo Mangun Karso, Tut Wuri Handayani',
                desc: 'Ki Hajar Dewantara mendirikan Perguruan Taman Siswa agar semua anak bangsa bisa bersekolah. Semboyan "Tut Wuri Handayani" bermakna seorang guru di belakang selalu memberikan dorongan moral dan semangat belajar bagi murid-muridnya.',
              },
              {
                icon: '✈️',
                title: 'Prof. Dr.-Ing. B.J. Habibie - Bapak Dirgantara Indonesia',
                category: 'INSPIRASI SAINS & TEKNOLOGI',
                quote: 'Jadilah mata air yang jernih, yang memberikan kehidupan kepada sekitarmu.',
                desc: 'Sejak kecil beliau sangat tekun membaca buku dan belajar matematika. Beliau berhasil menemukan rumus keretakan sayap pesawat terbang (Habibie Factor) yang menyelamatkan jutaan penerbangan dan memimpin pembuatan pesawat pertama karya anak bangsa, N-250 Gatotkaca!',
              },
              {
                icon: '🐢',
                title: 'Fabel Kancil & Kura-Kura yang Tekun',
                category: 'BUDI PEKERTI & MORAL',
                quote: 'Ketekunan dan kerendahan hati selalu mengalahkan kesombongan.',
                desc: 'Kura-kura yang lambat namun pantang menyerah berhasil memenangkan perlombaan lari melawan hewan yang sombong dan terlena tidur. Pelajarannya: Siapa yang rajin belajar setiap hari pasti akan meraih cita-cita!',
              },
              {
                icon: '🏛️',
                title: 'Candi Borobudur - Warisan Megah Dunia di Magelang',
                category: 'SEJARAH NUSANTARA',
                quote: 'Karya agung nenek moyang bangsa Indonesia yang dikagumi dunia.',
                desc: 'Dibangun pada abad ke-8 masehi oleh Dinasti Syailendra dengan 2.672 panel relief dan 504 arca Buddha tanpa menggunakan semen sedikitpun! Candi ini menjadi bukti tingginya ilmu matematika, arsitektur, dan seni bangsa kita.',
              },
            ].map((lit, lIdx) => (
              <div
                key={lIdx}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900/80 to-amber-950/70 border border-amber-500/40 flex items-start gap-3 shadow-md"
              >
                <span className="text-3xl shrink-0 p-1.5 bg-amber-900/80 rounded-xl border border-amber-400/40">
                  {lit.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase text-amber-300 font-game bg-amber-400/20 px-2 py-0.2 rounded-full border border-amber-400/40">
                      {lit.category}
                    </span>
                    <button
                      onClick={() => audio.speakId(`${lit.title}. ${lit.quote}. ${lit.desc}`)}
                      className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>🔊 Baca</span>
                    </button>
                  </div>
                  <h4 className="font-game font-black text-white text-xs md:text-sm">
                    {lit.title}
                  </h4>
                  <p className="text-[10px] text-amber-200 font-bold italic mt-0.5 mb-1">
                    "{lit.quote}"
                  </p>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {lit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PAPAN GAMBAR KAPUR (CHALK DOODLE CANVAS)          */}
        {/* ======================================================== */}
        {activeTab === 'DOODLE' && (
          <div className="space-y-3">
            {/* Color Palette & Stamp Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/90 rounded-2xl border border-emerald-600/40">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-300 font-game mr-1">KAPUR:</span>
                {[
                  { color: '#FFFFFF', title: 'Putih' },
                  { color: '#FDE047', title: 'Kuning' },
                  { color: '#38BDF8', title: 'Biru' },
                  { color: '#F472B6', title: 'Pink' },
                  { color: '#4ADE80', title: 'Hijau' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setChalkColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      chalkColor === c.color ? 'scale-125 border-amber-400 ring-2 ring-white shadow-md' : 'border-slate-600'
                    }`}
                    title={c.title}
                  />
                ))}
              </div>

              {/* Chalk Stamping Icons */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-300 font-game mr-1">STEMPEL:</span>
                <button
                  onClick={() => stampIcon('⭐')}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer shadow"
                  title="Stempel Bintang"
                >
                  ⭐
                </button>
                <button
                  onClick={() => stampIcon('👑')}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer shadow"
                  title="Stempel Mahkota"
                >
                  👑
                </button>
                <button
                  onClick={() => stampIcon('🚀')}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer shadow"
                  title="Stempel Roket"
                >
                  🚀
                </button>
                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-black font-game flex items-center gap-1 cursor-pointer transition-all ml-1"
                  title="Hapus Semua Coretan"
                >
                  <span>🧹</span>
                  <span>HAPUS</span>
                </button>
              </div>
            </div>

            {/* Interactive Blackboard Canvas */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-amber-700 shadow-2xl touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-64 md:h-72 cursor-crosshair block"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[9px] text-emerald-300 font-mono pointer-events-none">
                Gunakan jari atau mouse untuk menggambar kapur
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: FAKTA SAINS & ENSIKLOPEDIA KELAS SD               */}
        {/* ======================================================== */}
        {activeTab === 'TRIVIA' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {[
              {
                emoji: '🪐',
                title: 'Mengapa Langit Berwarna Biru?',
                subject: 'IPA FISIKA',
                desc: 'Cahaya matahari terdiri dari berbagai warna pelangi. Gas di atmosfer bumi menyebarkan gelombang cahaya biru lebih banyak dibanding warna lain, sehingga langit tampak biru cerah di siang hari!',
              },
              {
                emoji: '🫀',
                title: 'Jantung Hebat Manusia',
                subject: 'IPA BIOLOGI',
                desc: 'Jantungmu berdetak sekitar 100.000 kali setiap hari dan memompa darah ke seluruh tubuh melalui pembuluh darah yang jika dibentangkan panjangnya bisa mencapai 100.000 kilometer!',
              },
              {
                emoji: '📐',
                title: 'Segitiga Terkuat di Arsitektur',
                subject: 'MATEMATIKA',
                desc: 'Bentuk segitiga adalah bentuk geometris terkuat di alam! Karena bentuk segitiga tidak bisa bengkok tanpa merusak sisinya, jembatan dan atap rumah selalu dirancang dengan pola segitiga.',
              },
              {
                emoji: '🌍',
                title: 'Hutan Hujan Indonesia: Paru-Paru Dunia',
                subject: 'IPS GEOGRAFI',
                desc: 'Indonesia memiliki hutan hujan tropis terluas ketiga di dunia setelah Amazon dan Kongo. Hutan Indonesia menampung ribuan spesies burung, harimau, dan tanaman obat langka.',
              },
            ].map((triv, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-emerald-950/70 border border-emerald-500/40 flex items-start gap-3 shadow-md"
              >
                <span className="text-3xl shrink-0 p-1.5 bg-emerald-900/80 rounded-xl border border-emerald-400/40">
                  {triv.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase text-amber-300 font-game bg-amber-400/20 px-2 py-0.2 rounded-full border border-amber-400/40">
                      {triv.subject}
                    </span>
                    <h4 className="font-game font-black text-white text-xs md:text-sm">
                      {triv.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-emerald-100 leading-relaxed">
                    {triv.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80">
          <div className="flex items-center gap-1.5">
            <span>💡</span>
            <span>Semakin sering belajar, semakin tinggi XP & level Sahabat Kafa!</span>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-game font-bold text-xs cursor-pointer"
          >
            SELESAI ➔
          </button>
        </div>
      </motion.div>
    </div>
  );
};
