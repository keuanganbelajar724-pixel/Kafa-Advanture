import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CharacterConfig, VocabItem, PlayerPhysics, RoomConfig } from '../../types/game';
import { audio } from '../../services/audio';
import { FacelessCharacter, UniversalVocabProp } from './VocabProps';

interface Room3DViewProps {
  room: RoomConfig;
  character: CharacterConfig;
  discoveredWords: string[];
  onInteractVocab: (item: VocabItem) => void;
  onCollectCoin: (amount: number) => void;
  onCollectStar: (amount: number) => void;
  onExitRoom: () => void;
}

const GRAVITY = 0.85;
const JUMP_FORCE = 14;
const ROOM_SPEED = 4.8;

export const Room3DView: React.FC<Room3DViewProps> = ({
  room,
  character,
  discoveredWords,
  onInteractVocab,
  onCollectCoin,
  onCollectStar,
  onExitRoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Player position in 3D room coordinates
  const playerRef = useRef<PlayerPhysics>({
    x: room.playerStartX || 450,
    y: room.playerStartY || 440,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    facing: 'right',
    state: 'idle',
    isGrounded: true,
  });
  const [player, setPlayer] = useState<PlayerPhysics>(playerRef.current);

  // Room states
  const [isLampOn, setIsLampOn] = useState<boolean>(true);
  const [isChestOpened, setIsChestOpened] = useState<boolean>(false);
  const [bouncingItemId, setBouncingItemId] = useState<string | null>(null);
  const [dustPuffs, setDustPuffs] = useState<{ id: string; x: number; y: number; scale: number }[]>([]);
  const [floatingScores, setFloatingScores] = useState<{ id: string; x: number; y: number; text: string; color: string }[]>([]);

  // Proximity to objects
  const nearVocabRef = useRef<VocabItem | null>(null);
  const [nearVocab, setNearVocab] = useState<VocabItem | null>(null);
  const [nearDoor, setNearDoor] = useState<boolean>(false);
  const [nearChest, setNearChest] = useState<boolean>(false);

  // Input states
  const keys = useRef<{ [key: string]: boolean }>({});
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumbPos, setJoystickThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastFootstepRef = useRef<number>(0);

  // Spawn Dust helper
  const spawnDust = useCallback((x: number, y: number, scale: number = 1) => {
    const id = `${Date.now()}_${Math.random()}`;
    setDustPuffs(prev => [...prev.slice(-6), { id, x, y, scale }]);
    setTimeout(() => {
      setDustPuffs(prev => prev.filter(d => d.id !== id));
    }, 450);
  }, []);

  // Floating Score Popups helper
  const spawnFloatingScore = useCallback((x: number, y: number, text: string, color: string = '#FBBF24') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1200);
  }, []);

  const handleItemInteract = useCallback((item: VocabItem) => {
    setBouncingItemId(item.id);
    audio.playBlockBump();
    spawnFloatingScore(item.worldPosition.x, item.worldPosition.y - 70, `✨ ${item.word}!`, '#F59E0B');
    setTimeout(() => setBouncingItemId(null), 450);
    onInteractVocab(item);
  }, [onInteractVocab, spawnFloatingScore]);

  const handleOpenChest = useCallback(() => {
    if (isChestOpened) return;
    setIsChestOpened(true);
    audio.playPowerUp();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onCollectCoin(15);
    onCollectStar(1);
    spawnFloatingScore(780, 310, '+15 🪙 +1 ⭐ STAR!', '#FBBF24');
  }, [isChestOpened, onCollectCoin, onCollectStar, spawnFloatingScore]);

  const triggerJump = useCallback(() => {
    if (playerRef.current.isGrounded) {
      audio.playMarioJump();
      playerRef.current.vz = JUMP_FORCE;
      playerRef.current.isGrounded = false;
      playerRef.current.state = 'jumping';
      setPlayer({ ...playerRef.current });
    }
  }, []);

  const triggerInteraction = useCallback(() => {
    if (nearDoor) {
      audio.playInteract();
      onExitRoom();
    } else if (nearChest && !isChestOpened) {
      handleOpenChest();
    } else if (nearVocabRef.current) {
      handleItemInteract(nearVocabRef.current);
    }
  }, [nearDoor, nearChest, isChestOpened, handleOpenChest, handleItemInteract, onExitRoom]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      keys.current[e.code] = true;

      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        triggerInteraction();
      }
      if (e.code === 'Space') {
        triggerJump();
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
  }, [triggerInteraction, triggerJump]);

  // 60FPS Physics Loop for 3D Room Depth Movement
  useEffect(() => {
    let lastTime = performance.now();

    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      const prev = playerRef.current;
      let vx = 0;
      let vy = 0;
      let facing = prev.facing;

      const moveLeft = keys.current['arrowleft'] || keys.current['a'];
      const moveRight = keys.current['arrowright'] || keys.current['d'];
      const moveUp = keys.current['arrowup'] || keys.current['w'];
      const moveDown = keys.current['arrowdown'] || keys.current['s'];

      if (moveLeft) {
        vx = -ROOM_SPEED;
        facing = 'left';
      } else if (moveRight) {
        vx = ROOM_SPEED;
        facing = 'right';
      }

      if (moveUp) {
        vy = -ROOM_SPEED * 0.75; // Walk inward towards back wall
      } else if (moveDown) {
        vy = ROOM_SPEED * 0.75; // Walk forward towards camera
      }

      if (isJoystickActive && (Math.abs(joystickVector.current.x) > 0.15 || Math.abs(joystickVector.current.y) > 0.15)) {
        vx = joystickVector.current.x * ROOM_SPEED;
        vy = joystickVector.current.y * (ROOM_SPEED * 0.75);
        if (Math.abs(joystickVector.current.x) > 0.2) {
          facing = joystickVector.current.x < 0 ? 'left' : 'right';
        }
      }

      let z = prev.z + prev.vz * dt;
      let vz = prev.vz - GRAVITY * dt;
      let isGrounded = false;

      let newX = prev.x + vx * dt;
      let newY = prev.y + vy * dt;

      // Bed bounce & furniture jump surface (X: 120-280, Y: 300-420)
      let surfaceZ = 0;
      let isBedBounce = false;
      if (newX >= 130 && newX <= 300 && newY >= 310 && newY <= 420) {
        surfaceZ = 35; // Bed height
        if (prev.vz < -3 && z <= 38) {
          isBedBounce = true;
        }
      } else if (newX >= 480 && newX <= 640 && newY >= 280 && newY <= 380) {
        surfaceZ = 30; // Study desk height
      }

      let landedThisFrame = false;
      if (isBedBounce) {
        vz = 15; // Trampoline bed bounce!
        z = 40;
        audio.playSpringBounce();
        spawnDust(newX, newY, 1.2);
        spawnFloatingScore(newX, newY - 45, 'BOING! 🛏️', '#38BDF8');
      } else if (surfaceZ > 0) {
        if (!prev.isGrounded && prev.vz < -2) landedThisFrame = true;
        z = surfaceZ;
        vz = 0;
        isGrounded = true;
      } else if (z <= 0) {
        if (!prev.isGrounded && prev.vz < -2) landedThisFrame = true;
        z = 0;
        vz = 0;
        isGrounded = true;
      }

      // Room boundaries (Width 100 to 860, Depth minY 270 to maxY 510)
      newX = Math.max(120, Math.min(840, newX));
      newY = Math.max(room.minY || 280, Math.min(room.maxY || 500, newY));

      let state: PlayerPhysics['state'] = prev.state;
      let shouldSpawnRunDust = false;
      if (!isGrounded) {
        state = 'jumping';
      } else if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
        state = 'walking';
        const now = Date.now();
        if (now - lastFootstepRef.current > 280) {
          lastFootstepRef.current = now;
          audio.playFootstep();
          shouldSpawnRunDust = true;
        }
      } else {
        state = 'idle';
      }

      // Proximity to Room Vocab Items
      let closestItem: VocabItem | null = null;
      let minItemDist = Infinity;
      for (const item of room.vocabItems) {
        const dx = newX - item.worldPosition.x;
        const dy = newY - item.worldPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95 && dist < minItemDist) {
          minItemDist = dist;
          closestItem = item;
        }
      }

      // Proximity to Exit Door (bottom center around X: 450, Y: 490)
      const doorDx = newX - 450;
      const doorDy = newY - 490;
      const isNearDoorNow = Math.sqrt(doorDx * doorDx + doorDy * doorDy) < 85;

      // Proximity to Treasure Chest (X: 780, Y: 330)
      const chestDx = newX - 780;
      const chestDy = newY - 330;
      const isNearChestNow = Math.sqrt(chestDx * chestDx + chestDy * chestDy) < 85;

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

      if (landedThisFrame) {
        spawnDust(newX - 14, newY, 1.1);
        spawnDust(newX + 14, newY, 1.1);
      }
      if (shouldSpawnRunDust) {
        spawnDust(newX - (facing === 'right' ? 18 : -18), newY + 2, 0.75);
      }
      if (closestItem?.id !== nearVocabRef.current?.id) {
        nearVocabRef.current = closestItem;
        setNearVocab(closestItem);
      }
      if (isNearDoorNow !== nearDoor) {
        setNearDoor(isNearDoorNow);
      }
      if (isNearChestNow !== nearChest) {
        setNearChest(isNearChestNow);
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [room, isJoystickActive, spawnDust, spawnFloatingScore, nearDoor, nearChest]);

  // Touch Virtual Joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = touch.clientX - rect.left;
    const startY = touch.clientY - rect.top;
    joystickStartPos.current = { x: startX, y: startY };
    setIsJoystickActive(true);
    setJoystickThumbPos({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickActive) return;
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
    setIsJoystickActive(false);
    setJoystickThumbPos({ x: 0, y: 0 });
    joystickVector.current = { x: 0, y: 0 };
  };

  // Perspective scaling math based on depth Y
  const minY = room.minY || 280;
  const maxY = room.maxY || 500;
  const depthFactor = Math.max(0, Math.min(1, (player.y - minY) / (maxY - minY)));
  const playerScale = 0.82 + depthFactor * 0.38; // 0.82x far at back wall, 1.20x close up

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950 flex items-center justify-center"
      style={{ height: '100dvh' }}
    >
      {/* Ambient Room Lighting Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 z-10 ${isLampOn ? 'bg-amber-400/5' : 'bg-indigo-950/40'}`} />

      {/* 3D PERSPECTIVE ROOM CONTAINER */}
      <div
        className="relative w-[960px] h-[640px] max-w-full max-h-full rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700 bg-stone-900"
        style={{
          perspective: '1200px',
        }}
      >
        {/* ROOM TOP HEADER: Room Name & Exit Button */}
        <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700 text-white shadow-xl">
            <span className="text-xl">🚪</span>
            <div>
              <div className="text-xs font-black text-amber-300 font-game">{room.nameId}</div>
              <div className="text-[10px] text-slate-300">{room.subtitleId}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lamp Toggle Switch */}
            <button
              onClick={() => {
                audio.playButtonClick();
                setIsLampOn(!isLampOn);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 hover:bg-slate-800 text-amber-300 rounded-xl border border-slate-700 text-xs font-bold font-game cursor-pointer active:scale-95 shadow-md"
            >
              <span>{isLampOn ? '💡' : '🌑'}</span>
              <span className="hidden sm:inline">{isLampOn ? 'Lampu: Nyala' : 'Lampu: Mati'}</span>
            </button>

            {/* Exit Room Button */}
            <button
              onClick={() => {
                audio.playButtonClick();
                onExitRoom();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl border border-rose-400 text-xs font-black font-game shadow-xl cursor-pointer active:scale-95 transition-all"
            >
              <span>🚪</span>
              <span>KELUAR</span>
            </button>
          </div>
        </div>

        {/* 3D BACK WALL */}
        <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-b from-stone-800 via-amber-950/40 to-stone-900 border-b-4 border-amber-800/80 overflow-hidden shadow-inner">
          {/* Wallpaper Planks Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_45px)]" />

          {/* Large Window in Back Wall (Dynamic Theme) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-56 h-40 rounded-t-full bg-sky-300 border-4 border-amber-900 shadow-2xl overflow-hidden flex items-end justify-center">
            {room.theme === 'attic' ? (
              <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 relative flex items-center justify-center">
                <div className="absolute top-3 right-6 text-2xl animate-pulse">🌙</div>
                <div className="absolute top-8 left-6 text-xs text-yellow-200 animate-ping">✨</div>
                <div className="absolute top-5 left-16 text-xs text-yellow-200">⭐</div>
                <div className="absolute bottom-2 right-12 text-xs text-yellow-100">✨</div>
              </div>
            ) : room.theme === 'cabin' ? (
              <div className="w-full h-full bg-gradient-to-b from-emerald-800 via-teal-900 to-stone-900 relative">
                <div className="absolute top-3 left-6 text-xl">🌲</div>
                <div className="absolute top-6 right-6 text-2xl">🏔️</div>
                <div className="absolute bottom-0 inset-x-0 h-8 bg-emerald-950 rounded-t-full" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-400 relative">
                <div className="absolute top-3 left-4 text-2xl animate-spin" style={{ animationDuration: '20s' }}>☀️</div>
                <div className="absolute bottom-0 inset-x-0 h-10 bg-emerald-600 rounded-t-full" />
              </div>
            )}
            {/* Window Cross Panes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-1.5 bg-amber-950" />
              <div className="absolute h-full w-1.5 bg-amber-950" />
            </div>
            {/* Sun Rays Spilling Inward onto Floor */}
            <div className="absolute -inset-x-20 top-0 h-[500px] bg-gradient-to-b from-amber-200/25 via-amber-100/10 to-transparent transform -skew-x-12 blur-sm pointer-events-none" />
          </div>

          {/* Wall Clock / Lantern */}
          <div className="absolute top-14 left-20 flex items-center gap-2">
            <div className="w-13 h-13 rounded-full bg-amber-100 border-3 border-amber-900 shadow-md flex items-center justify-center text-xs font-bold text-amber-950 font-game">
              ⏰ 9:00
            </div>
          </div>

          {/* Wall Picture / Trophy */}
          <div className="absolute top-14 right-20 w-18 h-15 rounded-lg bg-amber-950 border-3 border-amber-600 shadow-md flex items-center justify-center text-2xl">
            {room.theme === 'attic' ? '🧭' : room.theme === 'cabin' ? '🦌' : '🖼️'}
          </div>
        </div>

        {/* 3D FLOOR PLANE (Tilted Perspective Depth) */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[360px] bg-gradient-to-b from-stone-900 via-amber-950/60 to-stone-950 border-t-4 border-amber-800 shadow-2xl origin-bottom overflow-hidden"
          style={{
            transform: 'rotateX(18deg)',
          }}
        >
          {/* Parquet Wooden Tiles */}
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,#000,#000_2px,transparent_2px,transparent_60px),repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_60px)]" />

          {/* Cozy Center Persian Rug */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-96 h-56 rounded-3xl bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 border-4 border-amber-400 shadow-2xl flex items-center justify-center opacity-85">
            <div className="w-80 h-44 rounded-2xl border-2 border-amber-300/80 flex flex-col items-center justify-center text-amber-200 font-game">
              <span className="text-xs tracking-wider">✦ {room.nameId.toUpperCase()} ✦</span>
              <span className="text-[10px] text-amber-300/70 mt-0.5">3D Interior Exploration</span>
            </div>
          </div>

          {/* Exit Door Mat at Front (Bottom Center) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-14 rounded-xl bg-amber-600 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center text-amber-950 font-black text-xs font-game">
            <span>🚪 PINTU KELUAR</span>
            <span className="text-[9px] text-amber-950/80">Tekan [E] untuk Keluar</span>
          </div>
        </div>

        {/* THEMED FURNITURE BACKGROUND (e.g. Bed & Study Table if Bedroom, Cabin fireplace if Cabin) */}
        {room.theme === 'bedroom' && (
          <>
            {/* Teak Bed (Top Left - trampoline bounceable) */}
            <div className="absolute flex flex-col items-center group pointer-events-none" style={{ left: '140px', top: '240px', zIndex: 300 }}>
              <div className="w-40 h-10 bg-black/45 rounded-full blur-[4px] absolute bottom-1" />
              <UniversalVocabProp word="BED" />
            </div>

            {/* Study Table with Lamp Toggle (Top Right) */}
            <div className="absolute flex flex-col items-center group pointer-events-none" style={{ left: '500px', top: '230px', zIndex: 300 }}>
              <div className="w-34 h-8 bg-black/45 rounded-full blur-[4px] absolute bottom-1" />
              <div className="relative">
                <UniversalVocabProp word="TABLE" />
                <div className={`absolute -top-10 right-4 text-2xl transition-all ${isLampOn ? 'filter drop-shadow-[0_0_15px_rgba(250,204,21,1)]' : 'opacity-40'}`}>
                  🪔
                </div>
              </div>
            </div>
          </>
        )}

        {room.theme === 'cabin' && (
          <div className="absolute flex flex-col items-center group pointer-events-none" style={{ left: '160px', top: '230px', zIndex: 300 }}>
            <div className="px-4 py-3 bg-stone-800 rounded-2xl border-3 border-amber-800 shadow-xl flex items-center gap-2">
              <span className="text-3xl animate-pulse">🔥</span>
              <div className="text-xs text-amber-300 font-bold font-game">Perapian Kayu</div>
            </div>
          </div>
        )}

        {/* DYNAMIC ROOM VOCABULARY OBJECTS */}
        {room.vocabItems.map((item) => {
          const isNear = nearVocab?.id === item.id;
          const isBouncing = bouncingItemId === item.id;
          const posX = item.worldPosition.x;
          const posY = item.worldPosition.y;

          return (
            <div
              key={item.id}
              onClick={() => handleItemInteract(item)}
              className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto"
              style={{
                left: `${posX - 35}px`,
                top: `${posY - 45}px`,
                zIndex: Math.floor(posY) + 20,
              }}
            >
              <div className="w-20 h-5 bg-black/45 rounded-full blur-[3px] absolute bottom-1" />
              <motion.div
                animate={
                  isBouncing
                    ? { scale: [1, 1.25, 0.9, 1], y: [0, -18, 0] }
                    : isNear
                    ? { scale: 1.1, y: [0, -5, 0] }
                    : {}
                }
                transition={
                  isBouncing
                    ? { duration: 0.35 }
                    : isNear
                    ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
                    : {}
                }
                className={`transition-all ${isNear ? 'filter drop-shadow-[0_0_16px_rgba(251,191,36,0.85)]' : ''}`}
              >
                <UniversalVocabProp word={item.word} />
              </motion.div>

              {/* In-Room Item Badge */}
              <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-game border transition-all ${
                isNear
                  ? 'bg-amber-400 text-slate-950 border-white shadow-xl scale-105'
                  : 'bg-slate-900/85 text-amber-200 border-slate-700 shadow-md'
              }`}>
                {item.word}
              </div>
            </div>
          );
        })}

        {/* SECRET TREASURE CHEST */}
        <div
          onClick={handleOpenChest}
          className="absolute cursor-pointer flex flex-col items-center group pointer-events-auto"
          style={{ left: '760px', top: '290px', zIndex: 340 }}
        >
          <div className="w-22 h-5 bg-black/45 rounded-full blur-[3px] absolute bottom-1" />
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-16 rounded-xl border-3 flex flex-col items-center justify-center text-3xl shadow-xl transition-all ${
              isChestOpened
                ? 'bg-amber-600 border-amber-300'
                : 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.6)] animate-pulse'
            }`}
          >
            <span>{isChestOpened ? '🪙' : '🎁'}</span>
            <span className="text-[9px] font-black text-white font-game">
              {isChestOpened ? 'DIBUKA' : 'PETI'}
            </span>
          </motion.div>
        </div>

        {/* FLOATING POPUP SCORES */}
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

        {/* DUST PARTICLES */}
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

        {/* PLAYER CHARACTER IN 3D ROOM (DYNAMIC PERSPECTIVE DEPTH SCALING) */}
        <div
          className="absolute will-change-transform transition-transform pointer-events-none"
          style={{
            left: `${player.x - 50}px`,
            top: `${player.y - 95 - player.z}px`,
            zIndex: Math.floor(player.y) + 50,
            transform: `scale(${playerScale})`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Contact Shadow with Depth Scale */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-black/45 rounded-full blur-[3px]"
            style={{
              bottom: `${-player.z * 0.2}px`,
              width: `${Math.max(24, 60 - player.z * 0.4)}px`,
              height: '16px',
              opacity: Math.max(0.15, 0.5 - player.z * 0.008),
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

        {/* CONTEXTUAL ACTION PROMPT (WHEN NEAR OBJECT OR DOOR) */}
        <AnimatePresence>
          {(nearVocab || nearDoor || (nearChest && !isChestOpened)) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.85 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
            >
              <button
                onClick={triggerInteraction}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/95 hover:bg-slate-800 text-amber-300 rounded-full font-bold text-xs shadow-2xl border-2 border-amber-400 font-game cursor-pointer active:scale-95 transition-all ring-4 ring-amber-400/30"
              >
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black">
                  [E] / ENTER
                </span>
                <span>
                  {nearDoor
                    ? '🚪 KELUAR KE LUAR'
                    : nearChest
                    ? '🎁 BUKA PETI RAHASIA'
                    : `🔍 PERIKSA ${nearVocab?.word}`}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE CONTROLS OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-[700] flex flex-col justify-end p-4 md:p-8">
        <div className="w-full flex items-end justify-between">
          {/* Virtual Joystick */}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Interact Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerInteraction}
              className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-3 cursor-pointer ${
                nearVocab || nearDoor || nearChest
                  ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300 animate-pulse'
                  : 'bg-slate-900/70 text-slate-300 border-slate-700'
              }`}
            >
              <span className="text-xl">🔍</span>
              <span className="font-game text-[10px] uppercase font-black mt-0.5">AKSI</span>
            </motion.button>

            {/* Jump Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerJump}
              className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-slate-900/70 text-white font-bold text-xs shadow-2xl border-3 border-slate-700 flex flex-col items-center justify-center active:scale-95 cursor-pointer hover:border-emerald-400"
            >
              <span className="text-xl">🦘</span>
              <span className="font-game text-[10px] uppercase font-black mt-0.5">LOMPAT</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
