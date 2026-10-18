import { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { PlayerSaveData, CharacterConfig, GameScreen, MiniGameType, VocabItem, GameLevel, PS3GraphicSettings, PS3TrophyNotification, HeroPowerType } from '../types/game';
import { GAME_LEVELS, GAME_BADGES, WORLD_AREAS } from '../data/gameData';
import { ALL_HERO_POWER_IDS } from '../data/heroPowers';
import { audio } from '../services/audio';

const STORAGE_KEY = 'english_adventure_save_v2';

export const DEFAULT_PS3_GRAPHICS: PS3GraphicSettings = {
  cleanBackgroundMode: true,
  bloomGlow: true,
  volumetricRays: true,
  parallaxBokeh: true,
  heroRimLight: true,
  cinematicVignette: true,
  dualshockPrompts: true,
  highDefShadows: true,
};

const DEFAULT_CHARACTER: CharacterConfig = {
  name: 'Robo-Cerdas',
  robotModel: 'robo_smart',
  outfitColor: '#0EA5E9', // Cyan Cyber Armor
  backpackColor: '#F59E0B', // Amber Power Pack
  hat: 'antenna',
};

const DEFAULT_SAVE: PlayerSaveData = {
  character: DEFAULT_CHARACTER,
  level: 1,
  xp: 0,
  maxXp: 100,
  coins: 20,
  stars: 0,
  hearts: 3, // legacy
  energy: 100,
  maxEnergy: 100,
  activePower: 'sahabat_kafa',
  unlockedPowers: ALL_HERO_POWER_IDS,
  currentLevelId: 1,
  unlockedLevelIds: [1, 2, 3, 4, 5, 6, 7],
  discoveredWords: [],
  completedMissions: [],
  unlockedAreas: ['area_home', 'area_park', 'area_school', 'area_market', 'area_city', 'area_cavern', 'area_space'],
  unlockedBadges: [],
  musicEnabled: true,
  sfxEnabled: true,
  hasSeenIntro: false,
  languageMode: 'bilingual',
  graphicSettings: DEFAULT_PS3_GRAPHICS,
};

export function useGameState() {
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          graphicSettings: {
            ...DEFAULT_PS3_GRAPHICS,
            ...(parsed.graphicSettings || {}),
            cleanBackgroundMode: parsed.graphicSettings?.cleanBackgroundMode ?? true,
          },
          currentLevelId: parsed.currentLevelId || 1,
          unlockedLevelIds: parsed.unlockedLevelIds || [1, 2, 3, 4, 5, 6, 7],
          unlockedAreas: parsed.unlockedAreas || ['area_home', 'area_park', 'area_school', 'area_market', 'area_city', 'area_cavern', 'area_space'],
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SAVE;
  });

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('SPLASH');
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  
  // Modals state
  const [activeVocabModal, setActiveVocabModal] = useState<VocabItem | null>(null);
  const [showNpcModal, setShowNpcModal] = useState<boolean>(false);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState<number | null>(null);
  const [showLevelSelectModal, setShowLevelSelectModal] = useState<boolean>(false);
  const [showMissionBriefingModal, setShowMissionBriefingModal] = useState<boolean>(true);
  const [showGameMenuModal, setShowGameMenuModal] = useState<boolean>(false);
  const [showPS3GraphicsModal, setShowPS3GraphicsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTrophy, setActiveTrophy] = useState<PS3TrophyNotification | null>(null);

  const trophyTimeoutRef = useState<number | null>(null);

  const triggerTrophy = useCallback((trophy: PS3TrophyNotification) => {
    audio.playTrophyUnlock();
    setActiveTrophy(trophy);
    setTimeout(() => {
      setActiveTrophy(curr => (curr?.id === trophy.id ? null : curr));
    }, 4500);
  }, []);

  const dismissTrophy = useCallback(() => {
    setActiveTrophy(null);
  }, []);

  const updateGraphicSettings = useCallback((newSettings: PS3GraphicSettings) => {
    setSaveData(prev => ({
      ...prev,
      graphicSettings: newSettings,
    }));
  }, []);

  // Current active level configuration
  const currentLevel: GameLevel = useMemo(() => {
    return GAME_LEVELS.find(l => l.id === saveData.currentLevelId) || GAME_LEVELS[0];
  }, [saveData.currentLevelId]);

  // Sync with audio settings
  useEffect(() => {
    audio.setSoundSettings(saveData.sfxEnabled, saveData.musicEnabled);
  }, [saveData.sfxEnabled, saveData.musicEnabled]);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // Ignore storage errors
    }
  }, [saveData]);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Level selection
  const selectLevel = useCallback((levelId: number) => {
    if (!saveData.unlockedLevelIds.includes(levelId)) {
      showToast('🔒 Selesaikan level sebelumnya untuk membuka level ini!');
      return;
    }
    audio.playButtonClick();
    setSaveData(prev => ({
      ...prev,
      currentLevelId: levelId,
    }));
    setShowLevelSelectModal(false);
    setShowMissionBriefingModal(true);
    const targetLvl = GAME_LEVELS.find(l => l.id === levelId);
    if (targetLvl) {
      showToast(`🚀 Masuk ke Level ${levelId}: ${targetLvl.nameId}!`);
    }
  }, [saveData.unlockedLevelIds, showToast]);

  // XP & Level Progression System
  const addXp = useCallback((amount: number) => {
    setSaveData(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let didLevelUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        didLevelUp = true;
      }

      if (didLevelUp) {
        audio.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          setShowLevelUpModal(newLevel);
        }, 400);

        return {
          ...prev,
          level: newLevel,
          xp: newXp,
          maxXp: newMaxXp,
        };
      }

      return {
        ...prev,
        xp: newXp,
      };
    });
  }, []);

  // Coins & Stars collection
  const addCoins = useCallback((amount: number) => {
    audio.playCoin();
    setSaveData(prev => {
      const newCoins = prev.coins + amount;
      const newBadges = [...prev.unlockedBadges];
      if (newCoins >= 50 && !newBadges.includes('coin_magnet')) {
        newBadges.push('coin_magnet');
        showToast('🏆 Badge Unlocked: Treasure Seeker!');
      }
      return {
        ...prev,
        coins: newCoins,
        unlockedBadges: newBadges,
      };
    });
  }, [showToast]);

  const addStars = useCallback((amount: number) => {
    audio.playCorrect();
    setSaveData(prev => ({
      ...prev,
      stars: prev.stars + amount,
    }));
  }, []);

  // Discover a Vocabulary Word
  const discoverWord = useCallback((item: VocabItem) => {
    setSaveData(prev => {
      const alreadyDiscovered = prev.discoveredWords.includes(item.id);
      const newDiscovered = alreadyDiscovered 
        ? prev.discoveredWords 
        : [...prev.discoveredWords, item.id];

      const newBadges = [...prev.unlockedBadges];
      if (newDiscovered.length >= 8 && !newBadges.includes('vocab_hunter')) {
        newBadges.push('vocab_hunter');
        showToast('🏆 Badge Unlocked: Word Collector!');
      }

      return {
        ...prev,
        discoveredWords: newDiscovered,
      };
    });

    if (!saveData.discoveredWords.includes(item.id)) {
      addXp(item.xp);
      addCoins(item.coins);
      showToast(`✨ Ditemukan: ${item.word} (${item.translation}) · +${item.xp} XP!`);

      // Trigger PS3 Trophy on first discovery or milestones
      if (saveData.discoveredWords.length === 0) {
        triggerTrophy({
          id: 'first_word_trophy',
          tier: 'bronze',
          title: 'Petualang Cilik Baru!',
          description: `Menemukan kosakata pertama: ${item.word}`,
          icon: '🥉',
        });
      } else if (saveData.discoveredWords.length === 4) {
        triggerTrophy({
          id: 'scholar_trophy',
          tier: 'silver',
          title: 'Kolektor Kosakata SD!',
          description: 'Berhasil mengumpulkan 5 kosakata SD',
          icon: '🥈',
        });
      }
    }

    setActiveVocabModal(item);
    audio.playInteract();
    audio.speak(item.word);
  }, [saveData.discoveredWords, addXp, addCoins, showToast]);

  // Mission Progress for Current Level
  const activeMission = currentLevel.mission;
  const isMissionCompleted = saveData.completedMissions.includes(activeMission.id);
  const missionProgressCount = activeMission.targetWords.filter(wId => saveData.discoveredWords.includes(wId)).length;

  // Complete Current Level Mission
  const completeMission = useCallback(() => {
    if (isMissionCompleted) return;

    audio.playMissionComplete();
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 },
    });

    setSaveData(prev => {
      const newCompleted = [...prev.completedMissions, activeMission.id];
      const newBadges = [...prev.unlockedBadges];
      if (!newBadges.includes('first_adventure')) {
        newBadges.push('first_adventure');
      }

      // Unlock next level!
      const nextLevelId = currentLevel.id + 1;
      const unlockedLevelIds = [...prev.unlockedLevelIds];
      if (nextLevelId <= GAME_LEVELS.length && !unlockedLevelIds.includes(nextLevelId)) {
        unlockedLevelIds.push(nextLevelId);
      }

      return {
        ...prev,
        completedMissions: newCompleted,
        unlockedBadges: newBadges,
        unlockedLevelIds,
        stars: prev.stars + activeMission.reward.stars,
      };
    });

    addXp(activeMission.reward.xp);
    addCoins(activeMission.reward.coins);
    setShowRewardModal(true);

    // PS3 Gold Trophy on Level Mission Clear
    triggerTrophy({
      id: `mission_cleared_${activeMission.id}`,
      tier: 'gold',
      title: `Misi ${currentLevel.nameId} Selesai!`,
      description: `Bintang & hadiah terkumpul untuk Level ${currentLevel.id}`,
      icon: '🥇',
    });
  }, [isMissionCompleted, activeMission, currentLevel.id, currentLevel.nameId, addXp, addCoins, triggerTrophy]);

  // Auto trigger mission completion when all target words found
  useEffect(() => {
    if (missionProgressCount >= activeMission.targetWords.length && !isMissionCompleted) {
      setTimeout(() => {
        completeMission();
      }, 700);
    }
  }, [missionProgressCount, activeMission.targetWords.length, isMissionCompleted, completeMission]);

  // Next level navigation helper
  const goToNextLevel = useCallback(() => {
    setShowRewardModal(false);
    const nextLvlId = currentLevel.id + 1;
    if (nextLvlId <= GAME_LEVELS.length) {
      selectLevel(nextLvlId);
    } else {
      showToast('🎉 Selamat! Kamu telah menamatkan semua 5 Level!');
    }
  }, [currentLevel.id, selectLevel, showToast]);

  // Audio toggles
  const toggleMusic = () => {
    setSaveData(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  };

  const toggleSfx = () => {
    setSaveData(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  };

  // Language Mode switcher (id <-> bilingual <-> en)
  const toggleLanguageMode = () => {
    setSaveData(prev => {
      let nextMode: 'id' | 'bilingual' | 'en' = 'bilingual';
      if (prev.languageMode === 'bilingual') nextMode = 'id';
      else if (prev.languageMode === 'id') nextMode = 'en';
      else nextMode = 'bilingual';
      showToast(
        nextMode === 'id'
          ? '🇮🇩 Bahasa: Bahasa Indonesia'
          : nextMode === 'bilingual'
          ? '🇮🇩 Bahasa: Dwi-Bahasa (ID & EN)'
          : '🇬🇧 Language: English Only'
      );
      return { ...prev, languageMode: nextMode };
    });
  };

  const setLanguageMode = (mode: 'id' | 'bilingual' | 'en') => {
    setSaveData(prev => ({ ...prev, languageMode: mode }));
  };

  const updateCharacter = (char: CharacterConfig) => {
    setSaveData(prev => ({ ...prev, character: char }));
  };

  // Continuous rapid Star Energy recharge for unlimited fun powers
  useEffect(() => {
    const timer = setInterval(() => {
      setSaveData(prev => {
        const cur = prev.energy !== undefined ? prev.energy : 100;
        const max = prev.maxEnergy || 100;
        if (cur < max) {
          return { ...prev, energy: Math.min(max, cur + 5) };
        }
        return prev;
      });
    }, 280);
    return () => clearInterval(timer);
  }, []);

  const setActivePower = useCallback((power: HeroPowerType) => {
    audio.playButtonClick();
    setSaveData(prev => ({ ...prev, activePower: power }));
  }, []);

  const consumeEnergy = useCallback((amount: number): boolean => {
    let allowed = false;
    setSaveData(prev => {
      const cur = prev.energy !== undefined ? prev.energy : 100;
      if (cur >= amount) {
        allowed = true;
        return { ...prev, energy: Math.max(0, cur - amount) };
      }
      return prev;
    });
    return allowed;
  }, []);

  // Player is immortal (no lives/hearts limit!) - taking hit is just a playful deflection
  const [isGameOver] = useState<boolean>(false);

  const takeDamage = useCallback(() => {
    audio.playCuteBump();
  }, []);

  const healHeart = useCallback(() => {
    // No-op since player has infinite life!
  }, []);

  const revivePlayer = useCallback(() => {
    // No-op
  }, []);

  const restartCurrentLevel = useCallback(() => {
    selectLevel(currentLevel.id);
    showToast('🔄 Mengulang level!');
  }, [selectLevel, currentLevel.id, showToast]);

  const resetProgress = () => {
    setSaveData(DEFAULT_SAVE);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentScreen('SPLASH');
  };

  return {
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
    consumeEnergy,
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
    completeMission,
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
    setLanguageMode,
    updateCharacter,
    resetProgress,
  };
}
