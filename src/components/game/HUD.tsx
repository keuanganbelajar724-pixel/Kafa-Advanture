import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerSaveData, GameLevel, HeroPowerType } from '../../types/game';
import { HERO_POWERS } from '../../data/heroPowers';
import { audio } from '../../services/audio';

interface HUDProps {
  saveData: PlayerSaveData;
  currentLevel: GameLevel;
  missionProgressCount: number;
  isMissionCompleted: boolean;
  onOpenMenu: () => void;
  onOpenFarm?: () => void;
  onOpenPS3Graphics?: () => void;
  onToggleCleanBackground?: () => void;
  onSelectPower?: (power: HeroPowerType) => void;
  onOpenMap?: () => void;
  onOpenWords?: () => void;
  onOpenBadges?: () => void;
  onOpenMiniGames?: () => void;
  onToggleMusic?: () => void;
  onToggleSfx?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  saveData,
  currentLevel,
  missionProgressCount,
  isMissionCompleted,
  onOpenMenu,
  onOpenFarm,
  onOpenPS3Graphics,
  onToggleCleanBackground,
  onSelectPower,
  onOpenWords,
  onOpenMiniGames,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const xpPercent = Math.min(100, Math.floor((saveData.xp / saveData.maxXp) * 100));
  const energyPercent = Math.min(100, Math.max(0, saveData.energy !== undefined ? saveData.energy : 100));
  const activePowerConfig = HERO_POWERS.find(p => p.id === (saveData.activePower || 'star_blast')) || HERO_POWERS[0];

  // Determine current active story step or target item
  const currentStep = currentLevel.storySteps?.find(
    s => !saveData.discoveredWords.includes(s.targetWordId)
  ) || currentLevel.storySteps?.[0];

  const targetItem = currentLevel.vocabItems.find(
    v => v.id === currentStep?.targetWordId
  );

  // Mission target word checklist
  const missionTargets = currentLevel.mission.targetWords.map(id => {
    const item = currentLevel.vocabItems.find(v => v.id === id);
    const isDone = saveData.discoveredWords.includes(id);
    const isCurrent = targetItem?.id === id;
    return { id, item, isDone, isCurrent };
  });

  return (
    <div className="absolute top-0 left-0 right-0 p-3 md:p-5 pointer-events-none z-[800] flex flex-col justify-between h-full select-none">
      {/* ======================================================== */}
      {/* TOP BAR: Sleek, non-intrusive Game HUD */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between w-full pointer-events-auto gap-2">
        {/* TOP LEFT: Level Badge & Sleek XP Progress */}
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs font-game shadow">
            {currentLevel.id}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-200 font-game">
              <span>{currentLevel.nameId}</span>
              <span className="text-amber-300 tabular-nums text-[10px]">{saveData.xp}/{saveData.maxXp} XP</span>
            </div>
            {/* Rounded XP progress track */}
            <div className="w-24 md:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5 SD Subjects Badge in Top Bar */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl text-amber-300 font-bold text-xs font-game">
          <span>🤖</span>
          <span className="text-[11px] font-black text-amber-300">5 MAPEL SD:</span>
          <span className="text-white text-xs tracking-wider">🇮🇩 📐 🔬 🇬🇧 🕌</span>
        </div>

        {/* TOP RIGHT: MUTE, Farm, Energy, Coins, and Menu */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* DEDICATED MUTE BUTTON (Top Bar Accessibility) */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl border font-game font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all ${
              isMuted
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-sky-600/90 hover:bg-sky-500 border-sky-400 text-white'
            }`}
            title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline text-[10px]">{isMuted ? 'BISU' : 'SUARA'}</span>
          </button>

          {/* BUKU PINTAR SD & KNOWLEDGE QUICK BUTTON */}
          {onOpenWords && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenWords();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-indigo-200 hover:text-white rounded-2xl border border-indigo-400/50 shadow-xl font-game font-black text-xs cursor-pointer active:scale-95 transition-all group"
              title="Buka Buku Pintar & Kamus Pengetahuan SD"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">📖</span>
              <span className="hidden xs:inline text-[10px] tracking-wider">BUKU SD</span>
            </button>
          )}

          {/* 11 MINI GAMES HUB QUICK BUTTON */}
          {onOpenMiniGames && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenMiniGames();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-fuchsia-600/80 hover:bg-fuchsia-500 text-fuchsia-100 hover:text-white rounded-2xl border border-fuchsia-400/50 shadow-xl font-game font-black text-xs cursor-pointer active:scale-95 transition-all group"
              title="Main 11 Mini-Game Tantangan Pengetahuan SD"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">🎮</span>
              <span className="hidden xs:inline text-[10px] tracking-wider">MINIGAME</span>
            </button>
          )}

          {/* HARVEST MOON FARM QUICK BUTTON */}
          {onOpenFarm && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenFarm();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 hover:from-amber-500/30 text-amber-300 rounded-2xl border border-amber-400/50 shadow-xl font-game font-black text-xs cursor-pointer active:scale-95 transition-all group"
              title="Pergi ke Kebun Harvest Moon Robot"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">🚜</span>
              <span className="hidden xs:inline text-[10px] tracking-wider">KEBUN</span>
            </button>
          )}

          {/* Clean Background Toggle Button */}
          {onToggleCleanBackground && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onToggleCleanBackground();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl border font-game font-black text-xs cursor-pointer active:scale-95 transition-all ${
                saveData.graphicSettings?.cleanBackgroundMode
                  ? 'bg-emerald-600 text-white border-white shadow'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Latar Bersih / Tenang (Uncluttered View)"
            >
              <span>🌿</span>
              <span className="hidden sm:inline text-[10px]">LATAR BERSIH</span>
            </button>
          )}

          {/* Star Energy / SP Gauge (Hero is immortal) */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-400/40 shadow-xl">
            <span className="text-base animate-pulse">⚡</span>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[10px] font-black text-amber-300 font-game">
                <span>ENERGI JURUS</span>
                <span className="tabular-nums">{energyPercent}%</span>
              </div>
              <div className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick 6 Powers Switcher Toolbar */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10 shadow-xl">
            {HERO_POWERS.map((pow) => {
              const isActive = (saveData.activePower || 'star_blast') === pow.id;
              return (
                <button
                  key={pow.id}
                  onClick={() => {
                    audio.playButtonClick();
                    if (onSelectPower) onSelectPower(pow.id);
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer relative group ${
                    isActive
                      ? `bg-gradient-to-br ${pow.gradient} text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110 border-2 border-white font-black ring-2 ring-amber-400/50`
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:scale-105 border border-slate-700'
                  }`}
                  title={`${pow.name} [${pow.keyHint}]: ${pow.description}`}
                >
                  <span>{pow.emoji}</span>
                  <span className="absolute -bottom-7 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded text-[9px] font-bold text-amber-300 border border-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {pow.name} ({pow.keyHint})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-md text-amber-300 font-bold text-xs font-game">
            <span>🪙</span>
            <span className="tabular-nums font-black">{saveData.coins}</span>
          </div>

          {/* Stars Badge */}
          <div className="hidden xs:flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-white/10 shadow-md text-yellow-300 font-bold text-xs font-game">
            <span>⭐</span>
            <span className="tabular-nums font-black">{saveData.stars}</span>
          </div>

          {/* PS3 HD Graphics Mode Button */}
          {onOpenPS3Graphics && (
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenPS3Graphics();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-2xl border border-amber-400/50 shadow-xl font-game font-black text-xs cursor-pointer active:scale-95 transition-all"
              title="Pengaturan Visual PS3 HD Remaster"
            >
              <span className="text-sm">🎮</span>
              <span className="hidden xs:inline">PS3</span>
            </button>
          )}

          {/* Modern Menu Toggle */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenMenu();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl border border-slate-700 shadow-xl font-game font-bold text-xs cursor-pointer active:scale-95 transition-all"
            title="Buka Menu Game"
          >
            <span className="text-sm">☰</span>
            <span className="hidden sm:inline">MENU</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM AREA: Floating Immersive Game Dock */}
      {/* ======================================================== */}
      <div className="w-full flex items-end justify-between gap-4 pointer-events-none mt-auto">
        {/* BOTTOM LEFT: Keyboard Controls Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg text-[11px] font-game text-slate-300 pointer-events-auto">
          <span className="text-amber-400 font-black flex items-center gap-1">
            <span>🎮</span>
            <span>KONTROL:</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[9px] text-amber-300 font-bold border border-slate-700">SPASI</kbd> Lompat
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] font-bold border border-cyan-500/40">SHIFT/Z</kbd> Sprint 🚀
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold border border-amber-500/40">F/J</kbd>
            <span className="text-amber-300 font-bold">{activePowerConfig.emoji} Jurus</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[9px] text-amber-300 border border-slate-700">1-6</kbd> Ganti
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[9px] text-amber-300 font-bold border border-slate-700">E</kbd> Ambil
          </span>
        </div>

        {/* BOTTOM CENTER: Sleek Floating Quest Dialogue Card with Bilingual Indonesian Translation */}
        <div className="w-full max-w-lg mx-auto pointer-events-auto flex flex-col items-center gap-1.5">
          {/* Target Word Chips (with English = Indonesian) */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {missionTargets.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-game border backdrop-blur-md shadow transition-all ${
                  m.isDone
                    ? 'bg-emerald-950/85 border-emerald-500 text-emerald-300'
                    : m.isCurrent
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-400'
                }`}
              >
                <span>{m.item?.emoji || '📦'}</span>
                <span>{m.item ? `${m.item.word} = ${m.item.translation}` : 'BENDA'}</span>
                <span>{m.isDone ? '✅' : m.isCurrent ? '🎯' : '🔒'}</span>
              </div>
            ))}
          </div>

          {/* Dialogue Card */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-slate-950/85 backdrop-blur-md rounded-2xl border border-white/10 p-2.5 md:p-3 shadow-2xl flex items-center justify-between gap-3 text-white"
          >
            {/* Speaking Icon */}
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg shrink-0">
              {targetItem ? targetItem.emoji : '🧭'}
            </div>

            {/* Dialogue Text */}
            <div className="flex-1 text-left min-w-0">
              {!isMissionCompleted && currentStep ? (
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                      🇬🇧 Petualangan Inggris
                    </span>
                    {targetItem && (
                      <span className="text-[10px] text-amber-200 font-bold font-game">
                        Target: <span className="text-white font-black">{targetItem.word}</span> ({targetItem.translation}) {targetItem.emoji}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] md:text-xs font-black text-amber-200 leading-snug">
                    "{currentStep.speechText}"
                  </div>
                  {currentStep.indonesianText && (
                    <div className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">
                      🇮🇩 Artinya: "{currentStep.indonesianText}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-300 font-game flex items-center gap-1.5">
                  <span className="text-base animate-bounce">🎉</span>
                  <span>Misi petualangan selesai! Raih TIANG BENDERA atau berkebun di Harvest Moon!</span>
                </div>
              )}
            </div>

            {/* Audio Speak Button */}
            {!isMissionCompleted && currentStep && (
              <button
                onClick={() => {
                  audio.speak(currentStep.speechText);
                }}
                className="px-2 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 flex items-center gap-1 text-[11px] font-black shrink-0 cursor-pointer active:scale-95 shadow transition-all"
                title="Dengarkan suara bahasa Inggris"
              >
                <span>🔊</span>
                <span className="hidden sm:inline">Suara</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* BOTTOM RIGHT Spacer */}
        <div className="hidden md:block w-36 pointer-events-none" />
      </div>
    </div>
  );
};
