import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  PlayerPhysics,
  CharacterConfig,
  VocabItem,
  CollectibleItem,
  GameLevel,
  MysteryBlock,
  LevelPlatform,
  LevelBouncer,
  LevelEnemy,
  WorldObstacle,
  DoorPortal,
  PlayerProjectile,
  EnemyProjectile,
} from '../../types/game';
import { audio } from '../../services/audio';
import { UniversalVocabProp, FacelessCharacter } from './VocabProps';
import { EnemyCritter } from './EnemyProps';
import { ObstacleProp } from './ObstacleProps';
import { PS3GraphicsLayer, DEFAULT_PS3_GRAPHICS } from './PS3GraphicsLayer';
import { PS3GraphicSettings, PS3TrophyNotification, HeroPowerType } from '../../types/game';
import { HERO_POWERS, ALL_HERO_POWER_IDS } from '../../data/heroPowers';
import { ADVENTURE_KNOWLEDGE_POSTS, AdventureKnowledgePost } from '../../data/sdCurriculum';
import { KnowledgePostModal } from '../modals/KnowledgePostModal';
import { ClassroomBlackboardModal } from '../modals/ClassroomBlackboardModal';

const WORLD_HEIGHT = 630;

interface GameWorldProps {
  character: CharacterConfig;
  level: GameLevel;
  discoveredWords: string[];
  graphicSettings?: PS3GraphicSettings;
  activeTrophy?: PS3TrophyNotification | null;
  onDismissTrophy?: () => void;
  onTriggerTrophy?: (trophy: PS3TrophyNotification) => void;
  activePower?: HeroPowerType;
  onSelectPower?: (power: HeroPowerType) => void;
  energy?: number;
  consumeEnergy?: (amount: number) => boolean;
  onInteractVocab: (item: VocabItem) => void;
  onInteractNpc: () => void;
  onOpenMiniGames: () => void;
  onOpenLevelSelect: () => void;
  onCollectCoin: (amount: number) => void;
  onCollectStar: (amount: number) => void;
  onTakeDamage?: (amount: number) => void;
  onHealHeart?: (amount: number) => void;
  onEnterRoom?: (roomId: string) => void;
}

const GRAVITY = 0.85;
const JUMP_FORCE = 15;
const SPEED = 5.2;

export const GameWorld: React.FC<GameWorldProps> = ({
  character,
  level,
  discoveredWords,
  graphicSettings = DEFAULT_PS3_GRAPHICS,
  activeTrophy = null,
  onDismissTrophy = () => {},
  onTriggerTrophy,
  activePower = 'sahabat_kafa',
  onSelectPower,
  energy = 100,
  consumeEnergy,
  onInteractVocab,
  onInteractNpc,
  onOpenMiniGames,
  onOpenLevelSelect,
  onCollectCoin,
  onCollectStar,
  onTakeDamage,
  onHealHeart,
  onEnterRoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Mutable refs for physics and frame updates (avoids setState inside setState & stale closures)
  const playerRef = useRef<PlayerPhysics>({
    x: level.playerStartX,
    y: level.playerStartY,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    facing: 'right',
    state: 'idle',
    isGrounded: true,
  });
  const [player, setPlayer] = useState<PlayerPhysics>(playerRef.current);

  const collectiblesRef = useRef<CollectibleItem[]>(level.collectibles || []);
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>(collectiblesRef.current);

  const mysteryBlocksRef = useRef<MysteryBlock[]>(level.mysteryBlocks || []);
  const [mysteryBlocks, setMysteryBlocks] = useState<MysteryBlock[]>(mysteryBlocksRef.current);

  // Dynamic interactive enemies in the level
  const enemiesRef = useRef<LevelEnemy[]>(level.enemies || []);
  const [enemies, setEnemies] = useState<LevelEnemy[]>(enemiesRef.current);

  // Player damage, iframe, and screen shake states
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const invulnerableUntilRef = useRef<number>(0);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [showHurtFlash, setShowHurtFlash] = useState<boolean>(false);

  const nearVocabRef = useRef<VocabItem | null>(null);
  const [nearVocab, setNearVocab] = useState<VocabItem | null>(null);

  const nearNpcRef = useRef<boolean>(false);
  const [nearNpc, setNearNpc] = useState<boolean>(false);

  const nearMiniGameGateRef = useRef<boolean>(false);
  const [nearMiniGameGate, setNearMiniGameGate] = useState<boolean>(false);

  const nearDoorPortalRef = useRef<DoorPortal | null>(null);
  const [nearDoorPortal, setNearDoorPortal] = useState<DoorPortal | null>(null);

  const nearKnowledgePostRef = useRef<AdventureKnowledgePost | null>(null);
  const [nearKnowledgePost, setNearKnowledgePost] = useState<AdventureKnowledgePost | null>(null);
  const [activeKnowledgePost, setActiveKnowledgePost] = useState<AdventureKnowledgePost | null>(null);
  const [showClassroomBlackboardModal, setShowClassroomBlackboardModal] = useState<boolean>(false);
  const [blackboardInitialTab, setBlackboardInitialTab] = useState<'QUIZ' | 'ASTRONOMI' | 'LITERASI' | 'TRIVIA' | 'DOODLE'>('QUIZ');
  const nearBlackboardRef = useRef<boolean>(false);
  const [nearBlackboard, setNearBlackboard] = useState<boolean>(false);

  const cameraXRef = useRef<number>(0);
  const [cameraX, setCameraX] = useState<number>(0);

  const activePowerConfig = HERO_POWERS.find(p => p.id === (activePower || 'sahabat_kafa')) || HERO_POWERS[0];

  // Responsive Viewport Height & Width Adaptive Scaling for Mobile Phones & Tablets
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1000
  );
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : WORLD_HEIGHT
  );
  const [showPortraitTip, setShowPortraitTip] = useState<boolean>(true);
  const [controlMode, setControlMode] = useState<'dpad' | 'joystick'>('dpad');
  const [showPowerDrawer, setShowPowerDrawer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
        setViewportHeight(containerRef.current.clientHeight);
      } else if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
        setViewportHeight(window.innerHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isPortrait = viewportWidth < viewportHeight;
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    if (isPortrait && showPortraitTip) {
      const timer = setTimeout(() => {
        setShowPortraitTip(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isPortrait, showPortraitTip]);

  // Camera Zoom mode from settings (default 'wide' for expansive, cool view!)
  const cameraZoom = graphicSettings?.cameraZoom || 'wide';
  const zoomFactor = cameraZoom === 'wide' ? 0.96 : cameraZoom === 'close' ? 1.30 : 1.10;

  // Responsive world scale: Proportioned so the ground platform naturally sits around ~72% - 76% of screen height
  const worldScale = isPortrait
    ? Math.max(0.65, Math.min(1.25, Math.min(viewportHeight / 620, viewportWidth / 440))) * zoomFactor
    : Math.max(0.85, Math.min(1.50, viewportHeight / 640)) * zoomFactor;

  // Dynamic vertical camera offset: frames the ground line at ~74% of the viewport height on any display
  const targetGroundScreenY = viewportHeight * 0.74;
  const cameraY = Math.max(0, (level.groundY * worldScale - targetGroundScreenY) / worldScale);

  // Ensure world content fills 100% of the screen height without empty voids
  const worldContentHeight = Math.max(WORLD_HEIGHT, Math.ceil((viewportHeight + 80) / worldScale) + cameraY);

  // Direct GPU Compositing DOM Refs (Eliminates 60FPS React Virtual DOM overhead!)
  const worldContainerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const lastCameraXUpdate = useRef<number>(0);
  const lastEnemyUpdate = useRef<number>(0);

  const flagpoleClearedRef = useRef<boolean>(false);
  const [flagpoleCleared, setFlagpoleCleared] = useState<boolean>(false);

  const [bouncedMushroomId, setBouncedMushroomId] = useState<string | null>(null);
  const [bouncingItemId, setBouncingItemId] = useState<string | null>(null);
  const [dustPuffs, setDustPuffs] = useState<{ id: string; x: number; y: number; scale: number }[]>([]);
  const [floatingScores, setFloatingScores] = useState<{ id: string; x: number; y: number; text: string; color: string }[]>([]);
  const [globeSpinCount, setGlobeSpinCount] = useState<number>(0);

  // Player Jurus & Projectiles
  const playerProjectilesRef = useRef<PlayerProjectile[]>([]);
  const [playerProjectiles, setPlayerProjectiles] = useState<PlayerProjectile[]>([]);

  // Enemy Projectiles
  const enemyProjectilesRef = useRef<EnemyProjectile[]>([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState<EnemyProjectile[]>([]);

  // Jurus Cooldown & Ground Pound state
  const lastJurusTimeRef = useRef<number>(0);
  const isGroundPoundingRef = useRef<boolean>(false);
  const [isGroundPounding, setIsGroundPounding] = useState<boolean>(false);
  const [groundShockwaves, setGroundShockwaves] = useState<{ id: string; x: number; y: number }[]>([]);

  // Super Powers States (Tornado, Shield, Super Nova)
  const isTornadoSpinningRef = useRef<boolean>(false);
  const [isTornadoSpinning, setIsTornadoSpinning] = useState<boolean>(false);
  const shieldUntilRef = useRef<number>(0);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [superNovaActive, setSuperNovaActive] = useState<boolean>(false);

  // Sahabat Kafa Power Activation Banner, Buff Aura, Screen Flash & Visual Shockwave FX
  const [activeKafaBanner, setActiveKafaBanner] = useState<{ title: string; subtitle: string; icon: string; glowColor: string } | null>(null);
  const kafaBannerTimeoutRef = useRef<any>(null);
  const [kafaShockwave, setKafaShockwave] = useState<{ id: string; x: number; y: number } | null>(null);
  const [kafaBuffUntil, setKafaBuffUntil] = useState<number>(0);
  const [kafaScreenFlash, setKafaScreenFlash] = useState<boolean>(false);
  const [jurusHeroShout, setJurusHeroShout] = useState<string | null>(null);
  const isKafaBuffActive = Date.now() < kafaBuffUntil;

  // Acrobatic Double Jump & Spin
  const canDoubleJumpRef = useRef<boolean>(true);
  const [isAcrobaticFlipping, setIsAcrobaticFlipping] = useState<boolean>(false);

  // Dynamic Combo Streak System
  const comboStreakRef = useRef<number>(0);
  const lastComboTimeRef = useRef<number>(0);
  const [activeComboDisplay, setActiveComboDisplay] = useState<{ count: number; text: string } | null>(null);

  const registerComboAction = useCallback((_action: string) => {
    const now = Date.now();
    if (now - lastComboTimeRef.current < 2600) {
      comboStreakRef.current += 1;
    } else {
      comboStreakRef.current = 1;
    }
    lastComboTimeRef.current = now;

    if (comboStreakRef.current >= 2) {
      const count = comboStreakRef.current;
      const text =
        count >= 5
          ? `👑 ULTRA COMBO x${count}! +10 🪙`
          : count >= 4
          ? `💥 MEGA COMBO x${count}! +5 🪙`
          : count >= 3
          ? `⚡ SUPER COMBO x${count}! +3 🪙`
          : `🔥 COMBO x${count}!`;

      setActiveComboDisplay({ count, text });
      audio.playPowerUp();
      if (count >= 3) {
        onCollectCoin(count >= 5 ? 10 : count >= 4 ? 5 : 3);
      }
      setTimeout(() => {
        setActiveComboDisplay(prev => (prev?.count === count ? null : prev));
      }, 2000);
    }
  }, [onCollectCoin]);

  // Sahabat Kafa Ancient Shrine in Adventure
  const isNearShrineRef = useRef<boolean>(false);
  const [isNearShrine, setIsNearShrine] = useState<boolean>(false);

  const triggerKafaPowerBanner = useCallback((powerName: string, icon: string, glowColor: string = '#F59E0B') => {
    setActiveKafaBanner({
      title: '👑 JURUS SAHABAT KAFA!',
      subtitle: powerName.toUpperCase(),
      icon,
      glowColor,
    });

    // Signature fanfare + energetic voice shout: "Jurus Sahabat Kafa!"
    audio.playSahabatKafaJurus(powerName);
    setKafaBuffUntil(Date.now() + 3000);

    // Screen golden shockwave flash
    setKafaScreenFlash(true);
    setTimeout(() => setKafaScreenFlash(false), 380);

    // Hero shout bubble above character
    setJurusHeroShout('👑 JURUS SAHABAT KAFA!');
    setTimeout(() => setJurusHeroShout(null), 1300);

    if (kafaBannerTimeoutRef.current) clearTimeout(kafaBannerTimeoutRef.current);
    kafaBannerTimeoutRef.current = setTimeout(() => {
      setActiveKafaBanner(null);
    }, 1800);
  }, []);

  // Atmospheric adventure visual particles (cherry blossom petals, stardust, fireflies, sunlight glints)
  const ambientParticles = useMemo(() => {
    const list = [];
    const count = 28;
    const iconsByLevel: { [key: number]: string[] } = {
      1: ['🌸', '✨', '🍃', '☀️'],
      2: ['🍃', '🌿', '✨', '💡'],
      3: ['✨', '🫧', '✏️', '💡'],
      4: ['🎉', '🏮', '✨', '🎈'],
      5: ['🦋', '✨', '🌾', '☀️'],
      6: ['💎', '💠', '✨', '⭐'],
      7: ['✨', '🪐', '☄️', '🌟'],
    };
    const icons = iconsByLevel[level.id] || ['✨', '🌟', '🍃'];
    for (let i = 0; i < count; i++) {
      const icon = icons[i % icons.length];
      const px = Math.round((i / count) * level.worldWidth + ((i * 97) % 150));
      const py = 120 + ((i * 47) % (level.groundY - 180));
      list.push({
        id: `amb_${level.id}_${i}`,
        x: px,
        y: py,
        icon,
        dx: (i % 2 === 0 ? 1 : -1) * (18 + (i % 24)),
        dy: (i % 3 === 0 ? -1 : 1) * (14 + (i % 18)),
        duration: 3.2 + (i % 4),
        opacity: 0.35 + (i % 5) * 0.1,
        rot: (i % 2 === 0 ? 180 : -180),
      });
    }
    return list;
  }, [level.id, level.worldWidth, level.groundY]);

  // Extended Adventure: Zone Milestones & Rocket Sprinting
  const [activeZoneBanner, setActiveZoneBanner] = useState<{ nameId: string; icon: string } | null>(null);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const isSprintingRef = useRef<boolean>(false);
  const speedBoostUntilRef = useRef<number>(0);
  const mobileSprintRef = useRef<boolean>(false);
  const mobileLeftRef = useRef<boolean>(false);
  const mobileRightRef = useRef<boolean>(false);
  const mobileUpRef = useRef<boolean>(false);
  const mobileDownRef = useRef<boolean>(false);
  const visitedZonesRef = useRef<Set<string>>(new Set());

  // Mid-Stage Adventure Checkpoint Campfire
  const checkpointX = Math.round(level.worldWidth * 0.48);
  const isCheckpointReachedRef = useRef<boolean>(false);
  const [isCheckpointReached, setIsCheckpointReached] = useState<boolean>(false);

  // Hero Emote & Victory Celebration
  const [activeHeroEmote, setActiveHeroEmote] = useState<{ id: string; emoji: string; label: string } | null>(null);

  // Reset zone milestone history when switching levels
  useEffect(() => {
    visitedZonesRef.current.clear();
    setActiveZoneBanner(null);
    isCheckpointReachedRef.current = false;
    setIsCheckpointReached(false);
    setActiveHeroEmote(null);
  }, [level.id]);

  // Input states
  const keys = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const isJoystickActiveRef = useRef<boolean>(false);
  const joystickStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumbPos, setJoystickThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dismissRotateTip, setDismissRotateTip] = useState<boolean>(false);
  const lastFootstepRef = useRef<number>(0);
  const lastDustRef = useRef<number>(0);

  // Helper to spawn cartoon dust puff particles (landing, running, skidding)
  const spawnDust = useCallback((x: number, y: number, scale: number = 1) => {
    const id = `${Date.now()}_${Math.random()}`;
    setDustPuffs(prev => [...prev.slice(-8), { id, x, y, scale }]);
    setTimeout(() => {
      setDustPuffs(prev => prev.filter(d => d.id !== id));
    }, 450);
  }, []);

  // Floating score popups helper
  const spawnFloatingScore = useCallback((x: number, y: number, text: string, color: string = '#FBBF24') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1200);
  }, []);

  const triggerSpinGlobe = useCallback(() => {
    setGlobeSpinCount(c => c + 1);
    audio.playCoin();
    onCollectCoin(2);
    spawnDust(270, level.groundY - 15, 1.8);
    spawnFloatingScore(270, level.groundY - 70, '🌍 KELILING DUNIA! +2 🪙', '#38BDF8');
  }, [level.groundY, onCollectCoin, spawnDust, spawnFloatingScore]);

  const triggerHeroEmote = useCallback((emoteType: 'dance' | 'wave' | 'star') => {
    audio.playPowerUp();
    confetti({ particleCount: 35, spread: 60, origin: { x: 0.5, y: 0.6 } });
    const emotes = {
      dance: { id: 'dance', emoji: '🕺 🎶', label: 'Joget Pesta!' },
      wave: { id: 'wave', emoji: '👋 😊', label: 'Halo Petualang!' },
      star: { id: 'star', emoji: '⭐ 🌟', label: 'Pose Bintang Juara!' },
    };
    const e = emotes[emoteType];
    setActiveHeroEmote(e);
    spawnFloatingScore(playerRef.current.x, playerRef.current.y - 75, e.label, '#FBBF24');
    setTimeout(() => {
      setActiveHeroEmote(prev => prev?.id === emoteType ? null : prev);
    }, 2200);
  }, [spawnFloatingScore]);

  const triggerShrineBlessing = useCallback(() => {
    audio.playSahabatKafaPower();
    confetti({ particleCount: 80, spread: 85, origin: { y: 0.55 } });
    setKafaBuffUntil(Date.now() + 8000);
    speedBoostUntilRef.current = performance.now() + 8000;
    onCollectCoin(15);
    onCollectStar(3);
    const shrineX = Math.round(level.worldWidth * 0.45);
    spawnDust(shrineX, level.groundY - 15, 2.5);
    spawnFloatingScore(shrineX, level.groundY - 110, '👑 BERKAH SAHABAT KAFA! ENERGI & KEKUATAN PENUH! +15 🪙 +3 ⭐', '#F59E0B');
    triggerKafaPowerBanner('Kekuatan Mahkota Emas Penuh!', '👑', '#F59E0B');
  }, [level.worldWidth, level.groundY, onCollectCoin, onCollectStar, spawnDust, spawnFloatingScore, triggerKafaPowerBanner]);

  const triggerHitMysteryBlock = useCallback((blockId: string) => {
    const block = mysteryBlocksRef.current.find(b => b.id === blockId);
    if (!block || block.hit) return;

    mysteryBlocksRef.current = mysteryBlocksRef.current.map(b => b.id === blockId ? { ...b, hit: true } : b);
    setMysteryBlocks([...mysteryBlocksRef.current]);
    audio.playBlockBump();

    if (block.type === 'coin') {
      audio.playCoin();
      onCollectCoin(1);
      spawnFloatingScore(block.x, block.y - block.z - 20, '+1 🪙', '#FCD34D');
    } else {
      audio.playSahabatKafaPower();
      onCollectStar(1);
      onCollectCoin(5);
      setKafaBuffUntil(Date.now() + 5000);
      spawnFloatingScore(block.x, block.y - block.z - 20, '👑 SAHABAT KAFA POWER! +1 ⭐ +5 🪙', '#F59E0B');
      triggerKafaPowerBanner('Bintang Emas Sahabat Kafa!', '👑', '#F59E0B');
    }
  }, [onCollectCoin, onCollectStar, spawnFloatingScore, triggerKafaPowerBanner]);

  const triggerBouncer = useCallback((bnc: LevelBouncer) => {
    setBouncedMushroomId(bnc.id);
    audio.playSpringBounce();
    spawnFloatingScore(bnc.x, bnc.y - 40, 'BOING! 🍄', '#EF4444');
    setTimeout(() => setBouncedMushroomId(null), 350);
  }, [spawnFloatingScore]);

  const triggerFlagpole = useCallback(() => {
    flagpoleClearedRef.current = true;
    setFlagpoleCleared(true);
    audio.playStageClearFanfare();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    spawnFloatingScore(level.worldWidth - 360, level.groundY - 140, 'STAGE CLEAR! 🚩', '#10B981');
  }, [level.worldWidth, level.groundY, spawnFloatingScore]);

  // Cycle through available superpowers
  const cycleNextPower = useCallback(() => {
    const curIdx = ALL_HERO_POWER_IDS.indexOf(activePower);
    const nextIdx = (curIdx + 1) % ALL_HERO_POWER_IDS.length;
    const nextPow = ALL_HERO_POWER_IDS[nextIdx];
    if (onSelectPower) onSelectPower(nextPow);
    const conf = HERO_POWERS.find(p => p.id === nextPow);
    if (conf) {
      audio.playButtonClick();
      spawnFloatingScore(playerRef.current.x, playerRef.current.y - 70, `${conf.emoji} ${conf.name}!`, conf.color);
    }
  }, [activePower, onSelectPower, spawnFloatingScore]);

  // Ground Pound seismic slam
  const triggerGroundPound = useCallback(() => {
    const p = playerRef.current;
    if (!p.isGrounded && p.z > 10 && !isGroundPoundingRef.current) {
      isGroundPoundingRef.current = true;
      setIsGroundPounding(true);
      p.vz = -20;
      p.vx = 0;
      audio.playPowerUp();
      spawnFloatingScore(p.x, p.y - 50, '⚡ HENTAKAN BADAI!', '#38BDF8');
      setPlayer({ ...p });
    }
  }, [spawnFloatingScore]);

  // Trigger active superpower or a direct power override
  const triggerActivePower = useCallback((powerOverride?: HeroPowerType) => {
    const currentPow = powerOverride || activePower || 'star_blast';
    if (powerOverride && onSelectPower && powerOverride !== activePower) {
      onSelectPower(powerOverride);
    }
    const conf = HERO_POWERS.find(p => p.id === currentPow) || HERO_POWERS[0];
    const now = Date.now();
    if (now - lastJurusTimeRef.current < conf.cooldownMs) return;

    if (consumeEnergy && !consumeEnergy(conf.energyCost)) {
      spawnFloatingScore(playerRef.current.x, playerRef.current.y - 70, '⚡ Butuh Energi!', '#EF4444');
      return;
    }

    lastJurusTimeRef.current = now;
    const p = playerRef.current;
    const dir = p.facing === 'right' ? 1 : -1;

    // Trigger on-screen prominent "JURUS SAHABAT KAFA" activation banner
    triggerKafaPowerBanner(conf.name, conf.emoji || '👑', conf.color);

    if (currentPow === 'sahabat_kafa') {
      audio.playPowerUp();
      audio.playShootMagic();
      const proj: PlayerProjectile = {
        id: `proj_kafa_${now}_${Math.random()}`,
        x: p.x + dir * 40,
        y: p.y - 25 - p.z,
        z: p.z,
        vx: dir * 18,
        type: 'sahabat_kafa',
        createdAt: now,
      };
      playerProjectilesRef.current.push(proj);
      setPlayerProjectiles([...playerProjectilesRef.current]);

      // Golden expanding halo shockwave around robot
      setKafaShockwave({ id: `sw_kafa_${now}`, x: p.x, y: p.y - p.z });
      setTimeout(() => setKafaShockwave(null), 800);

      // Rainbow confetti & golden particles
      confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
      spawnDust(p.x, p.y - p.z, 2.0);
      spawnFloatingScore(p.x, p.y - 80, '👑 JURUS SAHABAT KAFA POWER! 🌟✨', '#F59E0B');
    } else if (currentPow === 'star_blast') {
      audio.playShootMagic();
      const proj: PlayerProjectile = {
        id: `proj_star_${now}_${Math.random()}`,
        x: p.x + dir * 36,
        y: p.y - 25 - p.z,
        z: p.z,
        vx: dir * 15.5,
        type: 'star_blast',
        createdAt: now,
      };
      playerProjectilesRef.current.push(proj);
      setPlayerProjectiles([...playerProjectilesRef.current]);
      spawnDust(p.x, p.y - p.z, 0.9);
      spawnFloatingScore(p.x, p.y - 70, '⚡ SAHABAT KAFA: TEMBAKAN BINTANG!', '#FBBF24');
    } else if (currentPow === 'tornado_spin') {
      audio.playTornadoSpin();
      isTornadoSpinningRef.current = true;
      setIsTornadoSpinning(true);
      p.vx = dir * 14;
      if (p.isGrounded) p.vz = 5;
      spawnFloatingScore(p.x, p.y - 70, '🌪️ SAHABAT KAFA: TOPAN BADAI!', '#38BDF8');
      setTimeout(() => {
        isTornadoSpinningRef.current = false;
        setIsTornadoSpinning(false);
      }, 700);
    } else if (currentPow === 'fire_dragon') {
      audio.playFireball();
      const proj: PlayerProjectile = {
        id: `proj_fire_${now}_${Math.random()}`,
        x: p.x + dir * 36,
        y: p.y - 25 - p.z,
        z: p.z,
        vx: dir * 12.5,
        type: 'fire_dragon',
        createdAt: now,
        radius: 70,
      };
      playerProjectilesRef.current.push(proj);
      setPlayerProjectiles([...playerProjectilesRef.current]);
      spawnDust(p.x, p.y - p.z, 1.3);
      spawnFloatingScore(p.x, p.y - 70, '🔥 SAHABAT KAFA: BOLA API NAGA!', '#F97316');
    } else if (currentPow === 'thunder_pound') {
      if (!p.isGrounded && p.z > 8) {
        triggerGroundPound();
      } else {
        audio.playThunderPound();
        setIsScreenShaking(true);
        setTimeout(() => setIsScreenShaking(false), 260);
        const swId = `${now}_${Math.random()}`;
        setGroundShockwaves(prev => [...prev.slice(-3), { id: swId, x: p.x, y: p.y }]);
        setTimeout(() => setGroundShockwaves(prev => prev.filter(sw => sw.id !== swId)), 600);
        let thunderHits = 0;
        enemiesRef.current.forEach(e => {
          if (!e.defeated && Math.abs(e.x - p.x) < 240 && Math.abs(e.y - p.y) < 70) {
            e.defeated = true;
            thunderHits++;
            spawnDust(e.x, e.y, 1.4);
            spawnFloatingScore(e.x, e.y - 45, '⚡ K.O.! +3 🪙', '#A855F7');
          }
        });
        if (thunderHits > 0) {
          onCollectCoin(thunderHits * 3);
          setEnemies([...enemiesRef.current]);
        }
        spawnFloatingScore(p.x, p.y - 70, '💥 SAHABAT KAFA: GEMPA PETIR! ⚡', '#A855F7');
      }
    } else if (currentPow === 'star_shield') {
      audio.playShieldActivate();
      shieldUntilRef.current = now + 12000;
      setIsShieldActive(true);
      setTimeout(() => {
        if (Date.now() >= shieldUntilRef.current) {
          setIsShieldActive(false);
        }
      }, 12100);
      spawnFloatingScore(p.x, p.y - 70, '🛡️ SAHABAT KAFA: PERISAI BINTANG!', '#10B981');
    } else if (currentPow === 'cosmic_nova') {
      audio.playSuperNova();
      setSuperNovaActive(true);
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);
      setTimeout(() => setSuperNovaActive(false), 1200);

      let novaHits = 0;
      enemiesRef.current.forEach(e => {
        if (!e.defeated && Math.abs(e.x - p.x) < 1000) {
          e.defeated = true;
          novaHits++;
          spawnDust(e.x, e.y, 1.5);
          spawnFloatingScore(e.x, e.y - 45, '✨ K.O. SAHABAT KAFA! +4 🪙', '#EC4899');
        }
      });
      if (novaHits > 0) {
        onCollectCoin(novaHits * 4);
        onCollectStar(1);
        setEnemies([...enemiesRef.current]);
      }
      spawnFloatingScore(p.x, p.y - 85, '✨ SAHABAT KAFA: SUPER NOVA KOSMIK! 🌟💥', '#EC4899');
    }
  }, [activePower, onSelectPower, consumeEnergy, spawnDust, spawnFloatingScore, onCollectCoin, onCollectStar, triggerGroundPound, triggerKafaPowerBanner]);

  const triggerWordBlast = triggerActivePower;

  // Reset player and collectibles when level changes
  useEffect(() => {
    const initialPlayer: PlayerPhysics = {
      x: level.playerStartX,
      y: level.playerStartY,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: 'right',
      state: 'idle',
      isGrounded: true,
    };
    playerRef.current = initialPlayer;
    setPlayer(initialPlayer);

    collectiblesRef.current = level.collectibles || [];
    setCollectibles(collectiblesRef.current);

    mysteryBlocksRef.current = level.mysteryBlocks || [];
    setMysteryBlocks(mysteryBlocksRef.current);

    enemiesRef.current = (level.enemies || []).map(e => ({ ...e, defeated: false, squashed: false }));
    setEnemies([...enemiesRef.current]);

    playerProjectilesRef.current = [];
    setPlayerProjectiles([]);
    enemyProjectilesRef.current = [];
    setEnemyProjectiles([]);
    isGroundPoundingRef.current = false;
    setIsGroundPounding(false);

    cameraXRef.current = 0;
    setCameraX(0);

    nearVocabRef.current = null;
    setNearVocab(null);
    nearNpcRef.current = false;
    setNearNpc(false);
    nearMiniGameGateRef.current = false;
    setNearMiniGameGate(false);

    flagpoleClearedRef.current = false;
    setFlagpoleCleared(false);
  }, [level.id, level.playerStartX, level.playerStartY, level.collectibles, level.mysteryBlocks, level.enemies]);

  // Determine which target word is next
  const nextTargetWordId = level.mission.targetWords.find(id => !discoveredWords.includes(id));
  const nextTargetItem = level.vocabItems.find(v => v.id === nextTargetWordId);
  const distanceToTarget = nextTargetItem ? Math.round(nextTargetItem.worldPosition.x - player.x) : 0;
  const targetDirection = nextTargetItem ? (distanceToTarget > 0 ? 'right' : 'left') : null;

  const handleItemInteract = useCallback((item: VocabItem) => {
    setBouncingItemId(item.id);
    audio.playBlockBump();
    spawnFloatingScore(item.worldPosition.x, item.worldPosition.y - 75, `✨ ${item.word}!`, '#F59E0B');
    setTimeout(() => setBouncingItemId(null), 450);
    onInteractVocab(item);
  }, [onInteractVocab, spawnFloatingScore]);

  const triggerInteraction = useCallback(() => {
    if (isNearShrineRef.current) {
      triggerShrineBlessing();
    } else if (nearBlackboardRef.current) {
      audio.playButtonClick();
      setShowClassroomBlackboardModal(true);
    } else if (nearDoorPortalRef.current && onEnterRoom) {
      audio.playDoorOpen();
      onEnterRoom(nearDoorPortalRef.current.roomId);
    } else if (nearKnowledgePostRef.current) {
      audio.playButtonClick();
      setActiveKnowledgePost(nearKnowledgePostRef.current);
    } else if (nearVocabRef.current) {
      handleItemInteract(nearVocabRef.current);
    } else if (nearNpcRef.current) {
      onInteractNpc();
    } else if (nearMiniGameGateRef.current) {
      onOpenMiniGames();
    }
  }, [handleItemInteract, onInteractNpc, onOpenMiniGames, onEnterRoom, triggerShrineBlessing]);

  const triggerJump = useCallback(() => {
    if (playerRef.current.isGrounded) {
      audio.playJump();
      playerRef.current.vz = JUMP_FORCE;
      playerRef.current.isGrounded = false;
      playerRef.current.state = 'jumping';
      canDoubleJumpRef.current = true;
      setPlayer({ ...playerRef.current });
    } else if (canDoubleJumpRef.current && playerRef.current.z > 8) {
      // Acrobatic Double Jump & 360 Flip!
      canDoubleJumpRef.current = false;
      audio.playPowerUp();
      playerRef.current.vz = JUMP_FORCE * 0.95;
      setIsAcrobaticFlipping(true);
      setTimeout(() => setIsAcrobaticFlipping(false), 450);
      spawnDust(playerRef.current.x, playerRef.current.y, 1.8);
      spawnFloatingScore(playerRef.current.x, playerRef.current.y - 70, '✨ DOUBLE JUMP! 🦘', '#38BDF8');
      setPlayer({ ...playerRef.current });
    }
  }, [spawnDust, spawnFloatingScore]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
      }
      keys.current[e.key.toLowerCase()] = true;
      keys.current[e.code] = true;

      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        triggerInteraction();
      }
      if (e.code === 'Space') {
        triggerJump();
      }
      // Direct Superpowers Hotkeys 1-6
      // Direct Superpowers Hotkeys 1-7 (Sahabat Kafa Flagship)
      if (e.key === '1') triggerActivePower('sahabat_kafa');
      if (e.key === '2') triggerActivePower('star_blast');
      if (e.key === '3') triggerActivePower('tornado_spin');
      if (e.key === '4') triggerActivePower('fire_dragon');
      if (e.key === '5') triggerActivePower('thunder_pound');
      if (e.key === '6') triggerActivePower('star_shield');
      if (e.key === '7') triggerActivePower('cosmic_nova');

      // Superpower Letter Shortcuts
      if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'j') {
        triggerActivePower();
      }
      if (e.key.toLowerCase() === 'x') {
        triggerActivePower('sahabat_kafa');
      }
      if (e.key.toLowerCase() === 'k') {
        triggerActivePower('tornado_spin');
      }
      if (e.key.toLowerCase() === 'l') {
        triggerActivePower('fire_dragon');
      }
      if (e.key.toLowerCase() === 'q') {
        triggerActivePower('star_shield');
      }
      if (e.key.toLowerCase() === 'r') {
        triggerActivePower('cosmic_nova');
      }
      if (e.key.toLowerCase() === 'c' || e.key === 'Tab') {
        e.preventDefault();
        cycleNextPower();
      }
      if (e.key.toLowerCase() === 's' || e.key === 'ArrowDown') {
        if (!playerRef.current.isGrounded) {
          triggerGroundPound();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerInteraction, triggerJump, triggerActivePower, triggerGroundPound, cycleNextPower]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.6, 2.0);
      lastTime = time;

      const prev = playerRef.current;
      let vx = 0;
      let vy = 0;
      let facing = prev.facing;

      const isShiftSprint = !!(keys.current['shift'] || keys.current['shiftleft'] || keys.current['shiftright'] || keys.current['z'] || mobileSprintRef.current);
      const hasSpeedPadBoost = speedBoostUntilRef.current > time;
      const isSprintMode = isShiftSprint || hasSpeedPadBoost;
      if (isSprintMode !== isSprintingRef.current) {
        isSprintingRef.current = isSprintMode;
        setIsSprinting(isSprintMode);
      }
      const speedMultiplier = hasSpeedPadBoost ? 2.1 : isSprintMode ? 1.65 : 1.0;
      const effectiveSpeed = SPEED * speedMultiplier;

      const moveLeft = keys.current['a'] || keys.current['arrowleft'] || joystickVector.current.x < -0.25 || mobileLeftRef.current;
      const moveRight = keys.current['d'] || keys.current['arrowright'] || joystickVector.current.x > 0.25 || mobileRightRef.current;
      const moveUp = keys.current['w'] || keys.current['arrowup'] || joystickVector.current.y < -0.25 || mobileUpRef.current;
      const moveDown = keys.current['s'] || keys.current['arrowdown'] || joystickVector.current.y > 0.25 || mobileDownRef.current;

      let targetVx = 0;
      let targetVy = 0;

      if (moveLeft) {
        targetVx = -effectiveSpeed;
        facing = 'left';
      } else if (moveRight) {
        targetVx = effectiveSpeed;
        facing = 'right';
      }

      if (moveUp) {
        targetVy = -effectiveSpeed * 0.65;
      } else if (moveDown) {
        targetVy = effectiveSpeed * 0.65;
      }

      if (isJoystickActiveRef.current && (Math.abs(joystickVector.current.x) > 0.15 || Math.abs(joystickVector.current.y) > 0.15)) {
        targetVx = joystickVector.current.x * effectiveSpeed;
        targetVy = joystickVector.current.y * (effectiveSpeed * 0.65);
        if (Math.abs(joystickVector.current.x) > 0.15) {
          facing = joystickVector.current.x < 0 ? 'left' : 'right';
        }
      }

      // High-performance smooth velocity interpolation (accelerates & decelerates smoothly)
      vx = prev.vx + (targetVx - prev.vx) * 0.45;
      vy = prev.vy + (targetVy - prev.vy) * 0.45;
      if (Math.abs(vx) < 0.05 && targetVx === 0) vx = 0;
      if (Math.abs(vy) < 0.05 && targetVy === 0) vy = 0;

      let z = prev.z + prev.vz * dt;
      let vz = prev.vz - GRAVITY * dt;
      let isGrounded = false;

      let newX = prev.x + vx * dt;
      let newY = prev.y + vy * dt;

      // Platform Landing Collision: check landing on elevated platforms
      const platforms = level.platforms || [];
      let onPlatformZ = 0;
      for (const plat of platforms) {
        if (newX >= plat.x - 20 && newX <= plat.x + plat.w + 20) {
          if (prev.vz <= 0 && prev.z >= plat.z - 8 && z <= plat.z + 14) {
            onPlatformZ = plat.z;
            break;
          }
        }
      }

      // Check physical obstacle collision (crates & rocks can be hopped on or block movement)
      const obstacles = level.obstacles || [];
      let onObstacleZ = 0;
      for (const obs of obstacles) {
        if (obs.type === 'crate' || obs.type === 'rock') {
          const halfW = obs.w / 2;
          const halfH = 26;
          const isNearX = newX >= obs.x - halfW && newX <= obs.x + halfW;
          const isNearY = Math.abs(newY - obs.y) < halfH;

          if (isNearX && isNearY) {
            if (prev.vz <= 0 && prev.z >= obs.h - 12 && z <= obs.h + 14) {
              onObstacleZ = obs.h;
              break;
            } else if (z < obs.h - 10) {
              if (prev.x < obs.x) {
                newX = Math.min(newX, obs.x - halfW - 1);
              } else {
                newX = Math.max(newX, obs.x + halfW + 1);
              }
              // Soft corner slip so robot doesn't get snagged
              if (Math.abs(newY - obs.y) > 14 && targetVy !== 0) {
                newY += newY < obs.y ? -0.6 : 0.6;
              }
            }
          }
        } else if (obs.type === 'fence') {
          const halfW = obs.w / 2;
          if (newX >= obs.x - halfW && newX <= obs.x + halfW && Math.abs(newY - obs.y) < 22) {
            if (z < 26) {
              if (prev.x < obs.x) {
                newX = Math.min(newX, obs.x - halfW - 1);
              } else {
                newX = Math.max(newX, obs.x + halfW + 1);
              }
            }
          }
        } else if (obs.type === 'puddle') {
          if (Math.abs(newX - obs.x) < obs.w / 2 && Math.abs(newY - obs.y) < 18 && z <= 5) {
            if (Math.abs(vx) > 1.5 && Math.random() < 0.15) {
              spawnDust(newX, newY, 0.7);
            }
          }
        }
      }

      let landedThisFrame = false;
      const elevatedZ = Math.max(onPlatformZ, onObstacleZ);
      if (elevatedZ > 0) {
        if (!prev.isGrounded && prev.vz < -2) landedThisFrame = true;
        z = elevatedZ;
        vz = 0;
        isGrounded = true;
      } else if (z <= 0) {
        if (!prev.isGrounded && prev.vz < -2) landedThisFrame = true;
        z = 0;
        vz = 0;
        isGrounded = true;
      }

      // Check mystery block bumps
      let hitBlockId: string | null = null;
      if (prev.vz > 0) {
        for (const block of mysteryBlocksRef.current) {
          if (!block.hit && Math.abs(newX - block.x) < 38) {
            if (z >= block.z - 35 && prev.z < block.z - 5) {
              z = block.z - 35;
              vz = -4; // bounce head back down!
              hitBlockId = block.id;
              break;
            }
          }
        }
      }

      // Check bouncy mushroom trampoline
      let bouncedItem: LevelBouncer | null = null;
      const bouncers = level.bouncers || [];
      for (const bnc of bouncers) {
        if (Math.abs(newX - bnc.x) < 42 && Math.abs(newY - bnc.y) < 35 && z <= 18 && vz <= 0) {
          vz = bnc.power;
          z = 20;
          isGrounded = false;
          bouncedItem = bnc;
          break;
        }
      }

      // Check Speed Boost Pads (Pelontar Kecepatan Turbo)
      const speedPads = level.speedPads || [];
      for (const sp of speedPads) {
        if (Math.abs(newX - sp.x) < 55 && Math.abs(newY - sp.y) < 32 && z <= 18) {
          if (speedBoostUntilRef.current < time + 1400) {
            speedBoostUntilRef.current = time + 2600;
            audio.playCoin();
            spawnDust(newX, newY, 2.0);
            spawnFloatingScore(newX, newY - 50, '💨 TURBO SPEED BOOST! ⚡', '#38BDF8');
          }
        }
      }

      // Check Zone Milestones Checkpoint Flags
      if (level.zones) {
        for (const zone of level.zones) {
          if (newX >= zone.startX && !visitedZonesRef.current.has(zone.id)) {
            visitedZonesRef.current.add(zone.id);
            setActiveZoneBanner({ nameId: zone.nameId, icon: zone.icon });
            audio.playLevelUp();
            setTimeout(() => setActiveZoneBanner(null), 2000);
          }
        }
      }

      // Check victory flagpole
      let clearedFlagpole = false;
      if (level.hasFlagpole && !flagpoleClearedRef.current) {
        const flagX = level.worldWidth - 360;
        if (Math.abs(newX - flagX) < 45) {
          clearedFlagpole = true;
        }
      }

      // Interactive Enemies: Patrol simulation, active attacks, and collision check
      const now = Date.now();
      let enemyStompedThisFrame: LevelEnemy | null = null;
      let playerHurtThisFrame: LevelEnemy | null = null;
      let enemiesChanged = false;

      const currentEnemies = enemiesRef.current;
      for (let i = 0; i < currentEnemies.length; i++) {
        const enemy = currentEnemies[i];
        if (enemy.defeated || enemy.squashed) continue;

        const distToPlayer = Math.sqrt((newX - enemy.x) ** 2 + (newY - enemy.y) ** 2);

        // Active Monster Attacks:
        if (enemy.type === 'piranha' && distToPlayer < 480) {
          // Piranha Plant shoots fireballs towards player every 2.4s
          const lastShot = enemy.lastShootTime || 0;
          if (now - lastShot > 2400) {
            enemy.lastShootTime = now;
            const shootDir = newX > enemy.x ? 1 : -1;
            enemyProjectilesRef.current.push({
              id: `efire_${now}_${Math.random()}`,
              enemyId: enemy.id,
              x: enemy.x + shootDir * 20,
              y: enemy.y - 25,
              vx: shootDir * 5.8,
              type: 'fireball',
              createdAt: now,
            });
            audio.playEnemyShoot();
          }
        } else if (enemy.type === 'bee' && distToPlayer < 400) {
          // Bee shoots stinger darts towards player every 2.8s
          const lastShot = enemy.lastShootTime || 0;
          if (now - lastShot > 2800) {
            enemy.lastShootTime = now;
            const shootDir = newX > enemy.x ? 1 : -1;
            enemyProjectilesRef.current.push({
              id: `estng_${now}_${Math.random()}`,
              enemyId: enemy.id,
              x: enemy.x + shootDir * 18,
              y: enemy.y - 12,
              vx: shootDir * 6.8,
              type: 'stinger',
              createdAt: now,
            });
            audio.playEnemyShoot();
          }
        } else if (enemy.type === 'goomba' && distToPlayer < 240) {
          // Goomba aggressively turns and charges towards player
          enemy.direction = newX > enemy.x ? 'right' : 'left';
          enemy.speed = 2.6;
          enemiesChanged = true;
        } else if (enemy.type === 'spiky' && distToPlayer < 260) {
          // Spiky charges aggressively
          enemy.direction = newX > enemy.x ? 'right' : 'left';
          enemy.speed = 3.0;
          enemiesChanged = true;
        }

        // Move back and forth
        if (enemy.speed > 0) {
          let nextX = enemy.x + (enemy.direction === 'right' ? enemy.speed : -enemy.speed);
          let nextDir = enemy.direction;
          if (nextX >= enemy.maxX) {
            nextX = enemy.maxX;
            nextDir = 'left';
          } else if (nextX <= enemy.minX) {
            nextX = enemy.minX;
            nextDir = 'right';
          }
          if (nextX !== enemy.x || nextDir !== enemy.direction) {
            enemy.x = nextX;
            enemy.direction = nextDir;
          }
        }

        // Collision with player
        const eDx = Math.abs(newX - enemy.x);
        const eDy = Math.abs(newY - enemy.y);

        if (eDx < 38 && eDy < 30) {
          // Mario Stomp Check:
          const isFallingOnTop = (vz <= 0 || prev.vz <= 0) && z >= 16;
          const canBeStomped = enemy.type === 'goomba' || enemy.type === 'bee';

          if (isFallingOnTop && canBeStomped) {
            enemy.squashed = true;
            enemiesChanged = true;
            vz = 14.5; // High Super Mario bounce!
            isGrounded = false;
            enemyStompedThisFrame = enemy;
            if (onTriggerTrophy) {
              onTriggerTrophy({
                id: 'defeat_monster_stomp',
                tier: 'bronze',
                title: 'Lompatan Ksatria!',
                description: 'Menginjak monster musuh ala Super Mario!',
                icon: '🥉',
              });
            }
            break;
          } else if (isShieldActive || isTornadoSpinningRef.current) {
            // Star Shield or Tornado Spin annihilates the monster on contact!
            enemy.defeated = true;
            enemiesChanged = true;
            audio.playStompEnemy();
            onCollectCoin(3);
            spawnDust(enemy.x, enemy.y, 1.4);
            spawnFloatingScore(enemy.x, enemy.y - 45, isShieldActive ? '🛡️ PERISAI K.O.! +3 🪙' : '🌪️ TOPAN K.O.! +3 🪙', '#10B981');
            if (onTriggerTrophy) {
              onTriggerTrophy({
                id: 'defeat_monster_superpower',
                tier: 'bronze',
                title: 'Kekuatan Tak Terhentikan!',
                description: 'Menghancurkan monster dengan kekuatan super!',
                icon: '🛡️',
              });
            }
            break;
          } else if (now > invulnerableUntilRef.current) {
            // Hero is immortal (no HP loss / no lives count!). Repels enemy with protective aura!
            playerHurtThisFrame = enemy;
            const knockDir = newX >= enemy.x ? 1 : -1;
            vx = knockDir * 8.5;
            vz = 9;
            isGrounded = false;
            break;
          }
        }
      }

      // Player Projectiles (Jurus Bintang) Simulation
      const activePlayerProj = playerProjectilesRef.current;
      let playerProjChanged = false;
      const remainingPlayerProj: PlayerProjectile[] = [];

      for (let pIdx = 0; pIdx < activePlayerProj.length; pIdx++) {
        const proj = activePlayerProj[pIdx];
        proj.x += proj.vx * dt;
        let projHit = false;

        // Expire or out of level
        if (now - proj.createdAt > 2200 || proj.x < 0 || proj.x > level.worldWidth) {
          playerProjChanged = true;
          continue;
        }

        // Check hit against undefeated enemies
        for (let eIdx = 0; eIdx < currentEnemies.length; eIdx++) {
          const enemy = currentEnemies[eIdx];
          if (enemy.defeated || enemy.squashed) continue;

          if (Math.abs(proj.x - enemy.x) < 40 && Math.abs(proj.y - enemy.y) < 40) {
            enemy.defeated = true;
            enemiesChanged = true;
            projHit = true;
            audio.playStompEnemy();
            if (proj.type === 'sahabat_kafa') {
              audio.playCoin();
              onCollectCoin(5);
              onCollectStar(1);
              spawnFloatingScore(enemy.x, enemy.y - 45, '👑 K.O. SAHABAT KAFA POWER! +5 🪙 ⭐', '#F59E0B');
              if (onTriggerTrophy) {
                onTriggerTrophy({
                  id: 'defeat_monster_kafa',
                  tier: 'gold',
                  title: 'Kekuatan Sejati Sahabat Kafa!',
                  description: 'Mengalahkan monster dengan Jurus Sahabat Kafa Power!',
                  icon: '👑',
                });
              }
            } else {
              onCollectCoin(3);
              spawnFloatingScore(enemy.x, enemy.y - 45, '+150 💥 K.O.! +3 🪙', '#F59E0B');
              if (onTriggerTrophy) {
                onTriggerTrophy({
                  id: 'defeat_monster_jurus',
                  tier: 'bronze',
                  title: 'Jurus Bintang Spektakuler!',
                  description: 'Mengalahkan monster dengan tembakan bintang!',
                  icon: '⚡',
                });
              }
            }
            break;
          }
        }

        if (!projHit) {
          remainingPlayerProj.push(proj);
        } else {
          playerProjChanged = true;
        }
      }

      if (playerProjChanged) {
        playerProjectilesRef.current = remainingPlayerProj;
        setPlayerProjectiles([...remainingPlayerProj]);
      }

      // Enemy Projectiles Simulation
      const activeEnemyProj = enemyProjectilesRef.current;
      let enemyProjChanged = false;
      const remainingEnemyProj: EnemyProjectile[] = [];

      for (let epIdx = 0; epIdx < activeEnemyProj.length; epIdx++) {
        const proj = activeEnemyProj[epIdx];
        proj.x += proj.vx * dt;
        let projHit = false;

        if (now - proj.createdAt > 3000 || proj.x < 0 || proj.x > level.worldWidth) {
          enemyProjChanged = true;
          continue;
        }

        // Check collision with player
        if (Math.abs(proj.x - newX) < 32 && Math.abs(proj.y - newY) < 35 && z < 25) {
          projHit = true;
          if (isShieldActive) {
            audio.playShieldActivate();
            spawnFloatingScore(newX, newY - 45, '🛡️ PERISAI MENANGKIS!', '#10B981');
          } else if (now > invulnerableUntilRef.current) {
            playerHurtThisFrame = currentEnemies[0] || ({ type: 'goomba', x: proj.x, y: proj.y } as any);
            const knockDir = proj.vx > 0 ? 1 : -1;
            vx = knockDir * 8;
            vz = 8.5;
            isGrounded = false;
          }
        }

        if (!projHit) {
          remainingEnemyProj.push(proj);
        } else {
          enemyProjChanged = true;
        }
      }

      if (enemyProjChanged) {
        enemyProjectilesRef.current = remainingEnemyProj;
        setEnemyProjectiles([...remainingEnemyProj]);
      }

      if (enemiesChanged || now - lastEnemyUpdate.current > 45) {
        lastEnemyUpdate.current = now;
        setEnemies([...currentEnemies]);
      }

      // Clamp boundaries within level limits
      newX = Math.max(60, Math.min(level.worldWidth - 60, newX));
      const groundMin = level.groundY - 45;
      const groundMax = level.groundY + 45;
      newY = Math.max(groundMin, Math.min(groundMax, newY));

      let state: PlayerPhysics['state'] = prev.state;
      let shouldSpawnRunDust = false;
      if (!isGrounded) {
        state = 'jumping';
      } else {
        canDoubleJumpRef.current = true;
        if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
          const isFast = Math.abs(vx) > SPEED * 0.75;
          state = isFast ? 'running' : 'walking';
          const now = Date.now();
          if (now - lastFootstepRef.current > (isFast ? 220 : 330)) {
            lastFootstepRef.current = now;
            audio.playFootstep();
            if (isFast) shouldSpawnRunDust = true;
          }
        } else {
          state = 'idle';
        }
      }

      // Check Collectibles with Magnetic Attraction & Combo
      let sumCoins = 0;
      let sumStars = 0;
      let collectiblesChanged = false;
      collectiblesRef.current = collectiblesRef.current.map(c => {
        if (!c.collected) {
          const cDx = newX - c.x;
          const cDy = newY - c.y;
          const cDist = Math.sqrt(cDx * cDx + cDy * cDy);
          const canReach = c.type === 'star' ? Math.abs(z - (level.groundY - c.y)) < 60 : z < 40;

          // Magnetic Attraction: smoothly pull items toward hero within 130px
          let cx = c.x;
          let cy = c.y;
          if (cDist < 130 && cDist > 15) {
            cx += (newX - c.x) * 0.16;
            cy += (newY - c.y) * 0.16;
            collectiblesChanged = true;
          }

          if (cDist < 52 && canReach) {
            collectiblesChanged = true;
            if (c.type === 'coin') {
              sumCoins += c.value;
              registerComboAction('COIN');
            } else {
              sumStars += c.value;
              registerComboAction('STAR');
            }
            return { ...c, x: cx, y: cy, collected: true };
          }
          if (cx !== c.x || cy !== c.y) {
            return { ...c, x: cx, y: cy };
          }
        }
        return c;
      });

      // Checkpoint Campfire proximity check
      const cpDist = Math.abs(newX - checkpointX);
      if (cpDist < 65 && !isCheckpointReachedRef.current) {
        isCheckpointReachedRef.current = true;
        setIsCheckpointReached(true);
        audio.playPowerUp();
        confetti({ particleCount: 75, spread: 85, origin: { x: 0.5, y: 0.5 } });
        onHealHeart?.(3);
        spawnFloatingScore(checkpointX, level.groundY - 80, '🏕️ CHECKPOINT TERSIMPAN! +DARAH PENUH ❤️', '#10B981');
      }

      // Proximity Checks
      let closestDoorPortal: DoorPortal | null = null;
      let minPortalDist = Infinity;
      for (const portal of (level.doorPortals || [])) {
        const dx = newX - portal.x;
        const dy = newY - portal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 85 && dist < minPortalDist) {
          minPortalDist = dist;
          closestDoorPortal = portal;
        }
      }

      let closestVocab: VocabItem | null = null;
      let minVocabDist = Infinity;
      for (const item of level.vocabItems) {
        const dx = newX - item.worldPosition.x;
        const dy = newY - item.worldPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist < minVocabDist) {
          minVocabDist = dist;
          closestVocab = item;
        }
      }

      const npcDx = newX - level.npc.x;
      const npcDy = newY - level.npc.y;
      const isNearNpcNow = Math.sqrt(npcDx * npcDx + npcDy * npcDy) < 110;

      const mgX = level.worldWidth - 220;
      const mgY = level.groundY - 10;
      const mgDx = newX - mgX;
      const mgDy = newY - mgY;
      const isNearMiniGameNow = Math.sqrt(mgDx * mgDx + mgDy * mgDy) < 125;

      // Knowledge Posts Proximity Check
      const levelKnowledgePosts = ADVENTURE_KNOWLEDGE_POSTS.filter(p => p.levelId === level.id);
      let closestPost: AdventureKnowledgePost | null = null;
      let minPostDist = Infinity;
      for (const kp of levelKnowledgePosts) {
        const dx = newX - kp.x;
        const dy = newY - kp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist < minPostDist) {
          minPostDist = dist;
          closestPost = kp;
        }
      }
      if (closestPost !== nearKnowledgePostRef.current) {
        nearKnowledgePostRef.current = closestPost;
        setNearKnowledgePost(closestPost);
      }

      // Smooth Camera Tracking (Scales with viewport)
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const visibleLogicalWidth = containerWidth / worldScale;
        const targetCamX = Math.max(0, Math.min(level.worldWidth - visibleLogicalWidth, newX - visibleLogicalWidth / 2));
        const prevCam = cameraXRef.current;
        const nextCam = prevCam + (targetCamX - prevCam) * 0.16;
        cameraXRef.current = nextCam;

        // DIRECT GPU COMPOSITED WORLD TRANSFORM (Butter smooth 60/120fps with zero React diffing!)
        if (worldContainerRef.current) {
          worldContainerRef.current.style.transform = `scale(${worldScale}) translate3d(-${nextCam}px, -${cameraY}px, 0)`;
        }

        // Throttle React setCameraX to ~10Hz (every 100ms) for progress bar and distance meter
        if (now - lastCameraXUpdate.current > 100 || Math.abs(nextCam - targetCamX) < 0.1) {
          lastCameraXUpdate.current = now;
          if (Math.abs(nextCam - prevCam) > 0.05) {
            setCameraX(nextCam);
          }
        }
      }

      // DIRECT GPU COMPOSITED PLAYER TRANSFORM
      if (playerContainerRef.current) {
        const tilt = vx < -0.8 ? -5 : vx > 0.8 ? 5 : 0;
        const squashX = z > 8 ? 0.94 : isGroundPoundingRef.current ? 1.15 : 1;
        const squashY = z > 8 ? 1.06 : isGroundPoundingRef.current ? 0.84 : 1;
        playerContainerRef.current.style.transform = `translate3d(${newX - 50}px, ${newY - 95 - z}px, 0) rotate(${tilt}deg) scale(${squashX}, ${squashY})`;
        playerContainerRef.current.style.zIndex = String(Math.floor(newY) + 10);
      }

      // Update player state (Only trigger React re-render when state, facing, or grounded status changes!)
      const stateChanged = state !== prev.state || facing !== prev.facing || isGrounded !== prev.isGrounded;
      const updatedPlayer: PlayerPhysics = {
        x: newX,
        y: newY,
        z,
        vx,
        vy,
        vz,
        facing,
        state,
        isGrounded,
      };
      playerRef.current = updatedPlayer;
      if (stateChanged) {
        setPlayer(updatedPlayer);
      }

      // Perform all side-effects safely OUTSIDE of the reducer
      if (landedThisFrame) {
        spawnDust(newX - 16, newY, 1.2);
        spawnDust(newX + 16, newY, 1.2);

        if (isGroundPoundingRef.current) {
          isGroundPoundingRef.current = false;
          setIsGroundPounding(false);
          setIsScreenShaking(true);
          audio.playThunderPound();
          setTimeout(() => setIsScreenShaking(false), 450);

          const groundSwId = `${now}_${Math.random()}`;
          setGroundShockwaves(prev => [...prev.slice(-3), { id: groundSwId, x: newX, y: newY }]);
          setTimeout(() => {
            setGroundShockwaves(prev => prev.filter(s => s.id !== groundSwId));
          }, 600);

          spawnFloatingScore(newX, newY - 60, '⚡ THUNDER SLAM! 💥', '#38BDF8');

          let shockwaveEnemiesChanged = false;
          for (let eIdx = 0; eIdx < currentEnemies.length; eIdx++) {
            const enemy = currentEnemies[eIdx];
            if (enemy.defeated || enemy.squashed) continue;
            if (Math.abs(enemy.x - newX) < 140 && Math.abs(enemy.y - newY) < 60) {
              enemy.defeated = true;
              shockwaveEnemiesChanged = true;
              onCollectCoin(3);
              spawnDust(enemy.x, enemy.y, 1.4);
              spawnFloatingScore(enemy.x, enemy.y - 45, '⚡ SHOCKWAVE K.O.! +3 🪙', '#38BDF8');
            }
          }
          if (shockwaveEnemiesChanged) {
            setEnemies([...currentEnemies]);
          }
        }
      }
      if (shouldSpawnRunDust) {
        spawnDust(newX - (facing === 'right' ? 22 : -22), newY + 2, 0.8);
      }
      if (hitBlockId) {
        triggerHitMysteryBlock(hitBlockId);
      }
      if (bouncedItem) {
        triggerBouncer(bouncedItem);
      }
      if (clearedFlagpole) {
        triggerFlagpole();
      }
      if (enemyStompedThisFrame) {
        const stomped = enemyStompedThisFrame;
        audio.playStompEnemy();
        onCollectCoin(2);
        spawnFloatingScore(stomped.x, stomped.y - 45, '+100 💥 +2 🪙', '#FBBF24');
        spawnDust(stomped.x, stomped.y, 1.4);
        setTimeout(() => {
          enemiesRef.current = enemiesRef.current.map(e => e.id === stomped.id ? { ...e, defeated: true } : e);
          setEnemies([...enemiesRef.current]);
        }, 550);
      }
      if (playerHurtThisFrame) {
        invulnerableUntilRef.current = now + 1800;
        setIsInvulnerable(true);
        setShowHurtFlash(true);
        setIsScreenShaking(true);
        setTimeout(() => setShowHurtFlash(false), 240);
        setTimeout(() => setIsScreenShaking(false), 300);
        setTimeout(() => setIsInvulnerable(false), 1800);

        audio.playShieldActivate();
        spawnFloatingScore(newX, newY - 60, '🛡️ KEBAL! PAHLAWAN ABADI! ⚡', '#38BDF8');
      }
      if (collectiblesChanged) {
        setCollectibles([...collectiblesRef.current]);
        if (sumCoins > 0) onCollectCoin(sumCoins);
        if (sumStars > 0) onCollectStar(sumStars);
      }
      if (closestDoorPortal?.id !== nearDoorPortalRef.current?.id) {
        nearDoorPortalRef.current = closestDoorPortal;
        setNearDoorPortal(closestDoorPortal);
      }
      if (closestVocab?.id !== nearVocabRef.current?.id) {
        nearVocabRef.current = closestVocab;
        setNearVocab(closestVocab);
      }
      if (isNearNpcNow !== nearNpcRef.current) {
        nearNpcRef.current = isNearNpcNow;
        setNearNpc(isNearNpcNow);
      }
      if (isNearMiniGameNow !== nearMiniGameGateRef.current) {
        nearMiniGameGateRef.current = isNearMiniGameNow;
        setNearMiniGameGate(isNearMiniGameNow);
      }

      const shrineX = Math.round(level.worldWidth * 0.45);
      const isNearShrineNow = Math.abs(newX - shrineX) < 85 && Math.abs(newY - (level.groundY - 15)) < 70;
      if (isNearShrineNow !== isNearShrineRef.current) {
        isNearShrineRef.current = isNearShrineNow;
        setIsNearShrine(isNearShrineNow);
      }

      const isNearBlackboardNow = level.areaId === 'area_school' && Math.abs(newX - 520) < 95 && Math.abs(newY - level.groundY) < 80;
      if (isNearBlackboardNow !== nearBlackboardRef.current) {
        nearBlackboardRef.current = isNearBlackboardNow;
        setNearBlackboard(isNearBlackboardNow);
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [level, spawnDust, triggerHitMysteryBlock, triggerBouncer, triggerFlagpole, onCollectCoin, onCollectStar, onTakeDamage]);

  // Touch Virtual Joystick with Center Anchoring & Pointer Capture
  const updateJoystickPosition = (clientX: number, clientY: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = Math.max(32, rect.width / 2 - 16);

    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const thumbX = Math.cos(angle) * clampedDist;
      const thumbY = Math.sin(angle) * clampedDist;
      setJoystickThumbPos({ x: thumbX, y: thumbY });
      joystickVector.current = {
        x: thumbX / maxRadius,
        y: thumbY / maxRadius,
      };
    } else {
      setJoystickThumbPos({ x: 0, y: 0 });
      joystickVector.current = { x: 0, y: 0 };
    }
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    isJoystickActiveRef.current = true;
    setIsJoystickActive(true);
    updateJoystickPosition(e.clientX, e.clientY, e.currentTarget);
    if ('vibrate' in navigator) navigator.vibrate?.(10);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isJoystickActiveRef.current) return;
    updateJoystickPosition(e.clientX, e.clientY, e.currentTarget);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    isJoystickActiveRef.current = false;
    setIsJoystickActive(false);
    setJoystickThumbPos({ x: 0, y: 0 });
    joystickVector.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none bg-slate-950 ${
        isScreenShaking ? 'translate-x-1.5 -translate-y-1' : ''
      }`}
      style={{ height: '100dvh' }}
    >
      {/* RED HURT FLASH VIGNETTE ON DAMAGE */}
      {showHurtFlash && (
        <div className="absolute inset-0 z-[950] pointer-events-none bg-rose-600/30 border-8 border-rose-500/80 shadow-[inset_0_0_80px_rgba(239,68,68,0.7)] animate-pulse" />
      )}

      {/* 2.5D Camera Tracked World Viewport (Naturally Fills Screen Height) */}
      <div
        ref={worldContainerRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: `${level.worldWidth}px`,
          height: `${worldContentHeight}px`,
          transform: `scale(${worldScale}) translate3d(-${cameraX}px, -${cameraY}px, 0)`,
          transformOrigin: 'top left',
        }}
      >
        {/* LAYER 1: SEAMLESS THEMATIC PANORAMA (VIBRANT, CLEAN & IMMERSIVE) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950">
          {/* Gentle background color backing */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/70 to-slate-950 pointer-events-none" />

          {/* Background Art with High Crisp Legibility and Continuous Architectural Corridor */}
          {level.areaId === 'area_school' ? (
            <div className="absolute inset-0 will-change-transform">
              {/* Primary Teacher Blackboard Classroom Area (Zone 1: x: 0 to 1800px) */}
              <div
                className="absolute top-0 left-0 h-full will-change-transform z-10"
                style={{
                  width: '1850px',
                  backgroundImage: `url(${level.bgImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'left top',
                  maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 85%, transparent 100%)',
                  opacity: graphicSettings?.cleanBackgroundMode ? 0.7 : 0.88,
                }}
              />

              {/* Clickable Classroom Blackboard Area (Opens Quiz, Solar System & Literature) */}
              <div
                className="absolute cursor-pointer pointer-events-auto z-20 group"
                style={{
                  left: '300px',
                  top: '160px',
                  width: '560px',
                  height: '320px',
                }}
                onClick={() => {
                  audio.playButtonClick();
                  setBlackboardInitialTab('QUIZ');
                  setShowClassroomBlackboardModal(true);
                }}
                title="Papan Tulis Kelas Sahabat Kafa: Klik untuk Kuis, Tata Surya & Literasi"
              />

              {/* Base Classroom Wall & Wainscoting for the Extended Corridor (Zone 2 onwards: from x: 1700px) */}
              <div className="absolute left-[1700px] right-0 top-0 bottom-0 bg-[#0f1d19]">
                {/* Upper wall: Calming Sage Green Classroom Wall */}
                <div className="absolute inset-x-0 top-0 h-[490px] bg-gradient-to-b from-[#18362b] via-[#1d4335] to-[#163529]" />

                {/* Upper Crown Moulding & Picture Rail */}
                <div className="absolute inset-x-0 top-[60px] h-3 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 border-y border-amber-500/50 shadow-sm" />

                {/* Lower Wainscoting: Warm Oak & Cherry Wood Panels aligned with ground */}
                <div className="absolute inset-x-0 top-[490px] bottom-0 bg-gradient-to-b from-[#451a03] via-[#78350f] to-[#291003] border-t-4 border-amber-500/80 shadow-2xl">
                  {/* Wainscoting vertical fluted wood battens every 60px */}
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#000,#000_3px,transparent_3px,transparent_60px)]" />
                  {/* Chair rail shadow */}
                  <div className="absolute inset-x-0 top-0 h-3 bg-black/40" />
                </div>
              </div>

                {/* CONTINUOUS THEMATIC CLASSROOM CORRIDOR WINGS (NO SEAMS, HIGH VARIETY) */}
                {/* Zone 2 (x: 1800 - 3200): Big Panoramic Garden Windows with Outdoor Trees & God Rays */}
                <div className="absolute left-[1900px] top-[90px] flex items-center gap-8 pointer-events-none">
                  {[0, 1, 2].map(wIdx => (
                    <div key={wIdx} className="w-[340px] h-[230px] rounded-2xl bg-sky-200 border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200" />
                      <div className="absolute top-3 right-6 w-14 h-14 rounded-full bg-yellow-300/90 shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                      <div className="absolute bottom-0 inset-x-0 h-28 bg-emerald-600 rounded-t-[50px] transform -rotate-2 scale-110" />
                      <div className="absolute bottom-0 inset-x-0 h-20 bg-emerald-500 rounded-t-[70px] transform rotate-3" />
                      <div className="absolute bottom-2 left-6 text-3xl">🌳</div>
                      <div className="absolute bottom-4 right-10 text-4xl">🌲</div>
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 border-2 border-white/80 pointer-events-none">
                        <div className="border border-white/70" />
                        <div className="border border-white/70" />
                        <div className="border border-white/70" />
                        <div className="border border-white/70" />
                        <div className="border border-white/70" />
                        <div className="border border-white/70" />
                      </div>
                      <div className="absolute -inset-x-8 top-0 h-10 bg-white/30 transform -rotate-30 pointer-events-none" />

                      {/* Volumetric Sunbeam / God Ray Streaming Across Floor */}
                      <div 
                        className="absolute -top-10 -left-12 w-[380px] h-[520px] pointer-events-none opacity-30 mix-blend-screen"
                        style={{
                          background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.5) 0%, rgba(253, 224, 71, 0.18) 35%, transparent 75%)',
                          transform: 'skewX(-28deg)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Zone 3 (x: 3400 - 4600): Galeri Prestasi Siswa & Karya Seni */}
                <div className="absolute left-[3450px] top-[90px] flex items-center gap-8 pointer-events-none">
                  <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border-2 border-amber-400 shadow-xl flex flex-col items-center">
                    <div className="text-amber-300 font-game font-black text-xs">🎨 GALERI PRESTASI SAHABAT KAFA</div>
                    <div className="text-[10px] text-slate-300">Karya Seni & Robotika Siswa Berbakat</div>
                  </div>
                  {[
                    { icon: '🚀', title: 'Roket Masa Depan', by: 'Kafa', color: 'from-blue-900 to-indigo-900 border-cyan-400' },
                    { icon: '🤖', title: 'Robot Sahabat', by: 'Aisyah', color: 'from-amber-900 to-orange-900 border-amber-400' },
                    { icon: '🌺', title: 'Taman Pelangi', by: 'Rafi', color: 'from-pink-900 to-rose-900 border-pink-400' },
                  ].map((art, aIdx) => (
                    <div key={aIdx} className={`w-48 h-56 rounded-2xl bg-gradient-to-b ${art.color} border-3 shadow-2xl p-3 flex flex-col items-center justify-between`}>
                      <span className="text-5xl my-auto animate-pulse">{art.icon}</span>
                      <div className="w-full text-center bg-black/50 py-1 rounded-xl">
                        <div className="text-[10px] font-bold text-white font-game">{art.title}</div>
                        <div className="text-[8px] text-amber-300">Karya: {art.by} ⭐</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone 4 (x: 4900 - 6400): Dinding Sains, Tata Surya & Astronomi */}
                <div className="absolute left-[5000px] top-[85px] flex items-center gap-10 pointer-events-auto">
                  <div 
                    onClick={() => {
                      audio.playButtonClick();
                      setBlackboardInitialTab('ASTRONOMI');
                      setShowClassroomBlackboardModal(true);
                    }}
                    className="w-[580px] h-[260px] rounded-3xl bg-slate-950/95 border-4 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.5)] p-5 flex flex-col justify-between overflow-hidden relative cursor-pointer hover:border-cyan-300 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between z-10 border-b border-cyan-500/40 pb-2">
                      <div className="font-game font-black text-cyan-300 text-sm flex items-center gap-2">
                        <span>🌌 PETA SISTEM TATA SURYA</span>
                        <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                          KLIK / KETUK
                        </span>
                      </div>
                      <div className="text-[10px] text-cyan-200 font-mono">Astronomi Dasar Kelas SD</div>
                    </div>
                    <div className="flex items-center justify-around py-3 z-10 text-2xl">
                      <span title="Matahari">☀️</span>
                      <span title="Merkurius" className="text-sm">🪐</span>
                      <span title="Venus" className="text-base">🌕</span>
                      <span title="Bumi" className="text-3xl animate-spin" style={{ animationDuration: '10s' }}>🌍</span>
                      <span title="Mars" className="text-lg">🔴</span>
                      <span title="Jupiter" className="text-4xl">🪐</span>
                      <span title="Saturnus" className="text-3xl">🪐</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 z-10">
                      <div className="text-[10px] text-slate-300 bg-cyan-950/70 p-2 rounded-xl font-mono flex-1">
                        "Earth is the 3rd planet from the Sun! Kita wajib menjaga bumi tetap hijau dan bersih."
                      </div>
                      <button 
                        className="py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs font-game flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
                      >
                        <span>🚀</span>
                        <span>JELAJAHI TATA SURYA</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone 5 (x: 6700 - 8200): Perpustakaan Mini Sekolah */}
                <div className="absolute left-[6800px] top-[85px] flex items-center gap-8 pointer-events-auto">
                  <div 
                    onClick={() => {
                      audio.playButtonClick();
                      setBlackboardInitialTab('LITERASI');
                      setShowClassroomBlackboardModal(true);
                    }}
                    className="w-[620px] h-[260px] rounded-3xl bg-amber-950/95 border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)] p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between border-b border-amber-600/40 pb-2">
                      <div className="font-game font-black text-amber-300 text-sm flex items-center gap-2">
                        <span>📚 POJOK LITERASI SAHABAT KAFA</span>
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                          KLIK / KETUK
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-200">"Membaca adalah Jendela Dunia"</div>
                    </div>
                    <div className="grid grid-cols-8 gap-2 py-2">
                      {['📖', '📕', '📗', '📘', '📙', '📓', '📒', '📚', '📕', '📗', '📘', '📙', '📖', '📓', '📒', '📚'].map((bk, bki) => (
                        <div key={bki} className="h-16 bg-gradient-to-t from-stone-900 to-amber-900 rounded-lg border border-amber-400/50 flex items-center justify-center text-xl shadow">
                          {bk}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] text-amber-100 italic bg-black/40 p-2 rounded-xl flex-1">
                        "Buku adalah sahabat setia yang memberi kita sayap untuk menjelajahi semesta ilmu pengetahuan!"
                      </div>
                      <button 
                        className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-game flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
                      >
                        <span>📖</span>
                        <span>BUKA POJOK BACA</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zone 6 (x: 8500 - 10500): Hall of Fame & Lemari Piala Juara */}
                <div className="absolute left-[8600px] top-[85px] flex items-center gap-8 pointer-events-auto">
                  <div 
                    onClick={() => {
                      audio.playPowerUp();
                      setBlackboardInitialTab('TRIVIA');
                      setShowClassroomBlackboardModal(true);
                    }}
                    className="w-[580px] h-[250px] rounded-3xl bg-gradient-to-br from-slate-950 via-amber-950/60 to-slate-950 border-4 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.5)] p-5 flex flex-col justify-between cursor-pointer hover:border-yellow-300 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between border-b border-yellow-500/40 pb-2">
                      <div className="font-game font-black text-yellow-300 text-sm">🏆 RUANG PENGHARGAAN JUARA KELAS</div>
                      <div className="text-[10px] text-yellow-200">Sahabat Kafa Berprestasi</div>
                    </div>
                    <div className="flex items-center justify-around py-3">
                      <div className="text-center">
                        <span className="text-4xl block animate-bounce">🥇</span>
                        <span className="text-[9px] font-bold text-amber-300 font-game">JUARA 1 MATEMATIKA</span>
                      </div>
                      <div className="text-center">
                        <span className="text-5xl block animate-bounce" style={{ animationDelay: '0.2s' }}>🏆</span>
                        <span className="text-[10px] font-black text-yellow-300 font-game">PIALA BERGILIR BAHASA INGGRIS</span>
                      </div>
                      <div className="text-center">
                        <span className="text-4xl block animate-bounce" style={{ animationDelay: '0.4s' }}>🥇</span>
                        <span className="text-[9px] font-bold text-amber-300 font-game">JUARA 1 ROBOTIKA</span>
                      </div>
                    </div>
                    <div className="text-center text-xs font-black font-game text-yellow-300 bg-yellow-500/20 py-1.5 rounded-xl border border-yellow-400/40">
                      👑 SELAMAT KAMU TELAH MENJADI SISWA TELADAN! 🌟
                    </div>
                  </div>
                </div>
              </div>
          ) : (
            <div
              className="absolute inset-0 will-change-transform transition-opacity duration-300"
              style={{
                backgroundImage: `url(${level.bgImage})`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: `auto ${WORLD_HEIGHT}px`,
                backgroundPosition: 'left top',
                opacity: graphicSettings?.cleanBackgroundMode ? 0.55 : 0.76,
                filter: graphicSettings?.cleanBackgroundMode
                  ? 'brightness(1.02) contrast(1.02)'
                  : 'brightness(1.06) contrast(1.05) saturate(1.12)',
              }}
            />
          )}

          {/* Clean Focus Scrim (Keeps background calm and lets interactive items pop out) */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              graphicSettings?.cleanBackgroundMode
                ? 'bg-slate-950/35 backdrop-blur-[0.5px]'
                : 'bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/50'
            }`}
          />

          {/* Volumetric Sunbeams & God Rays streaming through high classroom windows */}
          {!graphicSettings?.cleanBackgroundMode && [350, 1450, 2550, 3750, 4950, 6150, 7450, 8750].map(sX => (
            <div
              key={sX}
              className="absolute top-0 w-80 h-full bg-gradient-to-b from-amber-200/18 via-amber-200/6 to-transparent transform -skew-x-12 blur-2xl pointer-events-none"
              style={{ left: `${sX}px` }}
            />
          ))}

          {/* THEMATIC CLASSROOM BANNERS & EDUCATIONAL FLAGS */}
          {level.areaId === 'area_school' && (
            <div className="absolute top-5 left-0 w-full pointer-events-none select-none z-10">
              {[500, 2200, 3900, 5600, 7300, 9000].map(bX => (
                <div key={bX} className="absolute flex flex-col items-center" style={{ left: `${bX}px` }}>
                  {/* Floating Motivational Banner */}
                  <div className="px-5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs font-game border-2 border-white shadow-[0_4px_20px_rgba(245,158,11,0.7)] flex items-center gap-2 tracking-wide ring-2 ring-amber-300/40">
                    <span className="text-sm animate-bounce">⭐</span>
                    <span>KELAS PINTAR SAHABAT KAFA</span>
                    <span className="text-sm animate-bounce">👑</span>
                  </div>
                  {/* Colorful Subject Pennants */}
                  <div className="flex items-center gap-3 mt-1 opacity-80 text-sm">
                    <span>📐</span>
                    <span>🔬</span>
                    <span>🎨</span>
                    <span>📚</span>
                    <span>🎵</span>
                  </div>
                </div>
              ))}

              {/* Classroom Wall Clock with Ticking Animation */}
              <div className="absolute left-[540px] top-[100px] w-13 h-13 rounded-full bg-slate-900/90 border-3 border-amber-400 shadow-xl flex items-center justify-center text-lg filter drop-shadow">
                <span className="animate-pulse">🕒</span>
              </div>
            </div>
          )}

          {/* Luminous Ambient Stardust Motes & Floating Sparkles across the whole Adventure */}
          {[
            { id: 1, x: 350, y: 160, icon: '✨' },
            { id: 2, x: 950, y: 130, icon: '🌟' },
            { id: 3, x: 1650, y: 170, icon: '✨' },
            { id: 4, x: 2350, y: 140, icon: '💫' },
            { id: 5, x: 3100, y: 180, icon: '✨' },
            { id: 6, x: 3850, y: 130, icon: '🌟' },
            { id: 7, x: 4600, y: 165, icon: '✨' },
            { id: 8, x: 5350, y: 145, icon: '👑' },
            { id: 9, x: 6100, y: 175, icon: '✨' },
            { id: 10, x: 6900, y: 135, icon: '🌟' },
            { id: 11, x: 7700, y: 160, icon: '✨' },
            { id: 12, x: 8500, y: 140, icon: '💫' },
            { id: 13, x: 9300, y: 170, icon: '✨' },
            { id: 14, x: 9800, y: 130, icon: '🌟' },
          ].map(mote => (
            <motion.div
              key={mote.id}
              animate={{
                opacity: [0.35, 0.9, 0.35],
                scale: [0.85, 1.25, 0.85],
                y: [0, -12, 0],
              }}
              transition={{ repeat: Infinity, duration: 3 + (mote.id % 4), ease: 'easeInOut' }}
              className="absolute text-sm pointer-events-none select-none text-amber-200/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
              style={{ left: `${mote.x}px`, top: `${mote.y}px` }}
            >
              {mote.icon}
            </motion.div>
          ))}
        </div>

        {/* LAYER 2: SOLID & DISTINCT GROUND PLATFORM PLANE (3D PERSPECTIVE TERRAIN) */}
        {(() => {
          const isIndoor = level.areaId === 'area_school' || level.areaId === 'area_home';
          const isNature = level.areaId === 'area_park' || level.areaId === 'area_city';

          return (
            <div
              className="absolute left-0 w-full pointer-events-none"
              style={{
                top: `${level.groundY - 18}px`,
                bottom: 0,
                height: `${Math.max(160, worldContentHeight - (level.groundY - 18))}px`,
                zIndex: Math.floor(level.groundY) - 10,
              }}
            >
              {/* 3D TILTED TOP SURFACE (Depth Perspective Floor Plane) */}
              <div
                className={`w-full h-6 relative border-t-2 shadow-xl ${
                  isIndoor
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-yellow-200 shadow-[0_-4px_22px_rgba(245,158,11,0.55)]'
                    : isNature
                    ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 border-emerald-200 shadow-[0_-4px_22px_rgba(16,185,129,0.55)]'
                    : 'bg-gradient-to-b from-amber-500 via-stone-500 to-stone-700 border-amber-200 shadow-[0_-4px_22px_rgba(217,119,6,0.55)]'
                }`}
              >
                {/* 3D Wood Planks / Paving Tiles Pattern with warm light gaps */}
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,#fff,#fff_2px,transparent_2px,transparent_75px)]" />
                {/* Top Specular Rim Reflection */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-white/90 via-yellow-100/90 to-white/90" />
                {/* Golden Inset Trim Line */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-amber-300 shadow-[0_0_8px_rgba(245,158,11,1)]" />
              </div>

              {/* 3D BEVELED FRONT CLIFF / FOUNDATION FACADE (Cross-Section Architecture with Embedded Crystals & Ancient Coins!) */}
              <div
                className={`w-full h-full relative overflow-hidden ${
                  isIndoor
                    ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-t-2 border-amber-500/60'
                    : isNature
                    ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-black border-t-2 border-emerald-500/60'
                    : 'bg-gradient-to-b from-stone-900 via-slate-950 to-black border-t-2 border-amber-500/60'
                }`}
              >
                {/* Ambient Occlusion Shadow Strip underneath the rim */}
                <div className="w-full h-6 bg-gradient-to-b from-black/90 to-transparent" />

                {/* Subterranean Clean Brick / Stone Ashlar Masonry Pattern */}
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,#334155_2px,transparent_2px,transparent_38px),repeating-linear-gradient(90deg,#334155_2px,transparent_2px,transparent_76px)]" />

                {/* Subterranean Glowing Tech Conduits with Pulsing Blue/Amber Energy Nodes */}
                <div className="absolute inset-x-0 top-4 h-1.5 bg-gradient-to-r from-amber-500/40 via-cyan-400/50 to-amber-500/40 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />

                {/* Embedded Glowing Treasures & Crystals in Foundation Every 220px */}
                <div className="absolute inset-x-0 top-6 flex justify-around pointer-events-none select-none">
                  {[240, 520, 800, 1100, 1400, 1700, 2000, 2300, 2600, 2900, 3200, 3500, 3800, 4100, 4400, 4700, 5000, 5300, 5600, 5900, 6200, 6500, 6800, 7100, 7400, 7700, 8000, 8300, 8600, 8900, 9200, 9500].map((px, idx) => (
                    <div key={px} className="absolute flex flex-col items-center gap-1" style={{ left: `${px}px` }}>
                      {/* Alternating embedded golden coins, crystals, and royal sconces */}
                      {idx % 3 === 0 ? (
                        <div className="px-2 py-0.5 rounded-full bg-slate-900/95 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.7)] flex items-center gap-1 text-[10px] text-amber-300 font-bold font-game">
                          <span className="animate-pulse">🪙</span>
                          <span className="text-[9px]">EMAS</span>
                        </div>
                      ) : idx % 3 === 1 ? (
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-400/70 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-pulse">
                          💎
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-[10px] shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                            💡
                          </div>
                          <div className="w-1 h-3 bg-gradient-to-b from-amber-400 to-amber-700" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Soft Foundation Ground Ambient Shadow */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-slate-950/80 to-transparent pointer-events-none" />
              </div>
            </div>
          );
        })()}

        {/* LAYER 3: LEVEL OBSTACLES (RICH 2.5D INTERACTIVE PROPS) */}
        {level.obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: `${obs.x - obs.w / 2}px`,
              top: `${obs.y - obs.h}px`,
              width: `${obs.w}px`,
              height: `${obs.h}px`,
              zIndex: Math.floor(obs.y),
            }}
          >
            <ObstacleProp obstacle={obs} />
          </div>
        ))}

        {/* INTERACTIVE SPINNING 3D GLOBE IN CLASSROOM */}
        {level.areaId === 'area_school' && (
          <div
            onClick={triggerSpinGlobe}
            className="absolute cursor-pointer pointer-events-auto flex flex-col items-center group z-30"
            style={{
              left: '260px',
              top: `${level.groundY - 65}px`,
            }}
            title="Putar Bola Dunia (+2 Koin 🪙)"
          >
            {/* Floor Contact Shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/40 rounded-full blur-[2px]" />

            {/* Brass Stand & Spinning Globe Sphere */}
            <div className="relative flex flex-col items-center group-hover:scale-110 active:scale-95 transition-transform">
              <motion.div
                animate={{ rotate: globeSpinCount * 360 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-emerald-400 border-2 border-white shadow-[0_0_16px_rgba(56,189,248,0.8)] flex items-center justify-center text-xl relative overflow-hidden"
              >
                <span className="filter drop-shadow text-2xl">🌍</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40 pointer-events-none" />
              </motion.div>

              {/* Brass Meridian & Base */}
              <div className="w-1.5 h-3 bg-gradient-to-b from-amber-400 to-amber-700 shadow" />
              <div className="w-8 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 rounded-full border border-amber-300 shadow-md" />

              {/* Proximity Floating Tip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-cyan-400 text-[9px] font-black text-cyan-300 font-game whitespace-nowrap shadow-md pointer-events-none">
                🌍 PUTAR BOLA DUNIA (+2 🪙)
              </div>
            </div>
          </div>
        )}

        {/* LAYER 3B: ACTIVE PATROLLING ENEMIES (MARIO STYLE) */}
        {enemies.map(enemy => {
          if (enemy.defeated) return null;
          return (
            <div
              key={enemy.id}
              className="absolute top-0 left-0 pointer-events-none transition-opacity duration-300 will-change-transform"
              style={{
                transform: `translate3d(${enemy.x - 26}px, ${enemy.y - 48}px, 0)`,
                zIndex: Math.floor(enemy.y) + 2,
              }}
            >
              <EnemyCritter enemy={enemy} isStomped={enemy.squashed} />
            </div>
          );
        })}

        {/* LAYER 4: COLLECTIBLES (COINS & STARS) */}
        {collectibles.map(col => {
          if (col.collected) return null;
          return (
            <motion.div
              key={col.id}
              initial={{ scale: 0.8 }}
              animate={{
                scale: [1, 1.15, 1],
                y: [0, -8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: col.type === 'star' ? 1.6 : 1.2,
                ease: 'easeInOut',
              }}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${col.x}px`,
                top: `${col.y}px`,
                zIndex: Math.floor(col.y) + 5,
              }}
            >
              {col.type === 'coin' ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-[0_0_20px_rgba(245,158,11,0.95)] flex items-center justify-center text-amber-950 font-black font-game text-xs ring-2 ring-amber-700 relative overflow-hidden">
                  <div className="absolute -inset-x-2 top-0 h-3 bg-white/60 transform -rotate-45" />
                  <span className="text-sm">🪙</span>
                </div>
              ) : (
                <div className="w-11 h-11 bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 border-2 border-white rounded-full shadow-[0_0_25px_rgba(250,204,21,1)] flex items-center justify-center text-2xl animate-spin" style={{ animationDuration: '4s' }}>
                  ⭐
                </div>
              )}
            </motion.div>
          );
        })}

        {/* LAYER 4B: SUPER MARIO ELEVATED 3D PLATFORMS */}
        {level.platforms?.map(plat => (
          <div
            key={plat.id}
            className="absolute pointer-events-none"
            style={{
              left: `${plat.x}px`,
              top: `${plat.y}px`,
              zIndex: Math.floor(plat.y) - 5,
            }}
          >
            {/* Ground Contact Shadow */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/40 rounded-full blur-[5px]"
              style={{ width: `${plat.w}px`, height: '16px' }}
            />

            {/* Elevated 3D Platform Surface */}
            <div
              className="relative transition-transform"
              style={{
                transform: `translateY(-${plat.z}px)`,
                width: `${plat.w}px`,
                height: `${plat.h}px`,
              }}
            >
              {plat.type === 'cloud' ? (
                <div className="relative w-full h-full">
                  {/* 3D Top Cloud Pill */}
                  <div className="absolute -top-1.5 inset-x-1 h-3 bg-white rounded-full border-t-2 border-sky-100 shadow" />
                  <div className="w-full h-full bg-gradient-to-b from-white via-sky-50 to-sky-100 rounded-2xl border-b-3 border-sky-300 shadow-[0_6px_15px_rgba(56,189,248,0.35)] flex items-center justify-center text-xs font-black text-sky-500 gap-2">
                    ☁️ ☁️ ☁️
                  </div>
                </div>
              ) : plat.type === 'brick' ? (
                <div className="relative w-full h-full">
                  {/* 3D Top Brick Tread */}
                  <div className="absolute -top-2 inset-x-0 h-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-t-lg border-t-2 border-white/60 shadow" />
                  <div className="w-full h-full bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 rounded-b-xl border-b-4 border-r-2 border-amber-950 shadow-xl flex items-center justify-around px-2 text-amber-200 font-black text-[10px]">
                    🧱 🧱 🧱
                  </div>
                </div>
              ) : plat.type === 'pipe' ? (
                <div className="relative w-full h-full">
                  <div className="w-full h-full bg-gradient-to-r from-emerald-700 via-emerald-400 to-emerald-800 rounded-t-2xl border-t-3 border-x-2 border-emerald-300 shadow-2xl flex items-center justify-center text-xs text-white font-bold">
                    🌱
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* 3D Timber Beam Top Surface */}
                  <div className="absolute -top-2 inset-x-0 h-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-t-lg border-t-2 border-amber-200 shadow" />
                  <div className="w-full h-full bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-b-xl border-b-4 border-r-2 border-amber-950 shadow-xl flex items-center justify-around px-2 text-amber-200 text-xs font-bold">
                    🪵 🪵
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* LAYER 4C: SUPER MARIO 3D MYSTERY QUESTION BLOCKS [ ? ] */}
        {mysteryBlocks.map(block => (
          <div
            key={block.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${block.x - 24}px`,
              top: `${block.y}px`,
              zIndex: Math.floor(block.y) + 10,
            }}
          >
            {/* Ground Shadow */}
            <div className="w-12 h-3.5 bg-black/45 rounded-full blur-[3px]" />

            {/* Floating 3D Block with Bump Physics */}
            <motion.div
              animate={
                block.hit
                  ? { y: [-block.z, -block.z - 20, -block.z] }
                  : { y: [-block.z, -block.z - 4, -block.z] }
              }
              transition={
                block.hit
                  ? { duration: 0.25 }
                  : { repeat: Infinity, duration: 2.0, ease: 'easeInOut' }
              }
              className="absolute cursor-pointer pointer-events-auto"
              style={{ top: 0 }}
              onClick={() => {
                if (!block.hit) triggerHitMysteryBlock(block.id);
              }}
            >
              {!block.hit ? (
                /* 3D Isometric Question Block */
                <div className="relative w-13 h-13 group active:scale-95 transition-transform">
                  {/* 3D Top Bevel Plane */}
                  <div className="absolute -top-2 inset-x-0 h-2.5 bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-100 rounded-t-lg border-t-2 border-x-2 border-white/80 shadow" />
                  
                  {/* Front Cube Face */}
                  <div className="w-13 h-13 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-b-xl border-b-4 border-r-3 border-l-2 border-amber-800 shadow-[0_8px_20px_rgba(245,158,11,0.7)] flex items-center justify-center text-amber-950 font-black text-2xl font-game ring-2 ring-yellow-200/90 relative overflow-hidden">
                    {/* Specular Diagonal Gleam */}
                    <div className="absolute -inset-x-6 top-0 h-3 bg-white/40 transform -rotate-45" />

                    {/* Corner Screw Rivets */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-800 border border-yellow-200" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-800 border border-yellow-200" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-800 border border-yellow-200" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-800 border border-yellow-200" />

                    {/* Embossed Question Mark */}
                    <span className="drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]">?</span>
                  </div>
                </div>
              ) : (
                /* Hit Inactive 3D Block */
                <div className="relative w-13 h-13">
                  <div className="absolute -top-1.5 inset-x-0 h-2 bg-slate-500 rounded-t-lg border-t border-x border-slate-400" />
                  <div className="w-13 h-13 bg-gradient-to-b from-stone-600 to-stone-800 rounded-b-xl border-b-4 border-r-3 border-stone-950 shadow-inner flex items-center justify-center text-stone-400 font-black text-sm">
                    •
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ))}

        {/* LAYER 4D: BOUNCY SPRING MUSHROOMS */}
        {level.bouncers?.map(bnc => {
          const isBouncing = bouncedMushroomId === bnc.id;
          return (
            <div
              key={bnc.id}
              className="absolute flex flex-col items-center pointer-events-none"
              style={{
                left: `${bnc.x - 25}px`,
                top: `${bnc.y - 28}px`,
                zIndex: Math.floor(bnc.y),
              }}
            >
              <div className="w-14 h-4 bg-black/40 rounded-full blur-[3px]" />
              <motion.div
                animate={
                  isBouncing
                    ? { scaleY: [1, 0.45, 1.3, 1], scaleX: [1, 1.35, 0.85, 1] }
                    : { scaleY: [1, 1.06, 1] }
                }
                transition={isBouncing ? { duration: 0.35 } : { repeat: Infinity, duration: 2 }}
                className="relative text-4xl filter drop-shadow-lg"
              >
                🍄
              </motion.div>
            </div>
          );
        })}

        {/* LAYER 4E: VICTORY GOAL FLAGPOLE */}
        {level.hasFlagpole && (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${level.worldWidth - 360}px`,
              top: `${level.groundY - 180}px`,
              zIndex: Math.floor(level.groundY),
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Star on top */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 border-2 border-amber-700 shadow-[0_0_14px_rgba(250,204,21,1)] flex items-center justify-center text-xs animate-spin" style={{ animationDuration: '6s' }}>
                ⭐
              </div>

              {/* Pole */}
              <div className="w-3 h-44 bg-gradient-to-r from-slate-200 via-white to-slate-400 border border-slate-600 rounded-sm relative">
                {/* Moving Flag */}
                <motion.div
                  animate={flagpoleCleared ? { y: 125 } : { y: 10 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute left-3 top-0 flex items-center"
                >
                  <div className="w-12 h-8 bg-gradient-to-r from-rose-500 to-red-600 rounded-r-lg border border-red-700 shadow-md flex items-center justify-center text-white text-xs font-black font-game">
                    🚩
                  </div>
                </motion.div>
              </div>

              {/* Base */}
              <div className="w-14 h-7 bg-emerald-600 rounded-t-lg border-2 border-emerald-800 shadow-lg flex items-center justify-center text-[10px] text-white font-black font-game">
                GOAL
              </div>
              <div className="w-22 h-4 bg-black/40 rounded-full blur-[3px]" />
            </div>
          </div>
        )}

        {/* LAYER 4F: SPEED BOOST PADS (TURBO DASH ARROWS) */}
        {level.speedPads?.map(sp => (
          <div
            key={sp.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: `${sp.x - 40}px`,
              top: `${sp.y - 12}px`,
              zIndex: Math.floor(sp.y) - 2,
            }}
          >
            <div className="px-3.5 py-1 bg-cyan-950/80 border-2 border-cyan-400 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_16px_rgba(6,182,212,0.8)] animate-pulse">
              <span className="text-xs">⚡</span>
              <span className="text-[10px] font-black text-cyan-300 font-game tracking-wider">TURBO BOOST &gt;&gt;</span>
            </div>
          </div>
        ))}

        {/* LAYER 4G: ZONE CHECKPOINT MILESTONE FLAGS */}
        {level.zones?.filter(z => z.startX > 300).map(z => (
          <div
            key={z.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${z.startX}px`,
              top: `${level.groundY - 125}px`,
              zIndex: Math.floor(level.groundY),
            }}
          >
            <div className="px-3 py-1 bg-slate-950/90 text-amber-300 border-2 border-amber-400 rounded-full font-black text-[10px] font-game shadow-2xl flex items-center gap-1.5 whitespace-nowrap animate-bounce">
              <span>{z.icon}</span>
              <span>{z.nameId}</span>
            </div>
            <div className="w-1.5 h-24 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-800 shadow-md" />
            <div className="w-8 h-3 bg-amber-950 rounded-full blur-[1px]" />
          </div>
        ))}

        {/* LAYER 4K: KUIL SAHABAT KAFA (GOLDEN SACRED POWER SHRINE) */}
        {(() => {
          const shrineX = Math.round(level.worldWidth * 0.45);
          const shrineY = level.groundY - 15;
          return (
            <div
              key="sahabat_kafa_shrine"
              onClick={() => {
                triggerShrineBlessing();
              }}
              className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto"
              style={{
                left: `${shrineX - 60}px`,
                top: `${shrineY - 150}px`,
                zIndex: Math.floor(shrineY),
              }}
            >
              {/* Golden Sacred Light Aura on Ground */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 bg-amber-400/35 rounded-full blur-xl animate-pulse" />
              
              {/* Rune Circle */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-9 rounded-full border-2 border-dashed border-amber-300/80 animate-spin" style={{ animationDuration: '12s' }} />

              {/* FLOATING SACRED GOLDEN CROWN RELIC */}
              <motion.div
                animate={{ y: [-6, 6, -6], scale: [1, 1.08, 1], rotate: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="relative text-4xl sm:text-5xl filter drop-shadow-[0_0_24px_rgba(245,158,11,1)]">
                  👑
                </div>
                <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-slate-950 font-black text-[9px] tracking-wider uppercase shadow-xl border border-white font-game whitespace-nowrap mt-1">
                  KUIL SAHABAT KAFA
                </div>
              </motion.div>

              {/* Crystal Shrine Pedestal */}
              <div className="relative w-28 h-20 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 rounded-t-2xl border-2 border-amber-400 shadow-2xl flex flex-col items-center justify-center p-2 mt-2">
                <div className="w-16 h-4 bg-amber-400/50 rounded-full blur-[2px]" />
                <span className="text-[10px] font-black text-amber-950 font-game">✨ BERKAH ✨</span>
              </div>

              {/* Interaction prompt when player is nearby */}
              <AnimatePresence>
                {isNearShrine && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    className="absolute -top-12 whitespace-nowrap z-50 pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-full font-black text-xs shadow-2xl border-2 border-white font-game active:scale-95 transition-all ring-4 ring-amber-400/40 animate-bounce">
                      <span>[E] / SENTUH:</span>
                      <span>BERKAH SAHABAT KAFA 👑</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* LAYER 4E-2: 3D ARCHITECTURAL DIORAMA DOORWAY PORTAL */}
        {level.doorPortals?.map(portal => {
          const isNear = nearDoorPortal?.id === portal.id;
          return (
            <div
              key={portal.id}
              onClick={() => {
                if (onEnterRoom) {
                  audio.playDoorOpen();
                  onEnterRoom(portal.roomId);
                }
              }}
              className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto transition-transform"
              style={{
                left: `${portal.x - 52}px`,
                top: `${portal.y - 128}px`,
                zIndex: Math.floor(portal.y) - 2,
              }}
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/50 rounded-full blur-[4px] pointer-events-none" />

              {/* Warm Golden Light Spill on Floor */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-28 h-10 pointer-events-none transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(251,191,36,0.45) 0%, rgba(245,158,11,0.15) 60%, transparent 85%)',
                  filter: 'blur(2px)',
                  opacity: isNear ? 1 : 0.6,
                }}
              />

              {/* Compact Sleek Arched Doorway Frame */}
              <div className="relative w-26 h-32 bg-gradient-to-b from-stone-800 via-amber-950/80 to-stone-900 rounded-t-full border-3 border-amber-600 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-1 group-hover:scale-105 transition-transform overflow-hidden">
                {/* Decorative Arch Keystone / Sign Header */}
                <div className="relative z-10 px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400 shadow flex items-center gap-1 mt-1">
                  <span className="text-[10px]">{portal.icon || '🚪'}</span>
                  <span className="font-game text-[8px] font-black text-amber-300 truncate max-w-[75px]">
                    {portal.name}
                  </span>
                </div>

                {/* Warm 3D Room Interior Preview Glow */}
                <div className="relative w-18 h-22 bg-gradient-to-b from-black via-amber-950 to-stone-950 rounded-t-full border border-amber-500/70 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-400/30 via-yellow-200/15 to-transparent animate-pulse" />
                  
                  {/* Subtle Ajar Door */}
                  <div className="relative z-10 w-11 h-16 bg-gradient-to-r from-amber-800 to-amber-900 rounded-t-lg border border-amber-400 shadow-md flex items-center justify-center">
                    <span className="text-xs filter drop-shadow">🚪</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 border border-amber-950 shadow absolute right-1 bottom-4" />
                  </div>
                </div>

                {/* Stone Threshold Step */}
                <div className="w-20 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-t shadow text-[6px] text-slate-950 font-black text-center font-game">
                  3D ROOM
                </div>
              </div>

              {/* Sleek Contextual Proximity Prompt */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="absolute -top-9 whitespace-nowrap z-[100] pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full font-black text-[11px] shadow-xl border-2 border-white font-game active:scale-95 transition-all ring-2 ring-amber-400/40 animate-bounce">
                      <span className="px-1.5 py-0.2 bg-slate-950 text-amber-300 rounded text-[9px] font-mono">
                        [E]
                      </span>
                      <span>{portal.label || 'Masuk 3D'}</span>
                      <span>🚪</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* LAYER 4G: GROUND POUND LIGHTNING SHOCKWAVES */}
        {groundShockwaves.map(sw => (
          <motion.div
            key={sw.id}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute pointer-events-none z-[720] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.9)] flex items-center justify-around text-2xl text-cyan-300"
            style={{
              left: `${sw.x}px`,
              top: `${sw.y}px`,
              width: '130px',
              height: '42px',
            }}
          >
            <span className="animate-ping">⚡</span>
            <span className="animate-ping">⚡</span>
          </motion.div>
        ))}

        {/* LAYER 4H-2: ADVENTURE KNOWLEDGE & ENGLISH ROAD SIGNPOSTS */}
        {ADVENTURE_KNOWLEDGE_POSTS.filter(p => p.levelId === level.id).map(kp => {
          const isNear = nearKnowledgePost?.id === kp.id;
          return (
            <div
              key={kp.id}
              onClick={() => {
                audio.playButtonClick();
                setActiveKnowledgePost(kp);
              }}
              className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto"
              style={{
                left: `${kp.x - 38}px`,
                top: `${kp.y - 120}px`,
                zIndex: Math.floor(kp.y),
              }}
            >
              {/* Shadow on ground */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/45 rounded-full blur-[2px]" />

              {/* Wooden / Hi-Tech Signpost Stand */}
              <div className="relative flex flex-col items-center">
                {/* Glowing Top Lantern / Emblem Color-Coded by Grade 1 SD Subject */}
                {(() => {
                  const isMath = kp.subject === 'MATH';
                  const isScience = kp.subject === 'SCIENCE';
                  const lanternGrad = isMath
                    ? 'from-sky-400 via-sky-500 to-sky-700 border-sky-200 ring-sky-400/40'
                    : isScience
                    ? 'from-emerald-400 via-emerald-500 to-emerald-700 border-emerald-200 ring-emerald-400/40'
                    : 'from-amber-400 via-amber-500 to-amber-700 border-amber-200 ring-amber-400/40';
                  const badgeText = isMath ? 'MTK 1 SD' : isScience ? 'IPA 1 SD' : 'ENG 1 SD';

                  return (
                    <div className={`w-16 h-14 bg-gradient-to-b ${lanternGrad} rounded-2xl border-3 shadow-2xl flex flex-col items-center justify-center p-1 group-hover:scale-105 transition-transform ring-4`}>
                      <span className="text-2xl filter drop-shadow-md">{kp.emoji}</span>
                      <span className="text-[8px] font-black text-slate-950 font-game uppercase tracking-tight">
                        {badgeText}
                      </span>
                    </div>
                  );
                })()}

                {/* Pole */}
                <div className="w-2.5 h-14 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border-x border-amber-950 shadow-md" />

                {/* Stone / Metal Base */}
                <div className="w-12 h-3.5 bg-stone-700 border border-stone-900 rounded-t-md shadow" />
              </div>

              {/* Title Plate */}
              <div className="mt-1 px-3 py-0.5 bg-slate-900/95 backdrop-blur-md text-amber-300 rounded-full font-bold text-[10px] shadow-lg border border-amber-400/70 font-game flex items-center gap-1 whitespace-nowrap group-hover:border-amber-300">
                <span>{kp.subject === 'MATH' ? '📐' : kp.subject === 'SCIENCE' ? '🔬' : '🇬🇧'}</span>
                <span className="truncate max-w-[130px]">{kp.title.replace(/^Pos [^:]+: /, '')}</span>
              </div>

              {/* Near Proximity Floating Indicator */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.85 }}
                    animate={{ opacity: 1, y: -6, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.85 }}
                    className="absolute -top-10 whitespace-nowrap z-50 pointer-events-auto"
                  >
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[11px] shadow-2xl border-2 border-white font-game active:scale-95 transition-all ring-4 animate-bounce ${
                      kp.subject === 'MATH'
                        ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 ring-sky-400/50'
                        : kp.subject === 'SCIENCE'
                        ? 'bg-gradient-to-r from-emerald-400 to-green-300 text-slate-950 ring-emerald-400/50'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 ring-amber-400/50'
                    }`}>
                      <span>[E]</span>
                      <span>{kp.badgeText || 'TANTANGAN KELAS 1 SD'} 💡</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* LAYER 4H: PLAYER JURUS PROJECTILES (SAHABAT KAFA POWER, STAR MAGIC BLAST & FIRE DRAGON) */}
        {playerProjectiles.map(proj => (
          <div
            key={proj.id}
            className="absolute pointer-events-none z-[760] flex items-center justify-center will-change-transform"
            style={{
              left: `${proj.x - (proj.type === 'sahabat_kafa' ? 30 : proj.type === 'fire_dragon' ? 24 : 16)}px`,
              top: `${proj.y - (proj.type === 'sahabat_kafa' ? 30 : proj.type === 'fire_dragon' ? 24 : 16)}px`,
            }}
          >
            {proj.type === 'sahabat_kafa' ? (
              <div className="relative flex flex-col items-center justify-center">
                {/* Trailing golden solar energy speed trail */}
                <div
                  className={`absolute w-28 h-8 rounded-full blur-[3px] bg-gradient-to-r ${
                    proj.vx > 0
                      ? 'from-amber-400 via-yellow-200 to-transparent -left-14'
                      : 'from-transparent via-yellow-200 to-amber-400 -right-14'
                  }`}
                />

                {/* Radiant Spinning Solar Crown Star */}
                <div
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_32px_rgba(245,158,11,1)] flex items-center justify-center text-2xl font-black animate-spin"
                  style={{ animationDuration: '0.45s' }}
                >
                  👑
                </div>

                {/* Sahabat Kafa Floating Branding Badge on Projectile */}
                <div className="absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-[8.5px] font-black text-amber-300 font-game shadow-[0_0_12px_rgba(245,158,11,1)] flex items-center gap-1 z-20">
                  <span className="text-[10px]">👑</span>
                  <span>SAHABAT KAFA</span>
                </div>

                {/* Golden star sparkles */}
                <div className="absolute -bottom-2 text-xs text-yellow-200 animate-ping">✨</div>
              </div>
            ) : proj.type === 'fire_dragon' ? (
              <div className="relative flex items-center justify-center">
                {/* Roaring fire tail */}
                <div
                  className={`absolute w-16 h-7 rounded-full blur-[3px] bg-gradient-to-r ${
                    proj.vx > 0 ? 'from-orange-500 via-red-500 to-transparent -left-8' : 'from-transparent via-red-500 to-orange-500 -right-8'
                  }`}
                />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_28px_rgba(249,115,22,1)] flex items-center justify-center text-2xl font-bold animate-pulse">
                  🔥
                </div>
              </div>
            ) : (
              <>
                {/* Luminous Tail Flame */}
                <div
                  className={`absolute w-9 h-3.5 rounded-full blur-[2px] bg-gradient-to-r ${
                    proj.vx > 0 ? 'from-amber-400 to-transparent -left-5' : 'from-transparent to-amber-400 -right-5'
                  }`}
                />
                {/* Radiant Star Core */}
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-500 shadow-[0_0_22px_rgba(250,204,21,1)] flex items-center justify-center text-xl font-bold animate-spin"
                  style={{ animationDuration: '0.35s' }}
                >
                  ⭐
                </div>
              </>
            )}
          </div>
        ))}

        {/* LAYER 4H-2: SUPER NOVA COSMIC BURST FULLSCREEN EFFECT */}
        {superNovaActive && (
          <div className="fixed inset-0 pointer-events-none z-[950] flex items-center justify-center bg-gradient-to-r from-purple-500/25 via-pink-500/35 to-amber-400/25 backdrop-blur-[2px] animate-pulse">
            <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-500 via-amber-300 to-cyan-400 blur-3xl opacity-70 animate-ping" />
          </div>
        )}

        {/* LAYER 4I: ENEMY ATTACK PROJECTILES (FIREBALLS & STINGERS) */}
        {enemyProjectiles.map(proj => (
          <div
            key={proj.id}
            className="absolute pointer-events-none z-[755] flex items-center justify-center will-change-transform"
            style={{
              left: `${proj.x - 14}px`,
              top: `${proj.y - 14}px`,
            }}
          >
            {proj.type === 'fireball' ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 rounded-full bg-rose-500/50 blur-[4px] animate-ping" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-red-600 shadow-[0_0_18px_rgba(239,68,68,0.9)] flex items-center justify-center text-sm">
                  🔥
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.9)] flex items-center justify-center text-xs font-black">
                  ⚡
                </div>
              </div>
            )}
          </div>
        ))}

        {/* LAYER 4F: FLOATING SCORE & REWARD POPUPS */}
        {floatingScores.map(score => (
          <motion.div
            key={score.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -45, scale: 1.25 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute pointer-events-none z-[850] font-black text-sm md:text-base font-game drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              left: `${score.x}px`,
              top: `${score.y}px`,
              color: score.color,
            }}
          >
            {score.text}
          </motion.div>
        ))}

        {/* LAYER 5: THEMATIC OBJECTS INTEGRATED NATURALLY INTO ENVIRONMENT (NO PERMANENT DEBUG LABELS) */}
        {level.vocabItems.map(item => {
          const isNear = nearVocab?.id === item.id;
          const isNextTarget = nextTargetWordId === item.id;
          const isBouncing = bouncingItemId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemInteract(item)}
              className="absolute cursor-pointer transition-transform duration-200 flex flex-col items-center group"
              style={{
                left: `${item.worldPosition.x - 70}px`,
                top: `${item.worldPosition.y - 80}px`,
                zIndex: Math.floor(item.worldPosition.y),
              }}
            >
              {/* Floor Drop Shadow */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/45 rounded-full blur-[4px] pointer-events-none" />

              {/* Subtle ambient sparkle for story target (NOT a giant billboard) */}
              {isNextTarget && !isNear && (
                <motion.div
                  initial={{ opacity: 0.3, scale: 0.8 }}
                  animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.9, 1.1, 0.9], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-7 text-amber-300 text-lg pointer-events-none"
                >
                  ✨
                </motion.div>
              )}

              {/* Dedicated 2.5D Vector Object Prop with Mario-Style Squash & Bounce */}
              <motion.div
                animate={
                  isBouncing
                    ? {
                        scaleY: [1, 0.68, 1.32, 0.88, 1.08, 1],
                        scaleX: [1, 1.32, 0.82, 1.12, 0.95, 1],
                        y: [0, -28, 2, -6, 0],
                      }
                    : isNear
                    ? {
                        scale: 1.06,
                        y: [0, -3, 0],
                      }
                    : {
                        scale: 1,
                        y: 0,
                      }
                }
                transition={
                  isBouncing
                    ? { duration: 0.45, ease: 'easeOut' }
                    : isNear
                    ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                    : { duration: 0.2 }
                }
                className={`transition-all duration-300 ${
                  isNear
                    ? 'filter drop-shadow-[0_0_18px_rgba(251,191,36,0.7)]'
                    : 'group-hover:scale-102'
                }`}
              >
                <UniversalVocabProp word={item.word} />
              </motion.div>

              {/* Small Contextual Interaction Prompt: Only Appears When Near */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.85 }}
                    animate={{ opacity: 1, y: -32, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.85 }}
                    className="absolute -top-6 whitespace-nowrap z-50 pointer-events-auto"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemInteract(item);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 hover:bg-slate-800 text-amber-300 rounded-full font-bold text-xs shadow-2xl border-2 border-amber-400 font-game cursor-pointer active:scale-95 transition-all ring-4 ring-amber-400/25"
                    >
                      <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black">
                        [E]
                      </span>
                      <span className="font-black text-white">{item.word}</span>
                      <span className="text-amber-400">=</span>
                      <span className="text-emerald-300 font-extrabold">{item.translation}</span>
                      <span>{item.emoji}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* INTERACTIVE CLASSROOM BLACKBOARD PROMPT */}
        {level.areaId === 'area_school' && nearBlackboard && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="absolute z-[750] pointer-events-auto"
            style={{
              left: '480px',
              top: '430px',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                audio.playButtonClick();
                setBlackboardInitialTab('QUIZ');
                setShowClassroomBlackboardModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-full font-black text-xs shadow-xl border-2 border-emerald-400 font-game cursor-pointer active:scale-95 transition-all ring-2 ring-emerald-400/40"
            >
              <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 rounded text-[9px] font-black">
                [E]
              </span>
              <span className="text-emerald-300">Papan Tulis 🎓</span>
              <span className="text-yellow-300 text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full">
                Kuis & Ilmu ⭐
              </span>
            </button>
          </motion.div>
        )}

        {/* LAYER 6: LEVEL NPC GUIDE */}
        <div
          onClick={onInteractNpc}
          className="absolute cursor-pointer flex flex-col items-center"
          style={{
            left: `${level.npc.x - 50}px`,
            top: `${level.npc.y - 75}px`,
            zIndex: Math.floor(level.npc.y),
          }}
        >
          {/* Shadow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black/40 rounded-full blur-[2px]" />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="relative flex flex-col items-center"
          >
            {/* Guide Avatar */}
            <div className="w-16 h-16 rounded-full bg-indigo-600 border-3 border-white shadow-xl flex items-center justify-center text-3xl">
              {level.npc.emoji}
            </div>
            <span className="absolute -top-2 -right-2 text-xl animate-bounce">💬</span>
          </motion.div>

          <div className="mt-1 px-3 py-1 bg-indigo-600 text-white text-[11px] font-black rounded-full font-game shadow-lg border border-indigo-400 whitespace-nowrap">
            {level.npc.name} ({level.npc.role})
          </div>

          <AnimatePresence>
            {nearNpc && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                className="absolute -top-12 whitespace-nowrap z-50 pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInteractNpc();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full font-black text-sm shadow-2xl border-3 border-white font-game cursor-pointer ring-4 ring-indigo-300/50"
                >
                  <span className="text-lg">🗣️</span>
                  <span>BICARA: Panduan Misi Level {level.id}!</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LAYER 7: MINI-GAMES CARNIVAL PAVILION AT END OF STAGE */}
        <div
          onClick={onOpenMiniGames}
          className="absolute flex flex-col items-center cursor-pointer pointer-events-auto group"
          style={{
            left: `${level.worldWidth - 160}px`,
            top: `${level.groundY - 95}px`,
            zIndex: Math.floor(level.groundY),
          }}
        >
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/40 rounded-full blur-[3px]" />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-28 h-28 bg-gradient-to-t from-indigo-900 via-purple-700 to-amber-400 rounded-2xl shadow-xl border-3 border-amber-300 flex flex-col items-center justify-center p-2 text-center text-white"
          >
            <span className="text-3xl animate-bounce">🎪</span>
            <span className="text-[10px] font-black uppercase tracking-wider font-game mt-1">ARENA GAME</span>
            <span className="text-[9px] text-amber-200 font-bold">5 Mini-Games</span>
          </motion.div>
          <div className="mt-1 px-3 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full shadow-md border border-white font-game">
            MAIN GAME 🎮
          </div>
        </div>

        {/* LAYER 7B: COZY ADVENTURE CHECKPOINT CAMPFIRE & FLAG */}
        <div
          className="absolute flex flex-col items-center pointer-events-auto select-none"
          style={{
            left: `${checkpointX - 45}px`,
            top: `${level.groundY - 78}px`,
            zIndex: Math.floor(level.groundY) - 2,
          }}
        >
          {/* Checkpoint Flag Banner */}
          <div className="relative flex flex-col items-center mb-1">
            <div
              className={`px-2.5 py-0.5 rounded-full font-game text-[9px] font-black border shadow-lg flex items-center gap-1 transition-all ${
                isCheckpointReached
                  ? 'bg-emerald-500 text-white border-white animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                  : 'bg-slate-900/90 text-amber-300 border-amber-400'
              }`}
            >
              <span>{isCheckpointReached ? '✅' : '🚩'}</span>
              <span>{isCheckpointReached ? 'CHECKPOINT AKTIF' : 'POS CHECKPOINT'}</span>
            </div>
            {/* Wooden Flag Pole */}
            <div className="w-1.5 h-10 bg-amber-800 border-r border-amber-950 rounded-full" />
          </div>

          {/* Glowing Campfire with Animated Flames & Warm Light Ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-amber-500/25 blur-md pointer-events-none animate-pulse" />
            <motion.div
              animate={{ scale: [1, 1.15, 0.95, 1], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="text-2xl filter drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]"
            >
              🔥
            </motion.div>
          </div>
          <div className="text-[12px] -mt-1 font-bold">🪵🪵</div>
        </div>

        {/* LAYER 8: PLAYER CHARACTER (ROBOT HERO WITH DIVINE AURA & ULTRA-SMOOTH GPU TRANSFORM) */}
        <div
          ref={playerContainerRef}
          className="absolute top-0 left-0 will-change-transform pointer-events-none"
          style={{
            zIndex: Math.floor(player.y) + 10,
            opacity: isInvulnerable ? 0.75 : 1,
            transform: `translate3d(${player.x - 50}px, ${player.y - 95 - player.z}px, 0) rotate(${
              isAcrobaticFlipping ? 360 : player.vx < -0.8 ? -6 : player.vx > 0.8 ? 6 : 0
            }deg) scale(${
              player.z > 8 ? '0.94, 1.06' : isGroundPounding ? '1.15, 0.82' : '1, 1'
            })`,
            transition: isAcrobaticFlipping ? 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            filter: isInvulnerable
              ? 'drop-shadow(0 0 16px rgba(56,189,248,0.95)) drop-shadow(0 0 24px rgba(251,191,36,0.8))'
              : graphicSettings?.heroRimLight
              ? 'drop-shadow(0 0 12px rgba(251,191,36,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {/* Dash Ghost After-Images when running fast or acrobatic flipping */}
          {(Math.abs(player.vx) > 3.6 || isAcrobaticFlipping) && (
            <div
              className="absolute inset-0 pointer-events-none -z-20 will-change-transform opacity-40 blur-[0.5px]"
              style={{
                transform: `translate3d(${player.facing === 'left' ? 26 : -26}px, 0, 0)`,
                filter: 'drop-shadow(0 0 14px rgba(56,189,248,0.95))',
              }}
            >
              <FacelessCharacter
                gender={character.gender}
                outfitColor="#38bdf8"
                backpackColor="#0284c7"
                hat={character.hat}
                state={player.state}
                facing={player.facing}
                jumpZ={player.z}
                isPowerActive={false}
                isSahabatKafaBuff={false}
              />
            </div>
          )}

          {/* Immortal Hero Golden-Cyan Divine Aura Halo */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-t from-cyan-400/20 via-amber-400/20 to-yellow-300/25 blur-md pointer-events-none -z-10 animate-pulse" />

          {/* Orbiting Star Shield (3 Celestial Stars in Emerald Forcefield) */}
          {isShieldActive && (
            <div className="absolute -inset-6 pointer-events-none z-50 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-300/80 bg-emerald-400/15 shadow-[0_0_24px_rgba(16,185,129,0.7)] animate-pulse" />
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2.4s' }}>
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-base drop-shadow-[0_0_8px_#10B981]">⭐</span>
                <span className="absolute bottom-1 -left-1 text-base drop-shadow-[0_0_8px_#10B981]">⭐</span>
                <span className="absolute bottom-1 -right-1 text-base drop-shadow-[0_0_8px_#10B981]">⭐</span>
              </div>
            </div>
          )}

          {/* Tornado Spin Cyclone Swirl */}
          {isTornadoSpinning && (
            <div className="absolute -inset-7 pointer-events-none z-50 flex items-center justify-center animate-spin" style={{ animationDuration: '0.35s' }}>
              <div className="w-24 h-24 rounded-full border-4 border-cyan-300/80 border-t-white bg-cyan-400/25 shadow-[0_0_24px_rgba(56,189,248,0.9)] flex items-center justify-center text-3xl">
                🌪️
              </div>
            </div>
          )}

          {/* Hero 3D Rim Aura Halo when sprinting */}
          {graphicSettings?.heroRimLight && Math.abs(player.vx) > 1.8 && (
            <div className="absolute inset-x-2 -inset-y-1 rounded-full bg-amber-400/20 blur-sm pointer-events-none -z-10 animate-pulse" />
          )}

          {/* Contact drop shadow on ground with height falloff */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-black/45 rounded-full blur-[3px]"
            style={{
              bottom: '2px',
              width: `${Math.max(20, 68 - player.z * 0.48)}px`,
              height: `${Math.max(6, 22 - player.z * 0.2)}px`,
              opacity: Math.max(0.12, 0.48 - player.z * 0.007),
            }}
          />

          {/* Active Hero Emote Balloon */}
          {activeHeroEmote && (
            <motion.div
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1.1, y: -45, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950/95 border-2 border-amber-400 rounded-2xl px-3 py-1 text-center shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none ring-2 ring-amber-400/40"
            >
              <span className="text-xl animate-bounce">{activeHeroEmote.emoji}</span>
              <span className="text-[10px] font-black text-amber-300 font-game">{activeHeroEmote.label}</span>
            </motion.div>
          )}

          {/* Sahabat Kafa Jurus Superhero Comic Shout Balloon */}
          {jurusHeroShout && (
            <motion.div
              initial={{ scale: 0.4, y: 10, opacity: 0 }}
              animate={{ scale: [1, 1.12, 1], y: -55, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-slate-950 font-black text-xs font-game rounded-full px-3.5 py-1 text-center shadow-[0_0_25px_rgba(245,158,11,1)] flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none ring-2 ring-white border-2 border-slate-950 animate-bounce"
            >
              <span>{jurusHeroShout}</span>
            </motion.div>
          )}

          <FacelessCharacter
            gender={character.gender}
            outfitColor={character.outfitColor}
            backpackColor={character.backpackColor}
            hat={character.hat}
            state={player.state}
            facing={player.facing}
            jumpZ={player.z}
            isPowerActive={isShieldActive || superNovaActive || isTornadoSpinning || activePower === 'sahabat_kafa'}
            isSahabatKafaBuff={isKafaBuffActive}
          />
        </div>

        {/* LAYER 8B: SUPER MARIO CARTOON DUST PUFF PARTICLES */}
        {dustPuffs.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0.85, scale: 0.4, y: 0 }}
            animate={{ opacity: 0, scale: d.scale * 1.5, y: -16 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="absolute pointer-events-none z-[620] flex items-center justify-center"
            style={{
              left: `${d.x - 12}px`,
              top: `${d.y - 12}px`,
            }}
          >
            <div className="w-7 h-7 rounded-full bg-white/80 border border-amber-200/80 blur-[1px] shadow-sm flex items-center justify-center text-[10px]">
              💨
            </div>
          </motion.div>
        ))}

        {/* LAYER 8C: ATMOSPHERIC ADVENTURE VISUAL PARTICLES (SUNLIGHT MOTES, LEAVES, FIREFLIES, STARDUST) */}
        <div className="absolute inset-0 pointer-events-none z-[730] overflow-hidden">
          {ambientParticles.map((p) => (
            <motion.div
              key={p.id}
              animate={{
                x: [0, p.dx, 0],
                y: [0, p.dy, 0],
                opacity: [p.opacity, p.opacity * 1.6, p.opacity],
                rotate: [0, p.rot],
              }}
              transition={{
                repeat: Infinity,
                duration: p.duration,
                ease: 'easeInOut',
              }}
              className="absolute select-none text-sm sm:text-base filter drop-shadow will-change-transform"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
            >
              {p.icon}
            </motion.div>
          ))}
        </div>
      </div>

      {/* PS3 CONSOLE GRAPHICS & LIGHTING PIPELINE (GOD RAYS, FOREGROUND BOKEH, VIGNETTE & TROPHIES) */}
      <PS3GraphicsLayer
        cameraX={cameraX}
        worldWidth={level.worldWidth}
        worldHeight={WORLD_HEIGHT}
        worldScale={worldScale}
        levelTheme={level.areaId}
        levelId={level.id}
        settings={graphicSettings}
        trophy={activeTrophy}
        onDismissTrophy={onDismissTrophy}
      />

      {/* SLIM & CLEAN ADVENTURE DISTANCE TRACKER */}
      <div className="absolute top-12 sm:top-13 left-1/2 -translate-x-1/2 z-[700] pointer-events-none flex flex-col items-center select-none opacity-85 hover:opacity-100 transition-opacity">
        <div className="bg-slate-950/75 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 shadow-md flex items-center gap-1.5 sm:gap-2">
          <span className="text-[9.5px] sm:text-[10px] text-amber-300 font-mono font-bold">
            {Math.floor(player.x)}m
          </span>
          <div className="relative w-20 sm:w-32 md:w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${Math.min(100, Math.max(0, (player.x / level.worldWidth) * 100))}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            {level.worldWidth}m 🏁
          </span>
        </div>
      </div>

      {/* DYNAMIC COMBO STREAK BANNER POPUP */}
      <AnimatePresence>
        {activeComboDisplay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -25 }}
            animate={{ opacity: 1, scale: 1.05, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: 'spring', damping: 16, stiffness: 400 }}
            className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[999] pointer-events-none flex flex-col items-center select-none"
          >
            <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 border-2 border-white text-white font-game font-black text-sm sm:text-base shadow-[0_0_30px_rgba(249,115,22,0.9)] flex items-center gap-2.5 tracking-wide ring-4 ring-amber-300/40 animate-pulse">
              <span className="text-xl animate-bounce">🔥</span>
              <span>{activeComboDisplay.text}</span>
              <span className="text-xl animate-bounce">⭐</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SAHABAT KAFA POWER / JURUS CINEMATIC CUT-IN BANNER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeKafaBanner && (
          <div className="fixed inset-0 pointer-events-none z-[990] flex flex-col items-center justify-center select-none overflow-hidden">
            {/* Cinematic Golden Screen Flash */}
            {kafaScreenFlash && (
              <motion.div
                initial={{ opacity: 0.65 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-gradient-to-t from-amber-500/25 via-yellow-300/35 to-amber-500/25 pointer-events-none"
              />
            )}

            {/* Anime Horizontal Cut-In Banner with Radiant Speedlines */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-24 sm:h-28 bg-gradient-to-r from-transparent via-slate-950/95 to-transparent border-y-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.95)] flex items-center justify-center backdrop-blur-md relative"
            >
              {/* Radiant diagonal golden speedlines */}
              <div
                className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#f59e0b_0,#f59e0b_12px,transparent_12px,transparent_24px)] pointer-events-none"
              />

              {/* Banner Core Content */}
              <motion.div
                initial={{ scale: 0.65, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 450 }}
                className="flex items-center gap-3 sm:gap-5 px-6 py-2 relative z-10"
              >
                {/* Glowing Crown Icon with Shockwave Ping */}
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-500 border-2 border-white shadow-[0_0_30px_rgba(245,158,11,1)] flex items-center justify-center text-3xl sm:text-4xl animate-bounce">
                    {activeKafaBanner.icon || '👑'}
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-300 animate-ping opacity-60" />
                </div>

                {/* Golden Typography with Official Sahabat Kafa Branding */}
                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-widest font-game shadow-md border border-white">
                      👑 JURUS SAHABAT KAFA 👑
                    </span>
                    <span className="text-xs text-amber-300 animate-pulse font-game font-black hidden xs:inline">
                      ⚡ ULTIMATE POWER ⚡
                    </span>
                  </div>

                  <div className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-400 font-game tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mt-1 flex items-center gap-2">
                    <span>{activeKafaBanner.subtitle}</span>
                    <span className="text-amber-400 text-base sm:text-2xl animate-spin" style={{ animationDuration: '3s' }}>
                      ✦
                    </span>
                  </div>

                  <div className="text-[10px] sm:text-xs font-bold text-amber-200/90 font-game mt-0.5">
                    Kekuatan Legendaris Sahabat Kafa Diaktifkan!
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZONE MILESTONE ANNOUNCEMENT BANNER */}
      <AnimatePresence>
        {activeZoneBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[950] pointer-events-none"
          >
            <div className="px-6 py-3 bg-slate-950/95 border-2 border-amber-400 text-amber-300 font-game font-black text-sm md:text-base rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 ring-4 ring-amber-400/20">
              <span className="text-3xl animate-bounce">{activeZoneBanner.icon}</span>
              <div>
                <div className="text-[10px] text-amber-300 font-black uppercase tracking-wider">🚩 Memasuki Wilayah Baru</div>
                <div className="text-sm md:text-base text-white font-black drop-shadow">{activeZoneBanner.nameId}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PORTRAIT ORIENTATION BANNER TIP FOR SMARTPHONES (CLEAN & NON-BOUNCING) */}
      {isPortrait && showPortraitTip && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[850] max-w-[92vw] px-3 py-1.5 bg-slate-900/90 border border-amber-400/60 rounded-full shadow-lg backdrop-blur-md flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-bold font-game text-amber-200">
            <span>📱</span>
            <span>Tips: Miringkan HP (Lanskap) untuk pandangan lebih luas!</span>
          </div>
          <button
            onClick={() => setShowPortraitTip(false)}
            className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
            aria-label="Tutup tips"
          >
            ✕
          </button>
        </div>
      )}

      {/* MOBILE CONTROLS OVERLAY (ERGONOMIC & COMPATIBLE FOR SMARTPHONES) */}
      <div className="absolute inset-0 pointer-events-none z-[850] flex flex-col justify-end p-2 sm:p-4 md:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="w-full flex items-end justify-between gap-2">
          {/* ======================================================== */}
          {/* LEFT THUMB CONTROLLER (4-WAY D-PAD OR ANALOG JOYSTICK) */}
          {/* ======================================================== */}
          <div className="flex flex-col items-start gap-1 sm:gap-1.5 pointer-events-auto">
            {/* Controller Mode Switcher Pill */}
            <button
              onClick={() => {
                audio.playButtonClick();
                setControlMode(prev => prev === 'dpad' ? 'joystick' : 'dpad');
              }}
              className="px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/50 text-[9px] sm:text-[10px] text-amber-300 font-game font-bold shadow-lg flex items-center gap-1 active:scale-95 cursor-pointer"
              title="Ganti mode kontrol HP"
            >
              <span>{controlMode === 'dpad' ? '🎮 D-Pad 4 Arah' : '🕹️ Joystick'}</span>
              <span className="text-[8px] text-slate-400 bg-slate-800 px-1 rounded">⇄ Ganti</span>
            </button>

            {controlMode === 'dpad' ? (
              /* Ergonomic 4-Directional D-Pad (Up/Down for Lane Depth + Left/Right) */
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center select-none touch-none">
                {/* Up Button (Jalur Atas) */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    mobileUpRef.current = true;
                    if ('vibrate' in navigator) navigator.vibrate?.(10);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    mobileUpRef.current = false;
                  }}
                  onPointerLeave={() => { mobileUpRef.current = false; }}
                  onPointerCancel={() => { mobileUpRef.current = false; }}
                  className="absolute top-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 sm:border-3 border-amber-400 active:border-white active:scale-90 shadow-2xl flex flex-col items-center justify-center text-amber-300 touch-none cursor-pointer"
                  aria-label="Jalan Atas"
                >
                  <span className="text-base sm:text-lg font-black leading-none">▲</span>
                  <span className="text-[6px] sm:text-[7px] font-game font-black text-amber-200">ATAS</span>
                </button>

                {/* Down Button (Jalur Bawah) */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    mobileDownRef.current = true;
                    if ('vibrate' in navigator) navigator.vibrate?.(10);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    mobileDownRef.current = false;
                  }}
                  onPointerLeave={() => { mobileDownRef.current = false; }}
                  onPointerCancel={() => { mobileDownRef.current = false; }}
                  className="absolute bottom-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 sm:border-3 border-amber-400 active:border-white active:scale-90 shadow-2xl flex flex-col items-center justify-center text-amber-300 touch-none cursor-pointer"
                  aria-label="Jalan Bawah"
                >
                  <span className="text-[6px] sm:text-[7px] font-game font-black text-amber-200">BAWAH</span>
                  <span className="text-base sm:text-lg font-black leading-none">▼</span>
                </button>

                {/* Left Button */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    mobileLeftRef.current = true;
                    if ('vibrate' in navigator) navigator.vibrate?.(10);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    mobileLeftRef.current = false;
                  }}
                  onPointerLeave={() => { mobileLeftRef.current = false; }}
                  onPointerCancel={() => { mobileLeftRef.current = false; }}
                  className="absolute left-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 sm:border-3 border-amber-400 active:border-white active:scale-90 shadow-2xl flex flex-col items-center justify-center text-amber-300 touch-none cursor-pointer"
                  aria-label="Jalan Kiri"
                >
                  <span className="text-base sm:text-lg font-black leading-none">◀</span>
                  <span className="text-[6px] sm:text-[7px] font-game font-black text-amber-200">KIRI</span>
                </button>

                {/* Right Button */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    mobileRightRef.current = true;
                    if ('vibrate' in navigator) navigator.vibrate?.(10);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    mobileRightRef.current = false;
                  }}
                  onPointerLeave={() => { mobileRightRef.current = false; }}
                  onPointerCancel={() => { mobileRightRef.current = false; }}
                  className="absolute right-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 sm:border-3 border-amber-400 active:border-white active:scale-90 shadow-2xl flex flex-col items-center justify-center text-amber-300 touch-none cursor-pointer"
                  aria-label="Jalan Kanan"
                >
                  <span className="text-base sm:text-lg font-black leading-none">▶</span>
                  <span className="text-[6px] sm:text-[7px] font-game font-black text-amber-200">KANAN</span>
                </button>

                {/* Center Robot Badge */}
                <div className="w-9 h-9 rounded-full bg-slate-950/90 border border-amber-400/60 flex items-center justify-center text-xs shadow-inner pointer-events-none text-amber-300">
                  🤖
                </div>
              </div>
            ) : (
              /* Analog Virtual Joystick with Pointer Capture */
              <div
                onPointerDown={handleJoystickPointerDown}
                onPointerMove={handleJoystickPointerMove}
                onPointerUp={handleJoystickPointerUp}
                onPointerCancel={handleJoystickPointerUp}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/70 backdrop-blur-md border-2 border-amber-400/70 flex items-center justify-center pointer-events-auto touch-none shadow-2xl active:bg-slate-950/90 cursor-pointer relative"
              >
                {/* Direction guide marks */}
                <div className="absolute top-1 text-[8px] text-amber-400/60 pointer-events-none">▲</div>
                <div className="absolute bottom-1 text-[8px] text-amber-400/60 pointer-events-none">▼</div>
                <div className="absolute left-1.5 text-[8px] text-amber-400/60 pointer-events-none">◀</div>
                <div className="absolute right-1.5 text-[8px] text-amber-400/60 pointer-events-none">▶</div>

                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-b from-white to-amber-200 shadow-2xl border-2 border-amber-500 flex items-center justify-center transition-transform pointer-events-none"
                  style={{
                    transform: `translate(${joystickThumbPos.x}px, ${joystickThumbPos.y}px)`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500 shadow" />
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT THUMB CONTROLLER (ACTION BUTTONS CLUSTER) */}
          {/* ======================================================== */}
          <div className="flex flex-col items-end gap-1 sm:gap-2 pointer-events-auto">
            {/* Quick 6-Superpowers Drawer / Strip */}
            <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10 shadow-2xl">
              <span className="text-[9px] font-black text-amber-300 font-game hidden sm:flex items-center gap-1 mr-0.5">
                <span>👑</span>
                <span>SAHABAT KAFA:</span>
              </span>
              <span className="text-[8px] font-black text-amber-300 font-game sm:hidden flex items-center gap-0.5 mr-0.5">
                <span>👑</span>
                <span>KAFA:</span>
              </span>
              {HERO_POWERS.slice(0, isMobile ? 3 : 6).map(pow => {
                const isActive = (activePower || 'star_blast') === pow.id;
                return (
                  <button
                    key={pow.id}
                    onClick={() => {
                      triggerActivePower(pow.id);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer active:scale-90 relative ${
                      isActive
                        ? `bg-gradient-to-br ${pow.gradient} text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110 border border-white font-black`
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700'
                    }`}
                    title={`${pow.name}: ${pow.description}`}
                  >
                    <span>{pow.emoji}</span>
                  </button>
                );
              })}
              {isMobile && (
                <button
                  onClick={() => cycleNextPower()}
                  className="w-7 h-7 rounded-xl bg-slate-800 text-amber-300 text-[10px] font-black border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                  title="Ganti Jurus Berikutnya"
                >
                  +3
                </button>
              )}
            </div>

            {/* Action Buttons: 2x2 Cluster on Mobile Phones / Inline on Large Screens */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
              {/* SPRINT TURBO (Dash) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  mobileSprintRef.current = true;
                  if ('vibrate' in navigator) navigator.vibrate?.(10);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  mobileSprintRef.current = false;
                }}
                onPointerLeave={() => {
                  mobileSprintRef.current = false;
                }}
                onClick={() => {
                  speedBoostUntilRef.current = performance.now() + 2000;
                  audio.playCoin();
                  spawnDust(playerRef.current.x, playerRef.current.y, 2.0);
                  spawnFloatingScore(playerRef.current.x, playerRef.current.y - 50, '💨 ROCKET DASH! ⚡', '#38BDF8');
                }}
                className={`relative w-12 h-12 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 sm:border-3 cursor-pointer ${
                  isSprinting
                    ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white border-white ring-2 ring-cyan-300 animate-pulse'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-cyan-500/50'
                }`}
                title="Lari Cepat / Sprint"
              >
                <span className="text-base sm:text-lg">🚀</span>
                <span className="font-game text-[7px] sm:text-[8px] uppercase font-black">
                  {isSprinting ? 'TURBO' : 'LARI'}
                </span>
              </motion.button>

              {/* INTERACT / ACTION BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if ('vibrate' in navigator) navigator.vibrate?.(15);
                  triggerInteraction();
                }}
                className={`relative w-12 h-12 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 sm:border-3 cursor-pointer ${
                  isNearShrine || nearDoorPortal || nearKnowledgePost || nearVocab || nearNpc || nearMiniGameGate
                    ? 'bg-amber-400 text-slate-950 border-white ring-3 ring-amber-300 animate-pulse'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700'
                }`}
                title="Aksi Periksa / Masuk / Baca / Berkah Kuil"
              >
                <span className="text-base sm:text-lg">
                  {isNearShrine ? '👑' : nearDoorPortal ? '🚪' : nearKnowledgePost ? '📖' : nearNpc ? '💬' : '🔍'}
                </span>
                <span className="font-game text-[6.5px] sm:text-[7.5px] uppercase font-black truncate max-w-[46px] text-center">
                  {isNearShrine ? 'BERKAH' : nearDoorPortal ? 'MASUK' : nearKnowledgePost ? 'BACA' : nearNpc ? 'BICARA' : 'PERIKSA'}
                </span>
              </motion.button>

              {/* JURUS SAHABAT KAFA / ATTACK BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if ('vibrate' in navigator) navigator.vibrate?.(15);
                  if (!playerRef.current.isGrounded && playerRef.current.z > 10) {
                    triggerGroundPound();
                  } else {
                    triggerActivePower();
                  }
                }}
                className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${activePowerConfig.gradient} text-slate-950 font-black text-xs shadow-2xl border-3 border-white ring-3 ring-amber-400/80 flex flex-col items-center justify-center active:scale-95 cursor-pointer`}
                title={`${activePowerConfig.name} - Jurus Sahabat Kafa Power`}
              >
                {/* Floating mini crown on top */}
                <div className="absolute -top-3 px-1.5 py-0.2 rounded-full bg-slate-950/95 border border-amber-400 text-amber-300 font-game text-[6.5px] font-black tracking-wider uppercase shadow-md flex items-center gap-0.5 whitespace-nowrap z-10">
                  <span>👑</span>
                  <span>SAHABAT KAFA</span>
                </div>
                <span className="text-lg sm:text-xl leading-none mt-1">{activePowerConfig.emoji}</span>
                <span className="font-game text-[7px] sm:text-[8px] uppercase font-black text-slate-950 leading-none mt-0.5">
                  JURUS POWER
                </span>
              </motion.button>

              {/* JUMP BUTTON (BIGGEST & MOST ACCESSIBLE) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  if ('vibrate' in navigator) navigator.vibrate?.(15);
                  triggerJump();
                }}
                className="relative w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white font-bold text-xs shadow-2xl border-3 border-white ring-3 ring-emerald-400/60 flex flex-col items-center justify-center active:scale-90 cursor-pointer"
                title="Lompat"
                aria-label="Lompat"
              >
                <span className="text-xl sm:text-2xl">🦘</span>
                <span className="font-game text-[7.5px] sm:text-[8.5px] uppercase font-black">LOMPAT</span>
              </motion.button>

              {/* HERO EMOTE ACTION BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const types: ('dance' | 'wave' | 'star')[] = ['dance', 'wave', 'star'];
                  const pick = types[Math.floor(Math.random() * types.length)];
                  triggerHeroEmote(pick);
                }}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 sm:border-3 bg-slate-900/90 hover:bg-slate-800 text-yellow-300 border-yellow-500/50 cursor-pointer active:scale-90"
                title="Gaya & Emote Hero (Joget / Sapa / Bintang)"
              >
                <span className="text-base sm:text-lg animate-bounce">🕺</span>
                <span className="font-game text-[6.5px] sm:text-[7.5px] uppercase font-black text-amber-300">
                  GAYA
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ADVENTURE KNOWLEDGE & ENGLISH LEARNING POST MODAL */}
      {activeKnowledgePost && (
        <KnowledgePostModal
          post={activeKnowledgePost}
          onClose={() => setActiveKnowledgePost(null)}
          onReward={(xp, coins) => {
            onCollectCoin(coins);
            spawnFloatingScore(player.x, player.y - 70, `+${coins} 🪙 +${xp} XP ⭐`, '#38BDF8');
          }}
        />
      )}

      {/* 2D CLASSROOM BLACKBOARD LEARNING & CHALK DOODLE MODAL */}
      {showClassroomBlackboardModal && (
        <ClassroomBlackboardModal
          isOpen={showClassroomBlackboardModal}
          initialTab={blackboardInitialTab}
          onClose={() => setShowClassroomBlackboardModal(false)}
          onReward={(xp, coins, stars = 1) => {
            onCollectCoin(coins);
            onCollectStar(stars);
            spawnFloatingScore(player.x, player.y - 70, `+${coins} 🪙 +${xp} XP +${stars} ⭐`, '#10B981');
          }}
        />
      )}
    </div>
  );
};
