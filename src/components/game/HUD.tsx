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
  onEnterRoom?: (roomId: string) => void;
  onToggleCameraZoom?: () => void;
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
  onOpenBadges,
  onOpenMiniGames,
  onEnterRoom,
  onToggleCameraZoom,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());
  const [showStoryDetails, setShowStoryDetails] = useState<boolean>(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState<boolean>(false);

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  const xpPercent = Math.min(100, Math.floor((saveData.xp / saveData.maxXp) * 100));
  const energyPercent = Math.min(100, Math.max(0, saveData.energy !== undefined ? saveData.energy : 100));
  const activePowerConfig = HERO_POWERS.find(p => p.id === (saveData.activePower || 'sahabat_kafa')) || HERO_POWERS[0];

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
    <div className="fixed top-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 pointer-events-none z-[920] flex flex-col justify-between h-full select-none">
      {/* ======================================================== */}
      {/* TOP BAR: Clean, Tidy, Non-Intrusive Game HUD */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-1 w-full pointer-events-auto">
        <div className="flex items-center justify-between w-full gap-2">
          {/* TOP LEFT: Level Badge & XP Progress */}
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-xl shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs font-game shadow shrink-0">
              {currentLevel.id}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs font-bold text-slate-200 font-game">
                <span className="truncate max-w-[85px] xs:max-w-[130px] sm:max-w-none">{currentLevel.nameId}</span>
                <span className="text-amber-300 tabular-nums text-[9px] sm:text-[10px]">{saveData.xp}/{saveData.maxXp} XP</span>
              </div>
              {/* Rounded XP progress track */}
              <div className="w-16 xs:w-24 md:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* TOP CENTER: Consolidated Status Counters & SAHABAT KAFA Branding Crest */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* SAHABAT KAFA Official Branding Crest */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/25 via-amber-400/35 to-amber-500/25 border border-amber-400/70 backdrop-blur-md px-2 sm:px-2.5 py-1.5 rounded-2xl shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-300/40">
              <span className="text-xs sm:text-sm filter drop-shadow animate-bounce">👑</span>
              <span className="text-[9px] sm:text-[10.5px] font-black tracking-widest text-amber-300 font-game whitespace-nowrap">
                SAHABAT KAFA
              </span>
            </div>

            {/* Counters (Coins, Stars, Energy) */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
              {/* Coins */}
              <div className="flex items-center gap-1 text-amber-300 font-game font-black text-xs" title="Koin Emas">
                <span>🪙</span>
                <span className="tabular-nums">{saveData.coins}</span>
              </div>

              <div className="w-px h-3.5 bg-white/10" />

              {/* Stars */}
              <div className="flex items-center gap-1 text-yellow-300 font-game font-black text-xs" title="Bintang Petualangan">
                <span>⭐</span>
                <span className="tabular-nums">{saveData.stars}</span>
              </div>

              <div className="w-px h-3.5 bg-white/10 hidden xs:block" />

              {/* Star Energy */}
              <div className="hidden xs:flex items-center gap-1.5 text-cyan-300 font-game font-black text-xs" title="Energi Jurus Sahabat Kafa">
                <span className="animate-pulse">⚡</span>
                <span className="tabular-nums text-[10px] sm:text-[11px]">{energyPercent}%</span>
              </div>
            </div>
          </div>

          {/* TOP RIGHT: Sleek Navigation Hubs & Settings */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Dedicated Mute/Unmute Icon */}
            <button
              onClick={handleToggleMute}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border font-game text-xs cursor-pointer shadow-lg active:scale-95 transition-all ${
                isMuted
                  ? 'bg-rose-600/90 border-rose-400 text-white animate-pulse'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-white/10 text-slate-200 hover:text-white'
              }`}
              title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
            >
              <span>{isMuted ? '🔇' : '🔊'}</span>
            </button>

            {/* Buku Pintar SD */}
            {onOpenWords && (
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onOpenWords();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/40 shadow-lg font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Buku Pintar SD"
              >
                <span>📖</span>
                <span className="hidden sm:inline text-[10px]">BUKU</span>
              </button>
            )}

            {/* 11 Mini-Game Hub */}
            {onOpenMiniGames && (
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onOpenMiniGames();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white border border-fuchsia-400/40 shadow-lg font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="11 Mini Game SD"
              >
                <span>🎮</span>
                <span className="hidden sm:inline text-[10px]">GAME</span>
              </button>
            )}

            {/* Kebun Harvest Moon */}
            {onOpenFarm && (
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onOpenFarm();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 shadow-lg font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Kebun Robot"
              >
                <span>🚜</span>
                <span className="hidden sm:inline text-[10px]">KEBUN</span>
              </button>
            )}

            {/* 🔍 Zoom / Kamera Mode (Luas / Game Keren ✦, Standar, Dekat) */}
            {onToggleCameraZoom && (
              <button
                onClick={onToggleCameraZoom}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-400/50 shadow-md font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Atur Ukuran Kamera (Luas Game Keren / Standar / Dekat)"
              >
                <span>🔍</span>
                <span className="text-[10px] font-black uppercase">
                  {saveData.graphicSettings?.cameraZoom === 'close'
                    ? 'DEKAT'
                    : saveData.graphicSettings?.cameraZoom === 'standard'
                    ? 'STANDAR'
                    : 'LUAS ✦'}
                </span>
              </button>
            )}

            {/* 🚪 Ruangan 3D Interaktif */}
            {onEnterRoom && currentLevel.rooms && currentLevel.rooms.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    if (currentLevel.rooms!.length === 1) {
                      audio.playDoorOpen();
                      onEnterRoom(currentLevel.rooms![0].id);
                    } else {
                      setShowRoomDropdown(prev => !prev);
                    }
                  }}
                  className="h-8 px-2 sm:px-2.5 rounded-xl bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 hover:from-amber-500/50 hover:to-amber-600/50 text-amber-300 border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all ring-2 ring-amber-400/30 animate-pulse"
                  title="Masuk ke Ruangan 3D Interaktif"
                >
                  <span className="text-sm">🚪</span>
                  <span className="text-[10px] sm:hidden font-black">3D</span>
                  <span className="hidden sm:inline text-[10px]">RUANG 3D</span>
                  {currentLevel.rooms.length > 1 && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded-full font-black">
                      {currentLevel.rooms.length}
                    </span>
                  )}
                </button>

                {/* Multiple Rooms Dropdown */}
                {showRoomDropdown && currentLevel.rooms.length > 1 && (
                  <div className="absolute top-10 right-0 w-52 bg-slate-950/95 backdrop-blur-md rounded-2xl border-2 border-amber-400 shadow-2xl p-2 z-[900] flex flex-col gap-1.5 animate-in fade-in">
                    <div className="text-[9px] font-black font-game text-amber-300 px-2 py-0.5 border-b border-white/10 uppercase">
                      PILIH RUANGAN 3D
                    </div>
                    {currentLevel.rooms.map(rm => (
                      <button
                        key={rm.id}
                        onClick={() => {
                          setShowRoomDropdown(false);
                          audio.playDoorOpen();
                          onEnterRoom(rm.id);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-amber-400 hover:text-slate-950 text-white font-game text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{rm.theme === 'bedroom' ? '🛏️' : rm.theme === 'attic' ? '🗝️' : rm.theme === 'classroom' ? '🏫' : rm.theme === 'cafe' ? '☕' : rm.theme === 'cabin' ? '🏡' : '🚪'}</span>
                          <span className="truncate">{rm.nameId}</span>
                        </div>
                        <span className="text-[10px] shrink-0">▶</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Game */}
            <button
              onClick={() => {
                audio.playButtonClick();
                onOpenMenu();
              }}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-400/40 shadow-lg font-game font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="Menu Game & Pengaturan"
            >
              <span>☰</span>
              <span className="hidden xs:inline text-[10px]">MENU</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM AREA: Sleek, Uncluttered Floating Game Dock */}
      {/* ======================================================== */}
      <div className="w-full flex items-end justify-between gap-3 pointer-events-none mt-auto">
        {/* BOTTOM LEFT: Minimal Keyboard Controls Guide */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg text-[10px] font-game text-slate-300 pointer-events-auto">
          <span className="text-amber-400 font-black">🎮</span>
          <span><kbd className="px-1 py-0.2 bg-slate-800 rounded text-[9px] text-amber-300 border border-slate-700">SPASI</kbd> Lompat</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[9px] border border-cyan-500/40">SHIFT</kbd> Lari</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[9px] border border-amber-500/40">F/J</kbd> Jurus</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.2 bg-slate-800 rounded text-[9px] text-amber-300 border border-slate-700">E</kbd> Aksi</span>
        </div>

        {/* BOTTOM CENTER: Compact, Clean Quest Target Capsule (Non-intrusive) */}
        <div className="w-full max-w-md mx-auto pointer-events-auto flex flex-col items-center gap-1 mb-1">
          {!isMissionCompleted && currentStep ? (
            <div className="flex flex-col items-center w-full">
              {/* Compact Active Quest Pill */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-amber-400/50 shadow-xl text-white w-full max-w-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{targetItem ? targetItem.emoji : '🎯'}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] text-amber-400 font-black font-game uppercase tracking-wider">
                      MISI PETUALANGAN
                    </span>
                    <span className="text-xs font-black text-white font-game truncate">
                      {targetItem ? `${targetItem.word} = ${targetItem.translation}` : 'Temukan Benda'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Pronunciation Audio Button */}
                  <button
                    onClick={() => {
                      audio.speak(targetItem ? targetItem.word : currentStep.speechText);
                    }}
                    className="px-2 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] font-game flex items-center gap-0.5 cursor-pointer active:scale-95 shadow transition-all"
                    title="Dengarkan Pengucapan Bahasa Inggris"
                  >
                    <span>🔊</span>
                    <span className="hidden xs:inline">Dengar</span>
                  </button>

                  {/* Story Details Toggle Button */}
                  <button
                    onClick={() => setShowStoryDetails(prev => !prev)}
                    className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer active:scale-95 border border-slate-700"
                    title={showStoryDetails ? 'Tutup Catatan Cerita' : 'Lihat Catatan Cerita'}
                  >
                    {showStoryDetails ? '✕' : '💬'}
                  </button>
                </div>
              </div>

              {/* Expandable Story Quote (Only when user taps 💬) */}
              {showStoryDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 p-2 bg-slate-950/95 backdrop-blur-md rounded-xl border border-white/10 text-[10px] text-slate-200 max-w-sm shadow-xl flex flex-col gap-0.5 text-center"
                >
                  <p className="font-bold text-amber-200">"{currentStep.speechText}"</p>
                  {currentStep.indonesianText && (
                    <p className="text-slate-400 text-[9px]">🇮🇩 {currentStep.indonesianText}</p>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-emerald-950/90 backdrop-blur-md rounded-full border border-emerald-400/60 shadow-xl text-emerald-300 font-game text-xs font-black flex items-center gap-1.5 animate-bounce">
              <span>🎉</span>
              <span>Misi Selesai! Capai TIANG BENDERA 🚩</span>
            </div>
          )}
        </div>

        {/* BOTTOM RIGHT Spacer */}
        <div className="hidden lg:block w-36 pointer-events-none" />
      </div>
    </div>
  );
};
