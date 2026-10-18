import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameLevel, PlayerSaveData, VocabItem } from '../../types/game';
import { audio } from '../../services/audio';

interface GameMenuModalProps {
  currentLevel: GameLevel;
  saveData: PlayerSaveData;
  missionProgressCount: number;
  isMissionCompleted: boolean;
  onSelectLevel: (levelId: number) => void;
  onOpenFarm?: () => void;
  onOpenWords: () => void;
  onOpenBadges: () => void;
  onOpenMiniGames: () => void;
  onOpenPS3Graphics?: () => void;
  onEnterRoom?: (roomId: string) => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onToggleLanguage: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

type MenuTab = 'MENU' | 'QUEST' | 'INVENTORY' | 'SETTINGS';

export const GameMenuModal: React.FC<GameMenuModalProps> = ({
  currentLevel,
  saveData,
  missionProgressCount,
  isMissionCompleted,
  onSelectLevel,
  onOpenFarm,
  onOpenWords,
  onOpenBadges,
  onOpenMiniGames,
  onOpenPS3Graphics,
  onEnterRoom,
  onToggleMusic,
  onToggleSfx,
  onToggleLanguage,
  onResetProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('MENU');
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  // Discovered items in this level
  const discoveredInLevel = currentLevel.vocabItems.filter(item =>
    saveData.discoveredWords.includes(item.id)
  );

  return (
    <div className="fixed inset-0 z-[980] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 md:p-7 shadow-2xl border-2 border-slate-700 text-white flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎮</span>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                PETUALANGAN EDUKASI
              </div>
              <h2 className="text-lg font-black text-amber-300 font-game">
                {activeTab === 'MENU' && 'MENU GAME'}
                {activeTab === 'QUEST' && 'PETUALANGAN & CERITA'}
                {activeTab === 'INVENTORY' && 'TAS INVENTORY SAYA'}
                {activeTab === 'SETTINGS' && 'PENGATURAN'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'MENU' && (
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setActiveTab('MENU');
                }}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer"
              >
                ◀ Kembali
              </button>
            )}
            <button
              onClick={() => {
                audio.playButtonClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold border border-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TAB 1: MAIN NAVIGATION GRID */}
        {activeTab === 'MENU' && (
          <div className="space-y-3 py-1 overflow-y-auto">
            {/* Primary Resume Action */}
            <button
              onClick={() => {
                audio.playButtonClick();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm md:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 font-game cursor-pointer active:scale-98 transition-all border border-emerald-300"
            >
              <span>▶️</span>
              <span>LANJUTKAN PERJALANAN (RESUME)</span>
            </button>

            {/* Quick Grid of Core Game Features */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Ruangan 3D Interaktif */}
              {currentLevel.rooms && currentLevel.rooms.length > 0 && onEnterRoom && (
                <button
                  onClick={() => {
                    const firstRoom = currentLevel.rooms?.[0];
                    if (firstRoom) {
                      audio.playDoorOpen();
                      onClose();
                      onEnterRoom(firstRoom.id);
                    }
                  }}
                  className="p-3.5 bg-gradient-to-br from-amber-600/30 via-yellow-600/20 to-amber-700/30 hover:from-amber-600/40 rounded-2xl border-2 border-amber-400 text-left transition-all cursor-pointer group shadow-lg"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚪</div>
                  <div className="text-xs font-black text-amber-300 font-game flex items-center justify-between">
                    <span>Ruangan 3D</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-black">
                      {currentLevel.rooms.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                    {currentLevel.rooms[0]?.nameId}
                  </div>
                </button>
              )}

              {/* Kebun Harvest Moon (Farm Mode Shortcut) */}
              {onOpenFarm && (
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    onClose();
                    onOpenFarm();
                  }}
                  className="p-3.5 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-emerald-500/20 hover:from-emerald-500/30 rounded-2xl border-2 border-emerald-400 text-left transition-all cursor-pointer group shadow-lg"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚜</div>
                  <div className="text-xs font-black text-emerald-300 font-game">Kebun Harvest Moon</div>
                  <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                    Bertani, menyiram & ternak
                  </div>
                </button>
              )}

              {/* Quest & Story */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setActiveTab('QUEST');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📜</div>
                <div className="text-xs font-black text-amber-300 font-game">Misi Cerita</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {currentLevel.mission.title}
                </div>
              </button>

              {/* Backpack Inventory */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setActiveTab('INVENTORY');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎒</div>
                <div className="text-xs font-black text-amber-300 font-game">Tas Benda</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {discoveredInLevel.length}/{currentLevel.vocabItems.length} Benda level ini
                </div>
              </button>

              {/* Dictionary */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onClose();
                  onOpenWords();
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📖</div>
                <div className="text-xs font-black text-amber-300 font-game">Kamus Kosakata</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {saveData.discoveredWords.length} kata dipelajari
                </div>
              </button>

              {/* Badges & Stats */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onClose();
                  onOpenBadges();
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏆</div>
                <div className="text-xs font-black text-amber-300 font-game">Piala & Lencana</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {saveData.unlockedBadges.length} piala terbuka
                </div>
              </button>

              {/* 5 Mini-Games Arena */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onClose();
                  onOpenMiniGames();
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎪</div>
                <div className="text-xs font-black text-amber-300 font-game">Arena Mini-Game</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  5 Game latihan seru
                </div>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  audio.playButtonClick();
                  setActiveTab('SETTINGS');
                }}
                className="p-3.5 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚙️</div>
                <div className="text-xs font-black text-amber-300 font-game">Pengaturan</div>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  Suara & bahasa
                </div>
              </button>

              {/* PS3 HD Remaster Graphics Option */}
              {onOpenPS3Graphics && (
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    onClose();
                    onOpenPS3Graphics();
                  }}
                  className="col-span-2 p-3 bg-gradient-to-r from-amber-500/20 via-slate-800 to-indigo-900/40 hover:from-amber-500/30 rounded-2xl border border-amber-400/60 hover:border-amber-400 text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎮</span>
                    <div>
                      <div className="text-xs font-black text-amber-300 font-game flex items-center gap-1.5">
                        <span>Mode Grafis PS3 HD Remaster</span>
                        <span className="text-[9px] bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                          AKTIF
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Atur God Rays, Parallax Bokeh, Rim-Light & Suara Trophy
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-black text-xs font-game bg-amber-400/20 px-2 py-1 rounded-xl">
                    ATUR ⚙️
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STORY & QUEST DETAILS */}
        {activeTab === 'QUEST' && (
          <div className="space-y-3.5 py-1 overflow-y-auto text-left">
            <div className="p-3.5 bg-amber-500/15 border border-amber-400/40 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentLevel.icon}</span>
                <div>
                  <div className="text-[10px] font-bold text-amber-300 uppercase font-game">
                    LEVEL {currentLevel.id}: {currentLevel.nameId}
                  </div>
                  <div className="text-sm font-black text-white font-game">
                    {currentLevel.mission.title}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {currentLevel.mission.description}
              </p>
            </div>

            {/* Story Sequence Steps */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase font-game mb-2">
                Langkah Cerita:
              </div>
              <div className="space-y-2">
                {currentLevel.storySteps?.map((step, idx) => {
                  const isDone = saveData.discoveredWords.includes(step.targetWordId);
                  const isCurrent = !isDone && (idx === 0 || saveData.discoveredWords.includes(currentLevel.storySteps![idx - 1].targetWordId));

                  return (
                    <div
                      key={step.step}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : isCurrent
                          ? 'bg-amber-950/40 border-amber-400 text-amber-100 ring-2 ring-amber-400/30'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 font-game">
                          <span>{isDone ? '✓' : `${step.step}.`}</span>
                          <span>Langkah {step.step}</span>
                        </span>
                        {isDone && <span className="text-[10px] text-emerald-400">SELESAI</span>}
                        {isCurrent && <span className="text-[10px] text-amber-300 font-game animate-pulse">SEDANG DIKERJAKAN</span>}
                      </div>
                      <div className="mt-1 font-semibold text-white">
                        "{step.indonesianText}"
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        👉 {step.itemHint}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-3 py-1 overflow-y-auto text-left">
            <div className="text-xs text-slate-400 font-medium">
              Benda-benda yang telah kamu temukan di {currentLevel.nameId}:
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {currentLevel.vocabItems.map(item => {
                const isFound = saveData.discoveredWords.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      isFound
                        ? 'bg-slate-800/90 border-slate-600 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 opacity-40'
                    }`}
                  >
                    <div className="text-3xl mb-1">
                      {isFound ? item.emoji : '❓'}
                    </div>
                    <div className="text-xs font-black text-amber-300 font-game truncate w-full">
                      {isFound ? item.word : '???'}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium truncate w-full">
                      {isFound ? item.translation : 'Belum ditemukan'}
                    </div>
                    {isFound && (
                      <button
                        onClick={() => audio.speak(item.word)}
                        className="mt-1.5 px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded-full text-[10px] font-bold text-slate-200 cursor-pointer"
                      >
                        🔊 Dengar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-3.5 py-1 overflow-y-auto text-left text-xs">
            {/* Audio Controls */}
            <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="font-bold text-amber-300 uppercase font-game">Master Mute (Bisu Total)</span>
                <button
                  onClick={handleToggleMute}
                  className={`px-3 py-1 rounded-full font-game font-black text-xs cursor-pointer border ${
                    isMuted
                      ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                      : 'bg-sky-600 border-sky-400 text-white'
                  }`}
                >
                  {isMuted ? '🔇 BISU (MUTED)' : '🔊 SUARA AKTIF'}
                </button>
              </div>

              <div className="font-bold text-slate-300 uppercase font-game">Detail Suara</div>
              
              <div className="flex items-center justify-between">
                <span>Musik Latar (BGM)</span>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    onToggleMusic();
                  }}
                  className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer ${
                    saveData.musicEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {saveData.musicEnabled ? '🔊 Hidup' : '🔇 Mati'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Efek Suara (SFX)</span>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    onToggleSfx();
                  }}
                  className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer ${
                    saveData.sfxEnabled ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {saveData.sfxEnabled ? '🔊 Hidup' : '🔇 Mati'}
                </button>
              </div>
            </div>

            {/* Language Mode */}
            <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Mode Bahasa</div>
                <div className="text-[11px] text-slate-400">Pilih tampilan teks & bantuan</div>
              </div>
              <button
                onClick={() => {
                  audio.playButtonClick();
                  onToggleLanguage();
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full cursor-pointer font-game"
              >
                🇮🇩 {saveData.languageMode === 'id' ? 'Indonesia' : saveData.languageMode === 'bilingual' ? 'Dwi-Bahasa' : 'English'}
              </button>
            </div>

            {/* Reset Progress */}
            <div className="p-3.5 bg-rose-950/30 rounded-2xl border border-rose-800/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-rose-300">Ulang Petualangan</div>
                <div className="text-[11px] text-slate-400">Kembalikan data dari awal</div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Apakah kamu yakin ingin mengulang dari awal?')) {
                    onResetProgress();
                    onClose();
                  }
                }}
                className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
