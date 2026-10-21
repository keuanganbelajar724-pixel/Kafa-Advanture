import React from 'react';
import { useGameState } from './hooks/useGameState';
import { SplashScreen } from './components/screens/SplashScreen';
import { MainMenu } from './components/screens/MainMenu';
import { GameWorld } from './components/game/GameWorld';
import { HUD } from './components/game/HUD';
import { WorldMap } from './components/screens/WorldMap';
import { VocabCollection } from './components/screens/VocabCollection';
import { BadgesScreen } from './components/screens/BadgesScreen';
import { CharacterSelect } from './components/screens/CharacterSelect';
import { VocabDiscoveryCard } from './components/game/VocabDiscoveryCard';
import { NPCModal } from './components/modals/NPCModal';
import { RewardModal } from './components/modals/RewardModal';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { LevelSelectModal } from './components/modals/LevelSelectModal';
import { MissionBriefingModal } from './components/modals/MissionBriefingModal';
import { GameMenuModal } from './components/modals/GameMenuModal';
import { MiniGameHub } from './components/minigames/MiniGameHub';
import { Room3DView } from './components/game/Room3DView';
import { GameOverModal } from './components/modals/GameOverModal';
import { PS3GraphicsModal } from './components/modals/PS3GraphicsModal';
import { RoomConfig } from './types/game';
import { DEFAULT_PS3_GRAPHICS } from './components/game/PS3GraphicsLayer';
import { HarvestMoonFarm } from './components/harvest/HarvestMoonFarm';
import { GAME_LEVELS } from './data/gameData';
import { audio } from './services/audio';

export default function App() {
  const {
    saveData,
    currentScreen,
    setCurrentScreen,
    currentLevel,
    selectLevel,
    goToNextLevel,
    showLevelSelectModal,
    setShowLevelSelectModal,
    showMissionBriefingModal,
    setShowMissionBriefingModal,
    showGameMenuModal,
    setShowGameMenuModal,
    showPS3GraphicsModal,
    setShowPS3GraphicsModal,
    activeTrophy,
    triggerTrophy,
    dismissTrophy,
    updateGraphicSettings,
    setActivePower,
    activeMiniGame,
    setActiveMiniGame,
    activeVocabModal,
    setActiveVocabModal,
    showNpcModal,
    setShowNpcModal,
    showRewardModal,
    setShowRewardModal,
    showLevelUpModal,
    setShowLevelUpModal,
    toastMessage,
    showToast,
    addXp,
    addCoins,
    addStars,
    discoverWord,
    isMissionCompleted,
    missionProgressCount,
    takeDamage,
    healHeart,
    isGameOver,
    revivePlayer,
    restartCurrentLevel,
    toggleMusic,
    toggleSfx,
    toggleLanguageMode,
    updateCharacter,
    resetProgress,
  } = useGameState();

  const handleInteractVocab = React.useCallback((item: any) => {
    discoverWord(item);
    setActiveVocabModal(item);
  }, [discoverWord]);

  const handleInteractNpc = React.useCallback(() => {
    audio.playInteract();
    setShowNpcModal(true);
  }, [setShowNpcModal]);

  const handleOpenMiniGames = React.useCallback(() => {
    audio.playButtonClick();
    setActiveMiniGame('FIND_IT');
  }, [setActiveMiniGame]);

  const handleOpenLevelSelect = React.useCallback(() => {
    setShowLevelSelectModal(true);
  }, [setShowLevelSelectModal]);

  const handleCollectCoin = React.useCallback((amt: number) => {
    addCoins(amt);
    showToast(`+${amt} Coins! 🪙`);
  }, [addCoins, showToast]);

  const handleCollectStar = React.useCallback((amt: number) => {
    addStars(amt);
    showToast(`+${amt} Star! ⭐`);
  }, [addStars, showToast]);

  const [activeRoom, setActiveRoom] = React.useState<RoomConfig | null>(null);

  const allGameRooms = React.useMemo(() => {
    return GAME_LEVELS.flatMap(lvl => lvl.rooms || []);
  }, []);

  const handleEnterRoom = React.useCallback((roomId: string) => {
    const room = allGameRooms.find(r => r.id === roomId) || currentLevel.rooms?.find(r => r.id === roomId);
    if (room) {
      audio.playDoorOpen();
      setActiveRoom(room);
      showToast(`🚪 Masuk ke: ${room.nameId}`);
    }
  }, [allGameRooms, currentLevel.rooms, showToast]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* SCREEN 1: SPLASH SCREEN */}
      {currentScreen === 'SPLASH' && (
        <SplashScreen
          onStart={() => {
            setCurrentScreen('MAIN_MENU');
          }}
        />
      )}

      {/* SCREEN 2: MAIN MENU */}
      {currentScreen === 'MAIN_MENU' && (
        <MainMenu
          saveData={saveData}
          onPlay={() => setCurrentScreen('GAME_WORLD')}
          onOpenFarm={() => setCurrentScreen('HARVEST_FARM')}
          onOpen3DRoom={() => {
            const firstRoom = allGameRooms[0] || (currentLevel.rooms && currentLevel.rooms[0]);
            if (firstRoom) {
              setActiveRoom(firstRoom);
              setCurrentScreen('GAME_WORLD');
            }
          }}
          onOpenMap={() => setShowLevelSelectModal(true)}
          onOpenWords={() => setCurrentScreen('VOCAB_COLLECTION')}
          onOpenBadges={() => setCurrentScreen('BADGES')}
          onOpenCharacter={() => setCurrentScreen('CHARACTER_SELECT')}
          onOpenPS3Graphics={() => setShowPS3GraphicsModal(true)}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
          onToggleLanguage={toggleLanguageMode}
          onResetProgress={resetProgress}
        />
      )}

      {/* SCREEN: HARVEST MOON FARMING ADVENTURE */}
      {currentScreen === 'HARVEST_FARM' && (
        <HarvestMoonFarm
          saveData={saveData}
          character={saveData.character}
          onAddCoins={addCoins}
          onAddXp={addXp}
          onBack={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* SCREEN 3: GAME WORLD (DYNAMIC THEMATIC LEVEL) */}
      {currentScreen === 'GAME_WORLD' && (
        <div className="relative w-full h-full">
          {/* Main 2.5D Thematic World Component with PS3 Graphics Pipeline */}
          <GameWorld
            character={saveData.character}
            level={currentLevel}
            discoveredWords={saveData.discoveredWords}
            graphicSettings={saveData.graphicSettings || DEFAULT_PS3_GRAPHICS}
            activeTrophy={activeTrophy}
            onDismissTrophy={dismissTrophy}
            onTriggerTrophy={triggerTrophy}
            onInteractVocab={handleInteractVocab}
            onInteractNpc={handleInteractNpc}
            onOpenMiniGames={handleOpenMiniGames}
            onOpenLevelSelect={handleOpenLevelSelect}
            onCollectCoin={handleCollectCoin}
            onCollectStar={handleCollectStar}
            onTakeDamage={takeDamage}
            onHealHeart={healHeart}
            onEnterRoom={handleEnterRoom}
          />

          {/* 3D INTERIOR ROOM EXPLORATION ("MASUK KE RUANGAN 3D") */}
          {activeRoom && (
            <div className="absolute inset-0 z-[650] bg-slate-950">
              <Room3DView
                room={activeRoom}
                allRooms={allGameRooms}
                character={saveData.character}
                discoveredWords={saveData.discoveredWords}
                onInteractVocab={handleInteractVocab}
                onCollectCoin={handleCollectCoin}
                onCollectStar={handleCollectStar}
                onUpdateCharacter={updateCharacter}
                onChangeRoom={(roomId) => {
                  const targetRoom = allGameRooms.find(r => r.id === roomId);
                  if (targetRoom) {
                    audio.playDoorOpen();
                    setActiveRoom(targetRoom);
                    showToast(`🚪 Pindah ke ${targetRoom.nameId}`);
                  }
                }}
                onExitRoom={() => {
                  audio.playDoorClose();
                  setActiveRoom(null);
                  showToast('🚪 Keluar kembali ke petualangan');
                }}
              />
            </div>
          )}

          {/* Persistent Minimal Game HUD with Bottom Adventure Dock */}
          <HUD
            saveData={saveData}
            currentLevel={currentLevel}
            missionProgressCount={missionProgressCount}
            isMissionCompleted={isMissionCompleted}
            onOpenMenu={() => setShowGameMenuModal(true)}
            onOpenFarm={() => setCurrentScreen('HARVEST_FARM')}
            onOpenPS3Graphics={() => setShowPS3GraphicsModal(true)}
            onToggleCleanBackground={() => {
              const currentClean = !!saveData.graphicSettings?.cleanBackgroundMode;
              updateGraphicSettings({
                ...(saveData.graphicSettings || DEFAULT_PS3_GRAPHICS),
                cleanBackgroundMode: !currentClean,
              });
              showToast(!currentClean ? '🌿 Mode Latar Bersih Aktif!' : '🎨 Mode Latar Penuh Aktif!');
            }}
            onSelectPower={setActivePower}
            onOpenMap={() => setShowLevelSelectModal(true)}
            onOpenWords={() => setCurrentScreen('VOCAB_COLLECTION')}
            onOpenBadges={() => setCurrentScreen('BADGES')}
            onOpenMiniGames={handleOpenMiniGames}
            onEnterRoom={handleEnterRoom}
            onToggleCameraZoom={() => {
              const current = saveData.graphicSettings?.cameraZoom || 'wide';
              const next = current === 'wide' ? 'standard' : current === 'standard' ? 'close' : 'wide';
              updateGraphicSettings({
                ...(saveData.graphicSettings || DEFAULT_PS3_GRAPHICS),
                cameraZoom: next,
              });
              audio.playPowerUp();
              showToast(
                next === 'wide'
                  ? '🔍 Kamera: Luas (Game Keren ✦)'
                  : next === 'standard'
                  ? '🔍 Kamera: Standar'
                  : '🔍 Kamera: Dekat'
              );
            }}
            onToggleMusic={toggleMusic}
            onToggleSfx={toggleSfx}
          />
        </div>
      )}

      {/* SCREEN 4: WORLD MAP (ENGLISH ISLAND) */}
      {currentScreen === 'WORLD_MAP' && (
        <WorldMap
          unlockedAreas={saveData.unlockedAreas}
          playerLevel={saveData.level}
          onEnterArea={(areaId) => {
            if (areaId === 'area_home') {
              selectLevel(1);
            } else if (areaId === 'area_school') {
              selectLevel(3);
            } else if (areaId === 'area_park') {
              selectLevel(2);
            } else if (areaId === 'area_market') {
              selectLevel(4);
            } else {
              selectLevel(5);
            }
            setCurrentScreen('GAME_WORLD');
          }}
          onBack={() => setCurrentScreen('GAME_WORLD')}
        />
      )}

      {/* SCREEN 5: VOCABULARY ALBUM (MY WORDS) */}
      {currentScreen === 'VOCAB_COLLECTION' && (
        <VocabCollection
          discoveredWords={saveData.discoveredWords}
          onBack={() => setCurrentScreen('GAME_WORLD')}
        />
      )}

      {/* SCREEN 6: BADGES & ACHIEVEMENTS */}
      {currentScreen === 'BADGES' && (
        <BadgesScreen
          unlockedBadges={saveData.unlockedBadges}
          coins={saveData.coins}
          discoveredWordsCount={saveData.discoveredWords.length}
          onBack={() => setCurrentScreen('GAME_WORLD')}
        />
      )}

      {/* SCREEN 7: CHARACTER CUSTOMIZER */}
      {currentScreen === 'CHARACTER_SELECT' && (
        <CharacterSelect
          initialConfig={saveData.character}
          onSave={updateCharacter}
          onBack={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* NON-INTRUSIVE IN-GAME VOCABULARY DISCOVERY CARD */}
      {activeVocabModal && (
        <VocabDiscoveryCard
          item={activeVocabModal}
          allLevelItems={currentLevel.vocabItems}
          onCorrectAnswer={(item) => {
            discoverWord(item);
          }}
          onClose={() => setActiveVocabModal(null)}
        />
      )}

      {/* MODAL 2: LEVEL NPC GUIDE & QUEST DIALOGUE */}
      {showNpcModal && (
        <NPCModal
          npc={currentLevel.npc}
          mission={currentLevel.mission}
          missionProgressCount={missionProgressCount}
          isMissionCompleted={isMissionCompleted}
          onClose={() => setShowNpcModal(false)}
        />
      )}

      {/* MODAL 3: MISSION REWARD & LEVEL COMPLETION CELEBRATION */}
      {showRewardModal && (
        <RewardModal
          currentLevel={currentLevel}
          onClose={() => setShowRewardModal(false)}
          onGoToNextLevel={goToNextLevel}
          onOpenLevelSelect={() => {
            setShowRewardModal(false);
            setShowLevelSelectModal(true);
          }}
        />
      )}

      {/* MODAL 4: LEVEL UP CELEBRATION */}
      {showLevelUpModal !== null && (
        <LevelUpModal
          newLevel={showLevelUpModal}
          onClose={() => setShowLevelUpModal(null)}
        />
      )}

      {/* MODAL 5: LEVEL SELECTOR MODAL */}
      {showLevelSelectModal && (
        <LevelSelectModal
          currentLevelId={currentLevel.id}
          unlockedLevelIds={saveData.unlockedLevelIds}
          completedMissions={saveData.completedMissions}
          onSelectLevel={(lvlId) => {
            selectLevel(lvlId);
            setCurrentScreen('GAME_WORLD');
          }}
          onClose={() => setShowLevelSelectModal(false)}
        />
      )}

      {/* MODAL 5B: MISSION BRIEFING MODAL */}
      {showMissionBriefingModal && (
        <MissionBriefingModal
          level={currentLevel}
          onClose={() => setShowMissionBriefingModal(false)}
        />
      )}

      {/* MODAL 5C: MODERN SLIDE-OUT GAME MENU */}
      {showGameMenuModal && (
        <GameMenuModal
          currentLevel={currentLevel}
          saveData={saveData}
          missionProgressCount={missionProgressCount}
          isMissionCompleted={isMissionCompleted}
          onSelectLevel={(lvlId) => {
            selectLevel(lvlId);
            setCurrentScreen('GAME_WORLD');
          }}
          onOpenFarm={() => {
            setShowGameMenuModal(false);
            setCurrentScreen('HARVEST_FARM');
          }}
          onOpenWords={() => setCurrentScreen('VOCAB_COLLECTION')}
          onOpenBadges={() => setCurrentScreen('BADGES')}
          onOpenMiniGames={() => setActiveMiniGame('FIND_IT')}
          onOpenPS3Graphics={() => setShowPS3GraphicsModal(true)}
          onEnterRoom={handleEnterRoom}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
          onToggleLanguage={toggleLanguageMode}
          onResetProgress={resetProgress}
          onClose={() => setShowGameMenuModal(false)}
        />
      )}

      {/* MODAL 5D: PS3 HD GRAPHICS & VISUAL ENGINE SETTINGS */}
      <PS3GraphicsModal
        isOpen={showPS3GraphicsModal}
        settings={saveData.graphicSettings || DEFAULT_PS3_GRAPHICS}
        onUpdateSettings={updateGraphicSettings}
        onClose={() => setShowPS3GraphicsModal(false)}
        onTestTrophy={() => {
          triggerTrophy({
            id: 'ps3_fan_trophy_' + Date.now(),
            tier: 'gold',
            title: 'Penikmat Grafis PS3!',
            description: 'Mode Visual PS3 HD Remaster aktif!',
            icon: '🏆',
          });
        }}
      />

      {/* MODAL 6: 5 MINI-GAMES CARNIVAL */}
      {activeMiniGame && (
        <MiniGameHub
          initialGame={activeMiniGame}
          onClose={() => setActiveMiniGame(null)}
          onWinReward={(xp, coins) => {
            addXp(xp);
            addCoins(coins);
            showToast(`Won Game! +${xp} XP · +${coins} Coins! 🎉`);
          }}
        />
      )}

      {/* MODAL 7: GAME OVER / REVIVE MODAL */}
      <GameOverModal
        isOpen={isGameOver}
        onRevive={revivePlayer}
        onRestartLevel={restartCurrentLevel}
      />

      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="px-4 py-2 bg-slate-900/90 text-amber-300 font-extrabold text-xs rounded-full border-2 border-amber-400 shadow-2xl backdrop-blur-md font-game animate-bounce">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
