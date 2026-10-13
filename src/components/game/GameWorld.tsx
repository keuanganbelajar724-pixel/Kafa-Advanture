import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  activePower = 'star_blast',
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

  const cameraXRef = useRef<number>(0);
  const [cameraX, setCameraX] = useState<number>(0);

  const activePowerConfig = HERO_POWERS.find(p => p.id === (activePower || 'star_blast')) || HERO_POWERS[0];

  // Responsive Viewport Height Adaptive Scaling (Eliminates empty bottom void)
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : WORLD_HEIGHT
  );

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const worldScale = Math.max(0.65, Math.min(2.4, viewportHeight / WORLD_HEIGHT));

  const flagpoleClearedRef = useRef<boolean>(false);
  const [flagpoleCleared, setFlagpoleCleared] = useState<boolean>(false);

  const [bouncedMushroomId, setBouncedMushroomId] = useState<string | null>(null);
  const [bouncingItemId, setBouncingItemId] = useState<string | null>(null);
  const [dustPuffs, setDustPuffs] = useState<{ id: string; x: number; y: number; scale: number }[]>([]);
  const [floatingScores, setFloatingScores] = useState<{ id: string; x: number; y: number; text: string; color: string }[]>([]);

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

  // Extended Adventure: Zone Milestones & Rocket Sprinting
  const [activeZoneBanner, setActiveZoneBanner] = useState<{ nameId: string; icon: string } | null>(null);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const isSprintingRef = useRef<boolean>(false);
  const speedBoostUntilRef = useRef<number>(0);
  const mobileSprintRef = useRef<boolean>(false);
  const visitedZonesRef = useRef<Set<string>>(new Set());

  // Reset zone milestone history when switching levels
  useEffect(() => {
    visitedZonesRef.current.clear();
    setActiveZoneBanner(null);
  }, [level.id]);

  // Input states
  const keys = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const isJoystickActiveRef = useRef<boolean>(false);
  const joystickStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumbPos, setJoystickThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
      audio.playPowerUp();
      onCollectStar(1);
      spawnFloatingScore(block.x, block.y - block.z - 20, '+1 ⭐ STAR!', '#F59E0B');
    }
  }, [onCollectCoin, onCollectStar, spawnFloatingScore]);

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

    if (currentPow === 'star_blast') {
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
      spawnFloatingScore(p.x, p.y - 70, '⚡ TEMBAKAN BINTANG!', '#FBBF24');
    } else if (currentPow === 'tornado_spin') {
      audio.playTornadoSpin();
      isTornadoSpinningRef.current = true;
      setIsTornadoSpinning(true);
      p.vx = dir * 14;
      if (p.isGrounded) p.vz = 5;
      spawnFloatingScore(p.x, p.y - 70, '🌪️ TOPAN BADAI!', '#38BDF8');
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
      spawnFloatingScore(p.x, p.y - 70, '🔥 BOLA API NAGA!', '#F97316');
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
        spawnFloatingScore(p.x, p.y - 70, '💥 GEMPA PETIR! ⚡', '#A855F7');
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
      spawnFloatingScore(p.x, p.y - 70, '🛡️ PERISAI BINTANG AKTIF!', '#10B981');
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
          spawnFloatingScore(e.x, e.y - 45, '✨ SUPER NOVA K.O.!', '#EC4899');
        }
      });
      if (novaHits > 0) {
        onCollectCoin(novaHits * 4);
        onCollectStar(1);
        setEnemies([...enemiesRef.current]);
      }
      spawnFloatingScore(p.x, p.y - 85, '✨ SUPER NOVA COSMIC BURST! 🌟💥', '#EC4899');
    }
  }, [activePower, onSelectPower, consumeEnergy, spawnDust, spawnFloatingScore, onCollectCoin, onCollectStar, triggerGroundPound]);

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
    if (nearDoorPortalRef.current && onEnterRoom) {
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
  }, [handleItemInteract, onInteractNpc, onOpenMiniGames, onEnterRoom]);

  const triggerJump = useCallback(() => {
    if (playerRef.current.isGrounded) {
      audio.playJump();
      playerRef.current.vz = JUMP_FORCE;
      playerRef.current.isGrounded = false;
      playerRef.current.state = 'jumping';
      setPlayer({ ...playerRef.current });
    }
  }, []);

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
      if (e.key === '1') triggerActivePower('star_blast');
      if (e.key === '2') triggerActivePower('tornado_spin');
      if (e.key === '3') triggerActivePower('fire_dragon');
      if (e.key === '4') triggerActivePower('thunder_pound');
      if (e.key === '5') triggerActivePower('star_shield');
      if (e.key === '6') triggerActivePower('cosmic_nova');

      // Superpower Letter Shortcuts
      if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'j') {
        triggerActivePower();
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

      const moveLeft = keys.current['a'] || keys.current['arrowleft'] || joystickVector.current.x < -0.25;
      const moveRight = keys.current['d'] || keys.current['arrowright'] || joystickVector.current.x > 0.25;
      const moveUp = keys.current['w'] || keys.current['arrowup'] || joystickVector.current.y < -0.25;
      const moveDown = keys.current['s'] || keys.current['arrowdown'] || joystickVector.current.y > 0.25;

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
            setTimeout(() => setActiveZoneBanner(null), 3600);
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
            enemiesChanged = true;
          } else if (nextX <= enemy.minX) {
            nextX = enemy.minX;
            nextDir = 'right';
            enemiesChanged = true;
          }
          if (nextX !== enemy.x || nextDir !== enemy.direction) {
            enemy.x = nextX;
            enemy.direction = nextDir;
            enemiesChanged = true;
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
            onCollectCoin(3);
            spawnFloatingScore(enemy.x, enemy.y - 45, '+150 💥 K.O.! +3 🪙', '#F59E0B');
            spawnDust(enemy.x, enemy.y, 1.4);
            if (onTriggerTrophy) {
              onTriggerTrophy({
                id: 'defeat_monster_jurus',
                tier: 'bronze',
                title: 'Jurus Bintang Spektakuler!',
                description: 'Mengalahkan monster dengan tembakan bintang!',
                icon: '⚡',
              });
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

      if (enemiesChanged) {
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
      } else if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
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

      // Check Collectibles
      let sumCoins = 0;
      let sumStars = 0;
      let collectiblesChanged = false;
      collectiblesRef.current = collectiblesRef.current.map(c => {
        if (!c.collected) {
          const cDx = newX - c.x;
          const cDy = newY - c.y;
          const cDist = Math.sqrt(cDx * cDx + cDy * cDy);
          const canReach = c.type === 'star' ? Math.abs(z - (level.groundY - c.y)) < 55 : z < 35;
          if (cDist < 52 && canReach) {
            collectiblesChanged = true;
            if (c.type === 'coin') sumCoins += c.value;
            else sumStars += c.value;
            return { ...c, collected: true };
          }
        }
        return c;
      });

      // Proximity Checks
      let closestDoorPortal: DoorPortal | null = null;
      let minPortalDist = Infinity;
      for (const portal of (level.doorPortals || [])) {
        const dx = newX - portal.x;
        const dy = newY - portal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist < minPortalDist) {
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
        const nextCam = prevCam + (targetCamX - prevCam) * 0.14;
        cameraXRef.current = nextCam;
        if (Math.abs(nextCam - prevCam) > 0.05) {
          setCameraX(nextCam);
        }
      }

      // Update player state
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
      setPlayer(updatedPlayer);

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

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [level, spawnDust, triggerHitMysteryBlock, triggerBouncer, triggerFlagpole, onCollectCoin, onCollectStar, onTakeDamage]);

  // Touch Virtual Joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = touch.clientX - rect.left;
    const startY = touch.clientY - rect.top;
    joystickStartPos.current = { x: startX, y: startY };
    isJoystickActiveRef.current = true;
    setIsJoystickActive(true);
    setJoystickThumbPos({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickActiveRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const dx = currentX - joystickStartPos.current.x;
    const dy = currentY - joystickStartPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 45;

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
    }
  };

  const handleTouchEnd = () => {
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
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: `${level.worldWidth}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `scale(${worldScale}) translateX(-${cameraX}px)`,
          transformOrigin: 'top left',
        }}
      >
        {/* LAYER 1: SEAMLESS THEMATIC PANORAMA (CLEAN, CALM & HIGH LEGIBILITY) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950">
          {/* Gentle background color backing to reduce visual clutter */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950 pointer-events-none" />

          {/* Background Art with Soft Depth of Field and reduced opacity to avoid confusing busy-ness */}
          <div
            className="absolute inset-0 will-change-transform transition-opacity duration-300"
            style={{
              backgroundImage: `url(${level.bgImage})`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: `auto ${WORLD_HEIGHT}px`,
              backgroundPosition: 'left top',
              opacity: graphicSettings?.cleanBackgroundMode ? 0.32 : 0.48,
              filter: graphicSettings?.cleanBackgroundMode
                ? 'brightness(0.92) contrast(0.9) saturate(0.85)'
                : 'brightness(0.96) contrast(0.95)',
            }}
          />

          {/* Clean Focus Scrim (Keeps background calm and lets foreground elements pop out!) */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              graphicSettings?.cleanBackgroundMode
                ? 'bg-slate-950/40 backdrop-blur-[0.5px]'
                : 'bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-950/50'
            }`}
          />

          {/* Gentle, non-intrusive Ambient Sunbeams */}
          {!graphicSettings?.cleanBackgroundMode && [400, 1500, 2600, 3700].map(sX => (
            <div
              key={sX}
              className="absolute top-0 w-64 h-full bg-gradient-to-b from-amber-100/10 via-amber-100/3 to-transparent transform -skew-x-12 blur-xl pointer-events-none"
              style={{ left: `${sX}px` }}
            />
          ))}

          {/* Subtle Ambient Sparkles (Calm, Non-distracting, Zero Fake Props) */}
          {[
            { id: 1, x: 450, y: 160 },
            { id: 2, x: 1350, y: 130 },
            { id: 3, x: 2250, y: 170 },
            { id: 4, x: 3150, y: 140 },
          ].map(mote => (
            <motion.div
              key={mote.id}
              animate={{
                opacity: [0.2, 0.65, 0.2],
                scale: [0.8, 1.15, 0.8],
              }}
              transition={{ repeat: Infinity, duration: 3.5 + mote.id, ease: 'easeInOut' }}
              className="absolute text-xs pointer-events-none select-none text-amber-200/50"
              style={{ left: `${mote.x}px`, top: `${mote.y}px` }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* LAYER 2: SOLID & DISTINCT GROUND PLATFORM PLANE (NO AMBIGUITY!) */}
        {(() => {
          const isIndoor = level.areaId === 'area_school' || level.areaId === 'area_home';
          const isNature = level.areaId === 'area_park' || level.areaId === 'area_city';
          const isMarket = level.areaId === 'area_market';

          const topBorder = isIndoor
            ? 'border-t-4 border-amber-600 shadow-[0_-4px_20px_rgba(217,119,6,0.35)]'
            : isNature
            ? 'border-t-4 border-emerald-500 shadow-[0_-4px_20px_rgba(16,185,129,0.35)]'
            : 'border-t-4 border-amber-500 shadow-[0_-4px_20px_rgba(245,158,11,0.35)]';

          const floorBg = isIndoor
            ? 'bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950'
            : isNature
            ? 'bg-gradient-to-b from-emerald-700 via-emerald-900 to-slate-950'
            : 'bg-gradient-to-b from-stone-700 via-stone-800 to-slate-950';

          const baseboard = isIndoor
            ? 'h-3 bg-gradient-to-b from-amber-400/90 to-amber-600 border-b border-amber-950'
            : isNature
            ? 'h-2.5 bg-gradient-to-b from-emerald-400 to-emerald-600 border-b border-emerald-950'
            : 'h-2.5 bg-gradient-to-b from-stone-400 to-stone-600 border-b border-stone-900';

          return (
            <div
              className={`absolute left-0 w-full pointer-events-none ${topBorder}`}
              style={{
                top: `${level.groundY}px`,
                bottom: 0,
                zIndex: Math.floor(level.groundY) - 10,
              }}
            >
              <div className={`w-full ${baseboard}`} />
              <div className={`w-full h-full ${floorBg}`} />
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

        {/* LAYER 3B: ACTIVE PATROLLING ENEMIES (MARIO STYLE) */}
        {enemies.map(enemy => {
          if (enemy.defeated) return null;
          return (
            <div
              key={enemy.id}
              className="absolute pointer-events-none transition-opacity duration-300"
              style={{
                left: `${enemy.x - 26}px`,
                top: `${enemy.y - 48}px`,
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
                <div className="w-9 h-9 bg-amber-400 border-2 border-amber-600 rounded-full shadow-[0_0_18px_rgba(245,158,11,0.9)] flex items-center justify-center text-base font-black text-amber-950 font-game">
                  🪙
                </div>
              ) : (
                <div className="w-11 h-11 bg-yellow-300 border-2 border-yellow-500 rounded-full shadow-[0_0_24px_rgba(250,204,21,1)] flex items-center justify-center text-2xl animate-spin" style={{ animationDuration: '4s' }}>
                  ⭐
                </div>
              )}
            </motion.div>
          );
        })}

        {/* LAYER 4B: SUPER MARIO ELEVATED PLATFORMS */}
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
            {/* Floor Drop Shadow */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/35 rounded-full blur-[4px]"
              style={{ width: `${plat.w}px`, height: '14px' }}
            />

            {/* Elevated Platform Surface */}
            <div
              className="relative transition-transform"
              style={{
                transform: `translateY(-${plat.z}px)`,
                width: `${plat.w}px`,
                height: `${plat.h}px`,
              }}
            >
              {plat.type === 'cloud' ? (
                <div className="w-full h-full bg-white/95 rounded-full border-2 border-sky-200 shadow-md flex items-center justify-center text-xs font-black text-sky-500 backdrop-blur-xs">
                  ☁️ ☁️ ☁️
                </div>
              ) : plat.type === 'brick' ? (
                <div className="w-full h-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-lg border-2 border-amber-950 shadow-md flex items-center justify-around px-2 text-amber-950 font-black text-[10px]">
                  🧱 🧱 🧱
                </div>
              ) : plat.type === 'pipe' ? (
                <div className="w-full h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-700 rounded-t-xl border-2 border-emerald-950 shadow-lg flex items-center justify-center text-xs text-white font-bold">
                  🌱
                </div>
              ) : (
                <div className="w-full h-full bg-amber-700 rounded-md border-2 border-amber-900 shadow-md flex items-center justify-around px-2 text-amber-200 text-xs font-bold">
                  🪵 🪵
                </div>
              )}
            </div>
          </div>
        ))}

        {/* LAYER 4C: SUPER MARIO MYSTERY QUESTION BLOCKS [ ? ] */}
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
            <div className="w-10 h-3 bg-black/40 rounded-full blur-[3px]" />

            {/* Floating Block with Bump Physics */}
            <motion.div
              animate={
                block.hit
                  ? { y: [-block.z, -block.z - 16, -block.z] }
                  : { y: [-block.z, -block.z - 3, -block.z] }
              }
              transition={
                block.hit
                  ? { duration: 0.25 }
                  : { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
              }
              className="absolute cursor-pointer pointer-events-auto"
              style={{ top: 0 }}
              onClick={() => {
                if (!block.hit) triggerHitMysteryBlock(block.id);
              }}
            >
              {!block.hit ? (
                <div className="w-12 h-12 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 rounded-xl border-3 border-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center text-amber-950 font-black text-xl font-game ring-2 ring-yellow-200 animate-pulse active:scale-95">
                  ?
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-b from-slate-600 to-slate-800 rounded-xl border-3 border-slate-900 shadow-inner flex items-center justify-center text-slate-400 font-black text-sm">
                  •
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

        {/* LAYER 4E-2: 3D ROOM DOORWAY PORTALS (MASUK KE RUANGAN 3D) */}
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
                left: `${portal.x - 70}px`,
                top: `${portal.y - 145}px`,
                zIndex: Math.floor(portal.y) - 2,
              }}
            >
              {/* Floor Shadow & Light Spill */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-44 h-12 bg-amber-400/25 rounded-full blur-md" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 h-8 bg-black/45 rounded-full blur-[3px]" />

              {/* House Facade & Door Structure */}
              <div className="relative w-36 h-48 bg-gradient-to-b from-stone-800 via-amber-950/80 to-stone-900 rounded-t-3xl border-4 border-amber-800/90 shadow-2xl overflow-hidden flex flex-col items-center justify-end p-2 group-hover:border-amber-400 transition-colors">
                {/* Tiled Roof Overhang */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-r from-red-900 via-rose-800 to-red-900 border-b-3 border-amber-700 shadow-md flex items-center justify-around text-xs text-amber-300">
                  <span>🏠</span>
                  <span className="font-game text-[10px] font-black tracking-wider text-amber-200">RUANGAN 3D</span>
                  <span>✨</span>
                </div>

                {/* Glowing Open Doorway Interior */}
                <div className="relative w-22 h-34 bg-gradient-to-b from-amber-950 via-amber-900 to-yellow-950 rounded-t-full border-3 border-amber-600 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                  {/* Warm light glow from inside */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-400/35 via-yellow-200/15 to-transparent animate-pulse" />
                  <span className="text-3xl filter drop-shadow-md z-10 transition-transform group-hover:scale-110">
                    {portal.icon || '🚪'}
                  </span>
                  <span className="text-[9px] font-black text-amber-200 font-game z-10 mt-1">
                    MASUK
                  </span>
                </div>

                {/* Doorstep Mat */}
                <div className="w-28 h-4 bg-amber-700 rounded-t border-t-2 border-amber-400 mt-1 shadow flex items-center justify-center text-[8px] text-amber-100 font-bold font-game">
                  WELCOME
                </div>
              </div>

              {/* Floating Portal Label & Prompt */}
              <div className="mt-1 px-3 py-1 bg-slate-900/90 backdrop-blur-sm text-amber-300 rounded-full font-bold text-xs shadow-xl border border-amber-400 font-game flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-sm">{portal.icon || '🚪'}</span>
                <span>{portal.name}</span>
              </div>

              {/* Near Portal Prompt */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    className="absolute -top-10 whitespace-nowrap z-50 pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-xs shadow-2xl border-2 border-white font-game active:scale-95 transition-all ring-4 ring-amber-400/40 animate-bounce">
                      <span>[E]</span>
                      <span>MASUK KE RUANGAN 3D 🚪</span>
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

        {/* LAYER 4H: PLAYER JURUS PROJECTILES (STAR MAGIC BLAST & FIRE DRAGON) */}
        {playerProjectiles.map(proj => (
          <div
            key={proj.id}
            className="absolute pointer-events-none z-[760] flex items-center justify-center will-change-transform"
            style={{
              left: `${proj.x - (proj.type === 'fire_dragon' ? 24 : 16)}px`,
              top: `${proj.y - (proj.type === 'fire_dragon' ? 24 : 16)}px`,
            }}
          >
            {proj.type === 'fire_dragon' ? (
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

        {/* LAYER 8: PLAYER CHARACTER (ROBOT HERO WITH DIVINE AURA & ULTRA-SMOOTH GPU TRANSFORM) */}
        <div
          className="absolute top-0 left-0 will-change-transform pointer-events-none"
          style={{
            zIndex: Math.floor(player.y) + 10,
            opacity: isInvulnerable ? 0.75 : 1,
            transform: `translate3d(${player.x - 50}px, ${player.y - 95}px, 0) rotate(${
              player.vx < -0.8 ? -6 : player.vx > 0.8 ? 6 : 0
            }deg) scale(${
              player.z > 8 ? '0.94, 1.06' : isGroundPounding ? '1.15, 0.82' : '1, 1'
            })`,
            filter: isInvulnerable
              ? 'drop-shadow(0 0 16px rgba(56,189,248,0.95)) drop-shadow(0 0 24px rgba(251,191,36,0.8))'
              : graphicSettings?.heroRimLight
              ? 'drop-shadow(0 0 12px rgba(251,191,36,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
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

          <FacelessCharacter
            gender={character.gender}
            outfitColor={character.outfitColor}
            backpackColor={character.backpackColor}
            hat={character.hat}
            state={player.state}
            facing={player.facing}
            jumpZ={player.z}
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

      {/* GRAND ADVENTURE DISTANCE TRACKER (JALUR PETUALANGAN PANJANG) */}
      <div className="absolute top-14 md:top-16 left-1/2 -translate-x-1/2 z-[750] pointer-events-auto flex flex-col items-center select-none max-w-[94vw]">
        <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-2xl flex items-center gap-2 sm:gap-3.5">
          <div className="flex items-center gap-1 text-[11px] font-black font-game text-amber-300 whitespace-nowrap">
            <span className="text-sm">🧭</span>
            <span className="hidden xs:inline">Jarak:</span>
            <span className="text-white font-mono font-bold">{Math.floor(player.x)}m / {level.worldWidth}m</span>
          </div>

          {/* Mini Journey Track */}
          <div className="relative w-32 xs:w-44 sm:w-64 md:w-80 h-2 bg-slate-800/90 rounded-full border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-100 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              style={{ width: `${Math.min(100, Math.max(0, (player.x / level.worldWidth) * 100))}%` }}
            />
            {/* Zone Markers */}
            {level.zones?.map((z, idx) => (
              <div
                key={z.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[9px] select-none"
                style={{ left: `${(z.startX / level.worldWidth) * 100}%` }}
                title={`Zona ${idx + 1}: ${z.nameId}`}
              >
                📍
              </div>
            ))}
            {/* Animated Mini Robot Pin */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs pointer-events-none transition-all duration-100 select-none drop-shadow"
              style={{ left: `${Math.min(100, Math.max(0, (player.x / level.worldWidth) * 100))}%` }}
            >
              🤖
            </div>
          </div>

          <span className="text-xs" title="Gerbang Finis">🏁</span>
        </div>
      </div>

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

      {/* MOBILE CONTROLS OVERLAY (CLEAN, MINIMAL & TRANSLUCENT WITH DUALSHOCK GLYPHS) */}
      <div className="absolute inset-0 pointer-events-none z-[700] flex flex-col justify-end p-4 md:p-8">
        <div className="w-full flex items-end justify-between">
          {/* Virtual Joystick (Mobile only / Touch) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-slate-950/40 backdrop-blur-sm border-2 border-slate-700/60 flex items-center justify-center pointer-events-auto touch-none shadow-2xl active:bg-slate-950/60 cursor-pointer"
          >
            <div
              className="w-14 h-14 rounded-full bg-white/90 shadow-xl border-2 border-amber-400 flex items-center justify-center transition-transform"
              style={{
                transform: `translate(${joystickThumbPos.x}px, ${joystickThumbPos.y}px)`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-500" />
            </div>
          </div>

          {/* Action Buttons & Quick Jurus Dock */}
          <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
            {/* Quick 6-Superpowers Dock (Mobile / Quick Tap) */}
            <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-2xl">
              <span className="text-[10px] font-black text-amber-300 font-game hidden sm:inline mr-1">6 JURUS:</span>
              {HERO_POWERS.map(pow => {
                const isActive = (activePower || 'star_blast') === pow.id;
                return (
                  <button
                    key={pow.id}
                    onClick={() => {
                      triggerActivePower(pow.id);
                    }}
                    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer active:scale-90 relative ${
                      isActive
                        ? `bg-gradient-to-br ${pow.gradient} text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.9)] scale-110 border-2 border-white ring-2 ring-amber-400/60 font-black`
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                    title={`${pow.name}: ${pow.description}`}
                  >
                    <span>{pow.emoji}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Action Buttons (Sprint, Jurus, Interact & Jump) */}
            <div className="flex items-center gap-2 md:gap-2.5">
              {/* Sprint Turbo Booster Button (PS3 Square ▢ / Shift / Z) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={() => {
                  mobileSprintRef.current = true;
                }}
                onPointerUp={() => {
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
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-3 cursor-pointer ${
                  isSprinting
                    ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white border-white ring-4 ring-cyan-300 animate-pulse'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/50'
                }`}
                title="Lari Cepat / Sprint [Shift / Z / ▢]"
              >
                {graphicSettings?.dualshockPrompts && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-pink-600 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-lg font-game">
                    ▢
                  </span>
                )}
                <span className="text-lg sm:text-xl">🚀</span>
                <span className="font-game text-[8px] sm:text-[9px] uppercase font-black mt-0.5">
                  {isSprinting ? 'TURBO' : 'SPRINT'}
                </span>
              </motion.button>

              {/* Jurus Attack Button (PS3 Circle ◯) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!playerRef.current.isGrounded && playerRef.current.z > 10) {
                    triggerGroundPound();
                  } else {
                    triggerActivePower();
                  }
                }}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-br ${activePowerConfig.gradient} text-slate-950 font-black text-xs shadow-2xl border-3 border-white ring-4 ring-amber-400/40 flex flex-col items-center justify-center active:scale-95 cursor-pointer`}
                title={`${activePowerConfig.name} [F / J / ◯]`}
              >
                {graphicSettings?.dualshockPrompts && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-lg font-game">
                    ◯
                  </span>
                )}
                <span className="text-xl">{activePowerConfig.emoji}</span>
                <span className="font-game text-[8px] uppercase font-black mt-0.5 truncate max-w-[54px] text-center">
                  {activePowerConfig.name.split(' ')[0]}
                </span>
              </motion.button>

              {/* Interact Button (PS3 Cross ✕) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={triggerInteraction}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-3 cursor-pointer ${
                  nearDoorPortal || nearKnowledgePost || nearVocab || nearNpc || nearMiniGameGate
                    ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300 animate-pulse'
                    : 'bg-slate-900/70 text-slate-300 border-slate-700'
                }`}
                title="Aksi Periksa [E / ✕]"
              >
                {graphicSettings?.dualshockPrompts && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-lg font-game">
                    ✕
                  </span>
                )}
                <span className="text-xl">
                  {nearDoorPortal ? '🚪' : nearKnowledgePost ? '📖' : nearNpc ? '💬' : '🔍'}
                </span>
                <span className="font-game text-[9px] uppercase font-black mt-0.5">
                  {nearDoorPortal ? 'MASUK' : nearKnowledgePost ? 'BACA' : nearNpc ? 'BICARA' : 'PERIKSA'}
                </span>
              </motion.button>

              {/* Jump Button (PS3 Triangle △) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={triggerJump}
                className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-slate-900/80 text-white font-bold text-xs shadow-2xl border-3 border-slate-700 flex flex-col items-center justify-center active:scale-95 cursor-pointer hover:border-emerald-400"
                title="Lompat [Spasi / W / △]"
              >
                {graphicSettings?.dualshockPrompts && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center border-2 border-white shadow-lg font-game">
                    △
                  </span>
                )}
                <span className="text-xl">🦘</span>
                <span className="font-game text-[9px] uppercase font-black mt-0.5">LOMPAT</span>
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
    </div>
  );
};
