import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CharacterConfig, VocabItem, RoomConfig } from '../../types/game';
import { audio } from '../../services/audio';

interface Room3DViewProps {
  room: RoomConfig;
  allRooms?: RoomConfig[];
  character: CharacterConfig;
  discoveredWords: string[];
  onInteractVocab: (item: VocabItem) => void;
  onCollectCoin: (amount: number) => void;
  onCollectStar: (amount: number) => void;
  onUpdateCharacter?: (config: CharacterConfig) => void;
  onChangeRoom?: (roomId: string) => void;
  onExitRoom: () => void;
}

type CameraViewMode = 'isometric' | 'orbit' | 'cinematic' | 'firstPerson';
type AtmosphereMode = 'day' | 'sunset' | 'night';

// Helper: Procedural Wood Texture for Floor
function createProceduralWoodTexture(isTile: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (isTile) {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#cbd5e1';
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        if ((x / 64 + y / 64) % 2 === 0) {
          ctx.fillRect(x + 2, y + 2, 60, 60);
        }
      }
    }
  } else {
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 0, 512, 512);

    const plankColors = ['#9a3412', '#78350f', '#a16207', '#b45309', '#713f12'];
    for (let i = 0; i < 8; i++) {
      const y = i * 64;
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(0, y, 512, 60);

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y + 62);
      ctx.lineTo(512, y + 62);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(69, 26, 3, 0.25)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        const gy = y + 10 + g * 12;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(150, gy + 4, 350, gy - 4, 512, gy);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Wallpaper Texture
function createWallpaperTexture(wallColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = wallColorHex || '#fef3c7';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let x = 0; x < 256; x += 32) {
    ctx.fillRect(x, 0, 16, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Sahabat Kafa Wall LED Neon Plaque
function createSahabatKafaSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 140);

  // Gold Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 128);

  // Glowing Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 16;
  ctx.font = '900 38px "Fredoka", "Arial Black", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('👑 SAHABAT KAFA 👑', 256, 50);

  ctx.shadowBlur = 6;
  ctx.font = '700 18px "Fredoka", "Arial", sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.fillText('EDISI PETUALANGAN & BELAJAR SD', 256, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Soccer Ball Texture
function createSoccerBallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  // Black pentagons
  ctx.fillStyle = '#0f172a';
  const pentagons = [
    { x: 128, y: 128, r: 38 },
    { x: 40, y: 40, r: 24 },
    { x: 216, y: 40, r: 24 },
    { x: 40, y: 216, r: 24 },
    { x: 216, y: 216, r: 24 },
  ];

  pentagons.forEach(p => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = p.x + p.r * Math.cos(angle);
      const py = p.y + p.r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Classroom Blackboard Texture
function createClassroomBlackboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Green chalkboard slate background with texture
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle chalk smudges & dust
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 120 + 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden Frame
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 24;
  ctx.strokeRect(12, 12, 1000, 488);

  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 6;
  ctx.strokeRect(26, 26, 972, 460);

  // Chalkboard Headings
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '900 44px "Fredoka", "Arial Black", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.5)';
  ctx.shadowBlur = 12;
  ctx.fillText('👑 SAHABAT KAFA JUARA SD 👑', 512, 45);

  ctx.font = '700 24px "Fredoka", "Arial", sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.shadowBlur = 6;
  ctx.fillText('📚 RUANG KELAS PINTAR & MENYENANGKAN 📚', 512, 100);

  // Chalk Content Columns
  ctx.textAlign = 'left';
  ctx.shadowBlur = 4;

  // Left Column: Math Fun
  ctx.font = '700 28px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🧮 MATEMATIKA CERIA:', 65, 160);

  ctx.font = '600 24px "Courier New", monospace';
  ctx.fillStyle = '#fde047';
  ctx.fillText('• 25 + 75 = 100 🌟', 85, 210);
  ctx.fillText('• 15 × 6  = 90 ⚡', 85, 255);
  ctx.fillText('• 144 ÷ 12 = 12 🎯', 85, 300);
  ctx.fillText('• 2³ = 8 (Hebat!) ✨', 85, 345);

  // Right Column: English Vocab
  ctx.font = '700 28px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('📖 ENGLISH VOCABULARY:', 540, 160);

  ctx.font = '600 24px "Courier New", monospace';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('• TEACHER  = Guru 🧑‍🏫', 560, 210);
  ctx.fillText('• STUDENT  = Murid 🎒', 560, 255);
  ctx.fillText('• DESK     = Meja Belajar 🪑', 560, 300);
  ctx.fillText('• PENCIL   = Pensil ✏️', 560, 345);

  // Footer Chalk Motto
  ctx.textAlign = 'center';
  ctx.font = 'italic 700 26px "Fredoka", sans-serif';
  ctx.fillStyle = '#fbcfe8';
  ctx.fillText('✦ Rajin Membaca, Bertambah Ilmu, Meraih Cita-cita! ✦', 512, 430);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Science Lab Periodic / Poster Texture
function createSciencePosterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  // Cyan Neon Border
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 492);

  ctx.textAlign = 'center';
  ctx.font = '900 32px "Fredoka", sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('⚛️ LAB SAINS ROBOTIK ⚛️', 256, 45);

  ctx.font = '700 16px "Fredoka", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TABEL PERIODIK MINI & ELEKTRON', 256, 85);

  // Mini periodic grid
  const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S'];
  const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc'];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const x = 50 + c * 105;
      const y = 120 + r * 75;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(x, y, 95, 65);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 95, 65);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 24px monospace';
      ctx.fillText(elements[idx], x + 47, y + 28);
      ctx.font = '700 12px monospace';
      ctx.fillText(`${idx + 1}`, x + 47, y + 52);
    }
  }

  ctx.font = 'italic 700 16px sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText('⚡ E = mc² • Molekul & Energi Masa Depan ⚡', 256, 465);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Helper: Procedural Space Viewport Galaxy Texture
function createSpaceViewportTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep space gradient
  const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
  bgGrad.addColorStop(0, '#1e1b4b');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Nebula clouds
  for (let i = 0; i < 6; i++) {
    const nGrad = ctx.createRadialGradient(
      Math.random() * 400 + 50,
      Math.random() * 400 + 50,
      10,
      256,
      256,
      200
    );
    nGrad.addColorStop(0, i % 2 === 0 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(56, 189, 248, 0.25)');
    nGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nGrad;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Twinkling stars
  for (let i = 0; i < 120; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const sr = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.3 ? '#ffffff' : '#fde047';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing ring planet in distance
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(380, 120, 48, 14, Math.PI / 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(380, 120, 22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const Room3DView: React.FC<Room3DViewProps> = ({
  room,
  allRooms,
  character,
  discoveredWords,
  onInteractVocab,
  onCollectCoin,
  onCollectStar,
  onUpdateCharacter,
  onChangeRoom,
  onExitRoom,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Player 3D Physics State
  const playerPosRef = useRef<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vz: number;
    vy: number;
    rotY: number;
    isGrounded: boolean;
  }>({
    x: 0,
    y: 0,
    z: 2.2,
    vx: 0,
    vz: 0,
    vy: 0,
    rotY: Math.PI,
    isGrounded: true,
  });

  // Playable 3D Soccer Ball Physics State on Rug
  const ballPosRef = useRef<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vz: number;
    vy: number;
    rotX: number;
    rotZ: number;
  }>({
    x: -0.8,
    y: 0.22,
    z: 0.8,
    vx: 0,
    vz: 0,
    vy: 0,
    rotX: 0,
    rotZ: 0,
  });

  // Camera & Mode states
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('isometric');
  const [atmosphere, setAtmosphere] = useState<AtmosphereMode>('day');
  const [isLampOn, setIsLampOn] = useState<boolean>(true);
  const [isDiscoMode, setIsDiscoMode] = useState<boolean>(false);
  const [isChestOpened, setIsChestOpened] = useState<boolean>(false);
  const [jukeboxTrack, setJukeboxTrack] = useState<number>(1);
  const [floatingScores, setFloatingScores] = useState<{ id: string; x: number; y: number; text: string; color: string }[]>([]);

  // 3D Mini-Soccer, Sprint & Emote States
  const [goalsScored, setGoalsScored] = useState<number>(0);
  const lastGoalTime = useRef<number>(0);
  const [sprintMode, setSprintMode] = useState<boolean>(false);
  const [isDoingEmote, setIsDoingEmote] = useState<'dance' | 'jurus' | 'kick' | null>(null);
  const [showEmoteMenu, setShowEmoteMenu] = useState<boolean>(false);

  // Proximity states
  const [nearVocab, setNearVocab] = useState<VocabItem | null>(null);
  const [nearDoor, setNearDoor] = useState<boolean>(false);
  const [nearChest, setNearChest] = useState<boolean>(false);
  const [nearLaptop, setNearLaptop] = useState<boolean>(false);
  const [nearBookshelf, setNearBookshelf] = useState<boolean>(false);
  const [nearPet, setNearPet] = useState<boolean>(false);
  const [nearJukebox, setNearJukebox] = useState<boolean>(false);
  const [nearMirror, setNearMirror] = useState<boolean>(false);

  // New Theme Proximities
  const [nearBlackboard, setNearBlackboard] = useState<boolean>(false);
  const [nearLabBench, setNearLabBench] = useState<boolean>(false);
  const [nearFireplace, setNearFireplace] = useState<boolean>(false);
  const [nearBakery, setNearBakery] = useState<boolean>(false);
  const [nearStargazer, setNearStargazer] = useState<boolean>(false);

  const nearVocabRef = useRef<VocabItem | null>(null);
  const nearDoorRef = useRef<boolean>(false);
  const nearChestRef = useRef<boolean>(false);
  const nearLaptopRef = useRef<boolean>(false);
  const nearBookshelfRef = useRef<boolean>(false);
  const nearPetRef = useRef<boolean>(false);
  const nearJukeboxRef = useRef<boolean>(false);
  const nearMirrorRef = useRef<boolean>(false);

  const nearBlackboardRef = useRef<boolean>(false);
  const nearLabBenchRef = useRef<boolean>(false);
  const nearFireplaceRef = useRef<boolean>(false);
  const nearBakeryRef = useRef<boolean>(false);
  const nearStargazerRef = useRef<boolean>(false);

  // Modals for special interactive 3D items & Stations
  const [activeLaptopModal, setActiveLaptopModal] = useState<boolean>(false);
  const [activeBookshelfModal, setActiveBookshelfModal] = useState<boolean>(false);
  const [activeMirrorModal, setActiveMirrorModal] = useState<boolean>(false);
  const [laptopQuizAnswered, setLaptopQuizAnswered] = useState<boolean>(false);

  const [activeBlackboardModal, setActiveBlackboardModal] = useState<boolean>(false);
  const [blackboardQuizAnswered, setBlackboardQuizAnswered] = useState<boolean>(false);
  const [activeLabModal, setActiveLabModal] = useState<boolean>(false);
  const [labExperimentMixed, setLabExperimentMixed] = useState<boolean>(false);
  const [activeFireplaceModal, setActiveFireplaceModal] = useState<boolean>(false);
  const [activeBakeryModal, setActiveBakeryModal] = useState<boolean>(false);
  const [activeStargazerModal, setActiveStargazerModal] = useState<boolean>(false);
  const [activeRoomSelectModal, setActiveRoomSelectModal] = useState<boolean>(false);

  // Mobile virtual joystick states
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Orbit drag tracking
  const isDraggingOrbit = useRef<boolean>(false);
  const orbitAngle = useRef<{ theta: number; phi: number }>({ theta: Math.PI / 4, phi: Math.PI / 3.8 });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sound throttles
  const lastFootstep = useRef<number>(0);
  const lastKickTime = useRef<number>(0);

  // Floating score spawner
  const spawnScore = useCallback((text: string, color: string = '#FBBF24', xOffset: number = 0, yOffset: number = 0) => {
    const id = `${Date.now()}_${Math.random()}`;
    const cx = window.innerWidth / 2 + xOffset;
    const cy = window.innerHeight / 2 + yOffset;
    setFloatingScores(prev => [...prev, { id, x: cx, y: cy, text, color }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1400);
  }, []);

  // Interaction handlers
  const handleItemInteract = useCallback((item: VocabItem) => {
    audio.playBlockBump();
    spawnScore(`✨ ${item.word.toUpperCase()}! (${item.translation})`, '#F59E0B', 0, -60);
    onInteractVocab(item);
  }, [onInteractVocab, spawnScore]);

  const handleOpenChest = useCallback(() => {
    if (isChestOpened) return;
    setIsChestOpened(true);
    audio.playPowerUp();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
    onCollectCoin(20);
    onCollectStar(1);
    spawnScore('+20 🪙 +1 ⭐ BINTANG EMAS!', '#FBBF24', 0, -80);
  }, [isChestOpened, onCollectCoin, onCollectStar, spawnScore]);

  const handlePetInteract = useCallback(() => {
    audio.playPowerUp();
    audio.speakSahabatKafaVoice('Halo Sahabat Kafa! Terus semangat belajar!');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    spawnScore('💖 +10 XP Sahabat Kafa Robo-Pet!', '#EC4899', 40, -50);
  }, [spawnScore]);

  const handleJukeboxInteract = useCallback(() => {
    const nextTrack = (jukeboxTrack % 3) + 1;
    setJukeboxTrack(nextTrack);
    audio.playJukeboxTune(nextTrack);
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.55 } });
    spawnScore(`🎵 LAGU #${nextTrack} DIPUTAR! 📻 +5 XP`, '#A855F7', 0, -60);
  }, [jukeboxTrack, spawnScore]);

  const triggerJump = useCallback(() => {
    if (playerPosRef.current.isGrounded) {
      audio.playMarioJump();
      playerPosRef.current.vy = 8.5;
      playerPosRef.current.isGrounded = false;
    }
  }, []);

  const triggerInteraction = useCallback(() => {
    if (nearDoorRef.current) {
      audio.playInteract();
      onExitRoom();
    } else if (nearChestRef.current && !isChestOpened) {
      handleOpenChest();
    } else if (nearJukeboxRef.current) {
      handleJukeboxInteract();
    } else if (nearMirrorRef.current) {
      audio.playButtonClick();
      setActiveMirrorModal(true);
    } else if (nearLaptopRef.current) {
      audio.playButtonClick();
      setActiveLaptopModal(true);
    } else if (nearBookshelfRef.current) {
      audio.playButtonClick();
      setActiveBookshelfModal(true);
      audio.speak("Piece of cake! That means very easy!");
    } else if (nearBlackboardRef.current) {
      audio.playButtonClick();
      setActiveBlackboardModal(true);
    } else if (nearLabBenchRef.current) {
      audio.playButtonClick();
      setActiveLabModal(true);
    } else if (nearFireplaceRef.current) {
      audio.playPowerUp();
      confetti({ particleCount: 35, spread: 60 });
      spawnScore('🔥 HANGATKAN DIRI DI PERAPIAN! +15 XP', '#F97316', 0, -60);
      setActiveFireplaceModal(true);
    } else if (nearBakeryRef.current) {
      audio.playButtonClick();
      setActiveBakeryModal(true);
    } else if (nearStargazerRef.current) {
      audio.playButtonClick();
      setActiveStargazerModal(true);
    } else if (nearPetRef.current) {
      handlePetInteract();
    } else if (nearVocabRef.current) {
      handleItemInteract(nearVocabRef.current);
    }
  }, [isChestOpened, handleOpenChest, handleJukeboxInteract, handleItemInteract, handlePetInteract, onExitRoom]);

  // Emote Action Handlers (Dance, Jurus Sahabat Kafa, Rocket Kick)
  const handlePerformEmote = useCallback((emoteType: 'dance' | 'jurus' | 'kick') => {
    setIsDoingEmote(emoteType);
    setShowEmoteMenu(false);

    if (emoteType === 'dance') {
      audio.playPowerUp();
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
      spawnScore('🕺 JOGET KEREN 3D! +10 XP', '#EC4899', 0, -70);
      setTimeout(() => setIsDoingEmote(null), 1800);
    } else if (emoteType === 'jurus') {
      audio.playSahabatKafaPower();
      audio.speakSahabatKafaVoice('Jurus Sahabat Kafa! Pantang Menyerah!');
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.55 } });
      spawnScore('👑 JURUS SAHABAT KAFA 3D! +20 XP', '#F59E0B', 0, -80);
      setTimeout(() => setIsDoingEmote(null), 2200);
    } else if (emoteType === 'kick') {
      // Launch soccer ball towards goal (goal is at X: 4.8, Z: 0.5)
      const b = ballPosRef.current;
      const dx = 4.8 - b.x;
      const dz = 0.5 - b.z;
      const dist = Math.sqrt(dx * dx + dz * dz) || 1;
      b.vx = (dx / dist) * 10.5;
      b.vz = (dz / dist) * 10.5;
      b.vy = 4.2;
      audio.playKickBall();
      spawnScore('🚀 TENDANGAN ROKET 3D! ⚽', '#38BDF8', 30, -60);
      setTimeout(() => setIsDoingEmote(null), 1200);
    }
  }, [spawnScore]);

  // Touch joystick handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    joystickStart.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    setIsJoystickActive(true);
    setJoystickThumb({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickActive) return;
    const t = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = t.clientX - rect.left;
    const curY = t.clientY - rect.top;
    const dx = curX - joystickStart.current.x;
    const dy = curY - joystickStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 45;
    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const clamped = Math.min(dist, maxRadius);
      const tx = Math.cos(angle) * clamped;
      const ty = Math.sin(angle) * clamped;
      setJoystickThumb({ x: tx, y: ty });
      joystickVector.current = { x: tx / maxRadius, y: ty / maxRadius };
    }
  };

  const handleTouchEnd = () => {
    setIsJoystickActive(false);
    setJoystickThumb({ x: 0, y: 0 });
    joystickVector.current = { x: 0, y: 0 };
  };

  // Keyboard controls
  useEffect(() => {
    const activeKeys: { [key: string]: boolean } = {};

    const onKeyDown = (e: KeyboardEvent) => {
      activeKeys[e.key.toLowerCase()] = true;
      activeKeys[e.code] = true;

      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        triggerInteraction();
      }
      if (e.code === 'Space') {
        triggerJump();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      activeKeys[e.key.toLowerCase()] = false;
      activeKeys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    (window as unknown as { _roomKeys: { [key: string]: boolean } })._roomKeys = activeKeys;

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      delete (window as unknown as { _roomKeys?: { [key: string]: boolean } })._roomKeys;
    };
  }, [triggerInteraction, triggerJump]);

  // Pointer Drag for 360 Orbit Camera
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.joystick-container')) return;
    isDraggingOrbit.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingOrbit.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    orbitAngle.current.theta -= dx * 0.008;
    orbitAngle.current.phi = Math.max(0.4, Math.min(Math.PI / 2.1, orbitAngle.current.phi - dy * 0.008));
  };

  const handlePointerUp = () => {
    isDraggingOrbit.current = false;
  };

  // -------------------------------------------------------------
  // THREE.JS SCENE SETUP & ANIMATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    
    let bgHex = 0x0f172a;
    let hemiSky = 0xffeedd;
    let hemiGround = 0x334466;
    let dirColor = 0xfff7ed;
    let dirIntensity = 1.35;
    let windowGlow = 0x38bdf8;
    let particleColor = 0xfde047;

    if (atmosphere === 'sunset') {
      bgHex = 0x2e1065;
      hemiSky = 0xfb923c;
      hemiGround = 0x3b0764;
      dirColor = 0xf97316;
      dirIntensity = 1.5;
      windowGlow = 0xf43f5e;
      particleColor = 0xfb923c;
    } else if (atmosphere === 'night') {
      bgHex = 0x030712;
      hemiSky = 0x1e1b4b;
      hemiGround = 0x020617;
      dirColor = 0x60a5fa;
      dirIntensity = 0.65;
      windowGlow = 0x818cf8;
      particleColor = 0x38bdf8;
    }

    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 11);
    camera.lookAt(0, 1, 0);

    // 2. Renderer with PCF Soft Shadows & SRGB Color Space
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = atmosphere === 'night' ? 1.3 : 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(hemiSky, hemiGround, atmosphere === 'night' ? 0.45 : 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(dirColor, dirIntensity);
    dirLight.position.set(7, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -7;
    dirLight.shadow.camera.right = 7;
    dirLight.shadow.camera.top = 7;
    dirLight.shadow.camera.bottom = -7;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Lamp Warm PointLight (Toggleable)
    const lampLight = new THREE.PointLight(0xf59e0b, isLampOn ? (atmosphere === 'night' ? 3.6 : 2.8) : 0.2, 12, 1.8);
    lampLight.position.set(2.8, 2.6, -2.6);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // Rotating Disco Spotlights
    const discoLight1 = new THREE.PointLight(0xef4444, isDiscoMode ? 2.5 : 0, 10, 2);
    discoLight1.position.set(0, 4.2, 0);
    scene.add(discoLight1);

    const discoLight2 = new THREE.PointLight(0x38bdf8, isDiscoMode ? 2.5 : 0, 10, 2);
    discoLight2.position.set(0, 4.2, 0);
    scene.add(discoLight2);

    // Ambient Floating Light Motes / Sparkles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 1] = Math.random() * 5 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Room Geometry & Textures
    const floorTexture = createProceduralWoodTexture(room.floorPattern === 'tile');
    const wallTexture = createWallpaperTexture(room.wallColor);

    // Floor Mesh
    const floorGeo = new THREE.BoxGeometry(11, 0.4, 9);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.4,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.2, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Center Persian Rug
    const rugGeo = new THREE.BoxGeometry(5.2, 0.03, 3.8);
    const rugMat = new THREE.MeshStandardMaterial({
      color: room.theme === 'lab' ? 0x0e7490 : room.theme === 'classroom' ? 0x065f46 : (atmosphere === 'night' ? 0x6b21a8 : 0x991b1b),
      roughness: 0.9,
    });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.position.set(0, 0.015, 0.3);
    rugMesh.receiveShadow = true;
    scene.add(rugMesh);

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(11, 5.5, 0.3);
    const backWallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.65,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 2.55, -4.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Sahabat Kafa Official 3D LED Wall Plaque
    const signTexture = createSahabatKafaSignTexture();
    const signGeo = new THREE.BoxGeometry(3.6, 0.95, 0.08);
    const signMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      emissive: 0xf59e0b,
      emissiveMap: signTexture,
      emissiveIntensity: atmosphere === 'night' ? 0.75 : 0.45,
      roughness: 0.25,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 4.3, -4.32);
    scene.add(signMesh);

    // Baseboard trim
    const baseboardGeo = new THREE.BoxGeometry(11, 0.35, 0.08);
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3 });
    const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
    baseboard.position.set(0, 0.175, -4.34);
    scene.add(baseboard);

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.3, 5.5, 9);
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(room.wallColor || '#fef3c7').multiplyScalar(0.9),
      roughness: 0.65,
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-5.5, 2.55, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Left Wall Window (Composite 3D Frame)
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-5.32, 2.8, -1.0);
    const winFrameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.4, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
    );
    windowGroup.add(winFrameOuter);

    const glassPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.2, 1.8),
      new THREE.MeshStandardMaterial({
        color: windowGlow,
        emissive: windowGlow,
        emissiveIntensity: atmosphere === 'night' ? 0.5 : 0.3,
        roughness: 0.1,
      })
    );
    windowGroup.add(glassPane);
    scene.add(windowGroup);

    // Front Exit Doorway at (Z: +4.3, X: 0)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, 4.3);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.2), doorMat);
    doorFrame.position.set(0, 1.7, 0);
    doorGroup.add(doorFrame);

    const doorMatMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.04, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
    );
    doorMatMesh.position.set(0, 0.02, -0.6);
    doorGroup.add(doorMatMesh);
    scene.add(doorGroup);

    // 5. COMPOSITE 3D FURNITURE & SPECIAL STATIONS
    const furnitureGroup = new THREE.Group();

    // Chest with Animated Hinge at (X: 3.4, Z: 2.0)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(3.4, 0, 2.0);

    const chestBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4, metalness: 0.2 })
    );
    chestBase.position.set(0, 0.35, 0);
    chestBase.castShadow = true;
    chestBase.receiveShadow = true;
    chestGroup.add(chestBase);

    const chestTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.72, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85 })
    );
    chestTrim.position.set(0, 0.35, 0);
    chestGroup.add(chestTrim);

    const chestLidPivot = new THREE.Group();
    chestLidPivot.position.set(0, 0.7, -0.4);
    const chestLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 1.22, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.3, metalness: 0.3 })
    );
    chestLid.rotation.z = Math.PI / 2;
    chestLid.position.set(0, 0, 0.4);
    chestLid.castShadow = true;
    chestLidPivot.add(chestLid);
    chestGroup.add(chestLidPivot);
    scene.add(chestGroup);

    // Interactive 3D Jukebox / Music Station at (X: 3.8, Z: -0.4)
    const jukeboxGroup = new THREE.Group();
    jukeboxGroup.position.set(3.8, 0, -0.4);

    const jukeBoxBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.3, metalness: 0.5 })
    );
    jukeBoxBody.position.set(0, 0.75, 0);
    jukeBoxBody.castShadow = true;
    jukeboxGroup.add(jukeBoxBody);

    const jukeGrill = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xa855f7, emissiveIntensity: 0.7 })
    );
    jukeGrill.position.set(0, 0.65, 0.42);
    jukeboxGroup.add(jukeGrill);

    const jukeRecord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.04, 20),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.1 })
    );
    jukeRecord.position.set(0, 1.52, 0);
    jukeboxGroup.add(jukeRecord);

    furnitureGroup.add(jukeboxGroup);

    // Interactive 3D Wardrobe / Dressing Mirror at (X: -4.8, Z: 1.4)
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(-4.8, 0, 1.4);

    const wardrobeFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 3.2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
    );
    wardrobeFrame.position.set(0, 1.6, 0);
    wardrobeFrame.castShadow = true;
    mirrorGroup.add(wardrobeFrame);

    // Glass Mirror Pane
    const mirrorPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.6, 1.1),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.05,
        emissive: 0x94a3b8,
        emissiveIntensity: 0.2,
      })
    );
    mirrorPane.position.set(0.32, 1.6, 0);
    mirrorGroup.add(mirrorPane);

    furnitureGroup.add(mirrorGroup);

    // Thematic 3D Furniture models & Environment elements
    let dynamicHoloAtom: THREE.Group | null = null;
    let dynamicFireLight: THREE.PointLight | null = null;
    let dynamicEarthPlanet: THREE.Mesh | null = null;

    if (room.theme === 'bedroom') {
      // 3D Bed (Trampoline Bounceable!) at X: -2.8, Z: -2.2
      const bedGroup = new THREE.Group();
      bedGroup.position.set(-2.8, 0, -2.2);

      const bedFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.45, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.35 })
      );
      bedFrame.position.set(0, 0.3, 0);
      bedFrame.castShadow = true;
      bedFrame.receiveShadow = true;
      bedGroup.add(bedFrame);

      const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.6, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.3 })
      );
      headboard.position.set(0, 1.0, -1.7);
      headboard.castShadow = true;
      bedGroup.add(headboard);

      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.4, 3.1),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 })
      );
      mattress.position.set(0, 0.65, 0.1);
      mattress.castShadow = true;
      bedGroup.add(mattress);

      const duvet = new THREE.Mesh(
        new THREE.BoxGeometry(2.22, 0.16, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 })
      );
      duvet.position.set(0, 0.82, 0.7);
      duvet.castShadow = true;
      bedGroup.add(duvet);

      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.22, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 })
      );
      pillow.position.set(0, 0.82, -1.05);
      pillow.castShadow = true;
      bedGroup.add(pillow);

      furnitureGroup.add(bedGroup);

      // Study Desk & Laptop at X: 2.8, Z: -2.6
      const deskGroup = new THREE.Group();
      deskGroup.position.set(2.8, 0, -2.6);

      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.12, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 })
      );
      deskTop.position.set(0, 1.3, 0);
      deskTop.castShadow = true;
      deskGroup.add(deskTop);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
      for (const lx of [-1.05, 1.05]) {
        for (const lz of [-0.55, 0.55]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), legMat);
          leg.position.set(lx, 0.65, lz);
          leg.castShadow = true;
          deskGroup.add(leg);
        }
      }

      // Interactive 3D Laptop
      const laptopBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.03, 0.48),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.2 })
      );
      laptopBase.position.set(0, 1.38, 0);
      deskGroup.add(laptopBase);

      const laptopScreenMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
      });
      const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.02), laptopScreenMat);
      laptopScreen.position.set(0, 1.6, -0.22);
      laptopScreen.rotation.x = -0.2;
      deskGroup.add(laptopScreen);

      // Vintage Table Lamp
      const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 })
      );
      lampBase.position.set(0.85, 1.39, -0.3);
      deskGroup.add(lampBase);

      const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.35, 16, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: isLampOn ? 0xf59e0b : 0x000000,
          emissiveIntensity: isLampOn ? 0.8 : 0,
          roughness: 0.3,
        })
      );
      lampShade.position.set(0.85, 1.75, -0.3);
      lampShade.name = 'lampShade';
      deskGroup.add(lampShade);

      furnitureGroup.add(deskGroup);

      // Bookshelf with rows of colorful books at X: 4.6, Z: -2.2
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(4.6, 0, -2.2);
      const shelfFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 3.4, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
      );
      shelfFrame.position.set(0, 1.7, 0);
      shelfFrame.castShadow = true;
      shelfGroup.add(shelfFrame);

      const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
      for (let s = 0; s < 3; s++) {
        const sy = 0.8 + s * 0.9;
        for (let b = 0; b < 6; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.55 + (b % 3) * 0.06, 0.12),
            new THREE.MeshStandardMaterial({ color: bookColors[b % bookColors.length], roughness: 0.5 })
          );
          book.position.set(-0.05, sy, -0.6 + b * 0.22);
          shelfGroup.add(book);
        }
      }
      furnitureGroup.add(shelfGroup);
    } else if (room.theme === 'classroom') {
      // 1. Large 3D Classroom Blackboard on Center Back Wall
      const boardTex = createClassroomBlackboardTexture();
      const boardMesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 2.5, 0.08),
        new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.8 })
      );
      boardMesh.position.set(0, 2.7, -4.32);
      boardMesh.castShadow = true;
      boardMesh.receiveShadow = true;
      furnitureGroup.add(boardMesh);

      // Chalk ledge with chalk sticks & eraser
      const ledgeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.08, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
      );
      ledgeMesh.position.set(0, 1.42, -4.24);
      furnitureGroup.add(ledgeMesh);

      // 2. Teacher's Podium & Desk at X: 0, Z: -2.6
      const teacherDesk = new THREE.Group();
      teacherDesk.position.set(0, 0, -2.6);

      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.14, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.3 })
      );
      deskTop.position.set(0, 1.3, 0);
      deskTop.castShadow = true;
      teacherDesk.add(deskTop);

      for (const lx of [-1.25, 1.25]) {
        for (const lz of [-0.5, 0.5]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
          leg.position.set(lx, 0.65, lz);
          teacherDesk.add(leg);
        }
      }

      // Spinning 3D Earth Globe on Desk
      const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
      globeBase.position.set(0.9, 1.4, -0.2);
      teacherDesk.add(globeBase);

      const globeRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
      globeRing.position.set(0.9, 1.62, -0.2);
      globeRing.rotation.z = Math.PI / 4;
      teacherDesk.add(globeRing);

      const globeBall = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
      globeBall.position.set(0.9, 1.62, -0.2);
      teacherDesk.add(globeBall);

      // Golden Trophy Cup on Desk
      const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      trophyBase.position.set(-0.9, 1.42, -0.2);
      teacherDesk.add(trophyBase);
      const trophyCup = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 }));
      trophyCup.position.set(-0.9, 1.58, -0.2);
      trophyCup.rotation.x = Math.PI;
      teacherDesk.add(trophyCup);

      // Red Apple on Teacher's Desk
      const appleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
      appleMesh.position.set(0, 1.45, 0.2);
      teacherDesk.add(appleMesh);

      furnitureGroup.add(teacherDesk);

      // 3. Student Desks & Chairs (Left & Right)
      for (const sx of [-2.6, 2.6]) {
        for (const sz of [-0.6, 1.2]) {
          const sDesk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.9), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
          sDesk.position.set(sx, 1.0, sz);
          sDesk.castShadow = true;
          furnitureGroup.add(sDesk);

          // Notebook on student desk
          const noteBook = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.45), new THREE.MeshStandardMaterial({ color: sx > 0 ? 0x38bdf8 : 0xec4899 }));
          noteBook.position.set(sx + 0.2, 1.06, sz);
          furnitureGroup.add(noteBook);

          // Chair
          const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
          chairSeat.position.set(sx, 0.55, sz + 0.65);
          furnitureGroup.add(chairSeat);

          const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.08), new THREE.MeshStandardMaterial({ color: 0x78350f }));
          chairBack.position.set(sx, 0.95, sz + 1.0);
          furnitureGroup.add(chairBack);
        }
      }
    } else if (room.theme === 'lab') {
      // 1. Central Hologram Hexagonal Pedestal at X: 0, Z: -1.8
      const holoPed = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.3, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
      );
      holoPed.position.set(0, 0.2, -1.8);
      holoPed.castShadow = true;
      furnitureGroup.add(holoPed);

      const holoRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.04, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.9 })
      );
      holoRing.rotation.x = Math.PI / 2;
      holoRing.position.set(0, 0.42, -1.8);
      furnitureGroup.add(holoRing);

      // Rotating 3D Holographic Wireframe Atom
      const atomGroup = new THREE.Group();
      atomGroup.position.set(0, 1.6, -1.8);

      const atomCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x22d3ee, emissiveIntensity: 1.0, roughness: 0.1 })
      );
      atomGroup.add(atomCore);

      const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8, wireframe: true });
      for (let r = 0; r < 3; r++) {
        const oRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 6, 24), ringMat);
        oRing.rotation.set((r * Math.PI) / 3, (r * Math.PI) / 4, 0);
        atomGroup.add(oRing);

        // Orbiting electron sphere
        const electron = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        electron.position.set(Math.cos(r * 2) * 0.65, Math.sin(r * 2) * 0.65, 0);
        oRing.add(electron);
      }
      furnitureGroup.add(atomGroup);
      dynamicHoloAtom = atomGroup;

      // 2. Twin Stainless Steel Chemistry Benches (Left & Right)
      for (const bx of [-2.8, 2.8]) {
        const cBench = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 1.25, 1.3),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.7 })
        );
        cBench.position.set(bx, 0.62, -2.5);
        cBench.castShadow = true;
        furnitureGroup.add(cBench);

        // Flasks with glowing liquids
        const flaskColors = bx < 0 ? [0x10b981, 0x06b6d4] : [0xec4899, 0xf59e0b];
        flaskColors.forEach((col, idx) => {
          const fx = bx + (idx === 0 ? -0.5 : 0.5);
          const flask = new THREE.Mesh(
            new THREE.ConeGeometry(0.16, 0.35, 12),
            new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.85, transparent: true, opacity: 0.85 })
          );
          flask.position.set(fx, 1.42, -2.5);
          furnitureGroup.add(flask);

          const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.6 }));
          neck.position.set(fx, 1.62, -2.5);
          furnitureGroup.add(neck);
        });

        // Bunsen burner with blue flame
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 }));
        burner.position.set(bx, 1.36, -2.2);
        furnitureGroup.add(burner);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        flame.position.set(bx, 1.54, -2.2);
        furnitureGroup.add(flame);
      }

      // Science Periodic Poster on Wall
      const posterTex = createSciencePosterTexture();
      const posterMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 0.05), new THREE.MeshStandardMaterial({ map: posterTex }));
      posterMesh.position.set(4.6, 2.6, -4.35);
      furnitureGroup.add(posterMesh);
    } else if (room.theme === 'cabin' || room.theme === 'treehouse') {
      // 1. Cozy Cobblestone Brick Fireplace at Center Back Wall
      const fireGroup = new THREE.Group();
      fireGroup.position.set(0, 0, -4.1);

      const hearth = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 2.6, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.9 })
      );
      hearth.position.set(0, 1.3, 0);
      hearth.castShadow = true;
      fireGroup.add(hearth);

      // Fireplace mantel shelf
      const mantel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 1.1), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }));
      mantel.position.set(0, 2.6, 0);
      fireGroup.add(mantel);

      // Firebox opening
      const firebox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 }));
      firebox.position.set(0, 0.8, 0.28);
      fireGroup.add(firebox);

      // Glowing Firewood Logs & Embers
      const logMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
      for (let lg = 0; lg < 3; lg++) {
        const fireLog = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.2, 8), logMat);
        fireLog.rotation.z = Math.PI / 2 + (lg - 1) * 0.25;
        fireLog.position.set(0, 0.3 + lg * 0.08, 0.3);
        fireGroup.add(fireLog);
      }

      // Animated Fire Flame Core
      const flameCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 0.8, 10),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      flameCore.position.set(0, 0.7, 0.35);
      fireGroup.add(flameCore);

      const flameInner = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.5, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      flameInner.position.set(0, 0.65, 0.38);
      fireGroup.add(flameInner);

      // Warm Fireplace Point Light
      const fireLight = new THREE.PointLight(0xf97316, 2.5, 9);
      fireLight.position.set(0, 1.0, 0.8);
      fireLight.castShadow = true;
      fireGroup.add(fireLight);
      dynamicFireLight = fireLight;

      furnitureGroup.add(fireGroup);

      // 2. Rustic Rocking Chair & Log Table
      const chairGroup = new THREE.Group();
      chairGroup.position.set(-2.4, 0, -1.8);
      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
      chairSeat.position.set(0, 0.6, 0);
      chairGroup.add(chairSeat);
      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 }));
      chairBack.position.set(0, 1.2, -0.55);
      chairGroup.add(chairBack);
      furnitureGroup.add(chairGroup);

      const rusticTable = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.4 }));
      rusticTable.position.set(2.4, 1.1, -2.0);
      furnitureGroup.add(rusticTable);
    } else if (room.theme === 'cafe') {
      // 1. Bakery Display Glass Showcase at X: -2.2, Z: -2.4
      const cafeCase = new THREE.Group();
      cafeCase.position.set(-2.2, 0, -2.4);

      const caseBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 1.2), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }));
      caseBase.position.set(0, 0.5, 0);
      cafeCase.add(caseBase);

      const caseGlass = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.8, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.4, roughness: 0.1 })
      );
      caseGlass.position.set(0, 1.4, 0);
      cafeCase.add(caseGlass);

      // 3D Glazed Strawberry Donuts inside showcase
      const donutColors = [0xf43f5e, 0xec4899, 0xd97706];
      donutColors.forEach((dc, di) => {
        const donut = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.07, 10, 20),
          new THREE.MeshStandardMaterial({ color: dc, roughness: 0.3 })
        );
        donut.rotation.x = Math.PI / 2;
        donut.position.set(-0.7 + di * 0.7, 1.15, 0);
        cafeCase.add(donut);
      });

      // Tiered Strawberry Birthday Cake
      const cakeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xfdf2e8 }));
      cakeBase.position.set(0.6, 1.5, 0);
      cafeCase.add(cakeBase);
      const cakeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      cakeTop.position.set(0.6, 1.66, 0);
      cafeCase.add(cakeTop);

      furnitureGroup.add(cafeCase);

      // 2. Round Bistro Table & Chairs at X: 2.4, Z: -1.2
      const bistroTable = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 }));
      bistroTable.position.set(2.4, 1.1, -1.2);
      furnitureGroup.add(bistroTable);

      const coffeeCup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      coffeeCup.position.set(2.4, 1.2, -1.2);
      furnitureGroup.add(coffeeCup);
    } else if (room.theme === 'cockpit' || room.id.includes('vault') || room.id.includes('cockpit')) {
      // 1. Futuristic Space Panoramic Viewport Window at Back Wall
      const spaceTex = createSpaceViewportTexture();
      const viewportMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 2.8, 0.1),
        new THREE.MeshStandardMaterial({ map: spaceTex, roughness: 0.1, emissive: 0x1e1b4b, emissiveIntensity: 0.5 })
      );
      viewportMesh.position.set(0, 2.7, -4.32);
      furnitureGroup.add(viewportMesh);

      // Rotating 3D Earth planet visible in viewport
      const earthGeo = new THREE.SphereGeometry(0.48, 20, 20);
      const earthMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, emissive: 0x0369a1, emissiveIntensity: 0.3 });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      earthMesh.position.set(1.6, 2.8, -4.0);
      furnitureGroup.add(earthMesh);
      dynamicEarthPlanet = earthMesh;

      // 2. Space Cockpit Console & Command Seats at X: 0, Z: -2.6
      const consoleMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.1, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
      );
      consoleMesh.position.set(0, 0.55, -2.6);
      furnitureGroup.add(consoleMesh);

      // Holographic navigation monitors
      for (const mx of [-1.2, 1.2]) {
        const monitor = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.6, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 })
        );
        monitor.position.set(mx, 1.35, -2.5);
        monitor.rotation.x = -0.2;
        furnitureGroup.add(monitor);
      }

      // Pilot Command Chairs
      for (const cx of [-0.9, 0.9]) {
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.7), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
        chair.position.set(cx, 0.7, -1.4);
        furnitureGroup.add(chair);
      }
    } else {
      // Secret Attic theme: Stacked antique crates, vintage trunk & astronomical telescope
      const crateGroup = new THREE.Group();
      crateGroup.position.set(-2.8, 0, -2.4);
      for (let cr = 0; cr < 3; cr++) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.1), new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 }));
        crate.position.set((cr - 1) * 0.7, 0.45 + cr * 0.3, (cr % 2) * 0.3);
        crateGroup.add(crate);
      }
      furnitureGroup.add(crateGroup);

      // Brass Astronomical Telescope on Tripod
      const teleGroup = new THREE.Group();
      teleGroup.position.set(2.8, 0, -2.4);
      for (let leg = 0; leg < 3; leg++) {
        const ang = (leg * Math.PI * 2) / 3;
        const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        tLeg.position.set(Math.cos(ang) * 0.4, 0.9, Math.sin(ang) * 0.4);
        tLeg.rotation.x = Math.sin(ang) * 0.25;
        tLeg.rotation.z = -Math.cos(ang) * 0.25;
        teleGroup.add(tLeg);
      }
      const teleTube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 }));
      teleTube.rotation.x = Math.PI / 4;
      teleTube.position.set(0, 1.9, 0.2);
      teleGroup.add(teleTube);
      furnitureGroup.add(teleGroup);
    }

    scene.add(furnitureGroup);

    // Hanging 3D Disco Ball from Ceiling
    const discoGroup = new THREE.Group();
    discoGroup.position.set(0, 4.8, 0);
    const discoBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.1,
        emissive: isDiscoMode ? 0xec4899 : 0x000000,
        emissiveIntensity: isDiscoMode ? 0.6 : 0,
      })
    );
    discoBall.castShadow = true;
    discoGroup.add(discoBall);
    scene.add(discoGroup);

    // 6. PLAYABLE 3D SOCCER BALL ON RUG
    const ballGeo = new THREE.SphereGeometry(0.25, 20, 20);
    const ballMat = new THREE.MeshStandardMaterial({
      map: createSoccerBallTexture(),
      roughness: 0.3,
      metalness: 0.1,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    ballMesh.position.set(ballPosRef.current.x, ballPosRef.current.y, ballPosRef.current.z);
    scene.add(ballMesh);

    // 6B. 3D MINI SOCCER GOAL ON RIGHT WALL (X: 4.8, Z: 0.5)
    const goalGroup = new THREE.Group();
    goalGroup.position.set(4.8, 0, 0.5);

    const goalPostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 });
    // Left post
    const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 12), goalPostMat);
    postLeft.position.set(0, 0.8, -1.0);
    postLeft.castShadow = true;
    goalGroup.add(postLeft);

    // Right post
    const postRight = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 12), goalPostMat);
    postRight.position.set(0, 0.8, 1.0);
    postRight.castShadow = true;
    goalGroup.add(postRight);

    // Crossbar
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.05, 12), goalPostMat);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, 1.6, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    // Top depth bars
    const topBackLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8), goalPostMat);
    topBackLeft.rotation.z = Math.PI / 2;
    topBackLeft.position.set(0.3, 1.6, -1.0);
    goalGroup.add(topBackLeft);

    const topBackRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8), goalPostMat);
    topBackRight.rotation.z = Math.PI / 2;
    topBackRight.position.set(0.3, 1.6, 1.0);
    goalGroup.add(topBackRight);

    // Goal Net wireframe mesh
    const netGeo = new THREE.BoxGeometry(0.5, 1.55, 2.0);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      wireframe: true,
      roughness: 0.9,
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(0.25, 0.8, 0);
    goalGroup.add(netMesh);

    scene.add(goalGroup);

    // 7. CUTE PROCEDURAL 3D ROBO-PET COMPANION ON RUG (X: 1.0, Z: 0.6)
    const petGroup = new THREE.Group();
    petGroup.position.set(1.0, 0, 0.6);

    const petBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.4 })
    );
    petBody.position.y = 0.24;
    petBody.castShadow = true;
    petGroup.add(petBody);

    const petHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.3 })
    );
    petHead.position.set(0, 0.44, 0.14);
    petHead.castShadow = true;
    petGroup.add(petHead);

    const petVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.08, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    petVisor.position.set(0, 0.46, 0.3);
    petGroup.add(petVisor);

    const earMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 8), earMat);
    leftEar.position.set(-0.12, 0.6, 0.1);
    leftEar.rotation.z = -0.3;
    petGroup.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 8), earMat);
    rightEar.position.set(0.12, 0.6, 0.1);
    rightEar.rotation.z = 0.3;
    petGroup.add(rightEar);

    const petTailPivot = new THREE.Group();
    petTailPivot.position.set(0, 0.28, -0.2);
    const petTail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.2, 8), earMat);
    petTail.rotation.x = -Math.PI / 3;
    petTail.position.set(0, 0.08, -0.06);
    petTailPivot.add(petTail);
    petGroup.add(petTailPivot);

    scene.add(petGroup);

    // 8. VOCABULARY INTERACTIVE PEDESTALS & FLOATING 3D GEMS
    const vocabMeshes: { group: THREE.Group; item: VocabItem; pedestal: THREE.Mesh; gem: THREE.Mesh }[] = [];

    room.vocabItems.forEach((item, idx) => {
      const vGroup = new THREE.Group();

      const rx = (item.worldPosition.x - 480) * 0.009;
      const rz = (item.worldPosition.y - 380) * 0.016;
      vGroup.position.set(rx, 0, rz);

      const ringGeo = new THREE.RingGeometry(0.35, 0.48, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      vGroup.add(ring);

      const pedGeo = new THREE.CylinderGeometry(0.32, 0.4, 0.36, 16);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.18;
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      vGroup.add(pedestal);

      const gemGeo = new THREE.OctahedronGeometry(0.3, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x38bdf8 : 0xfbbf24,
        emissive: idx % 2 === 0 ? 0x0284c7 : 0xd97706,
        emissiveIntensity: 0.7,
        metalness: 0.5,
        roughness: 0.1,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.y = 1.05;
      vGroup.add(gem);

      scene.add(vGroup);
      vocabMeshes.push({ group: vGroup, item, pedestal, gem });
    });

    // 9. 3D STYLIZED CHARACTER AVATAR
    const charGroup = new THREE.Group();
    charGroup.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);

    const shadowGeo = new THREE.CircleGeometry(0.42, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const charShadow = new THREE.Mesh(shadowGeo, shadowMat);
    charShadow.rotation.x = -Math.PI / 2;
    charShadow.position.y = 0.02;
    charGroup.add(charShadow);

    const bodyRoot = new THREE.Group();

    const torsoColorHex = parseInt(character.outfitColor.replace('#', '0x'), 16) || 0x2563eb;
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.35);
    const torsoMat = new THREE.MeshStandardMaterial({ color: torsoColorHex, roughness: 0.4 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.72;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const bpColorHex = parseInt(character.backpackColor.replace('#', '0x'), 16) || 0xf59e0b;
    const backpackGeo = new THREE.BoxGeometry(0.36, 0.45, 0.22);
    const backpackMat = new THREE.MeshStandardMaterial({ color: bpColorHex, roughness: 0.5 });
    const backpack = new THREE.Mesh(backpackGeo, backpackMat);
    backpack.position.set(0, 0.72, -0.25);
    backpack.castShadow = true;
    bodyRoot.add(backpack);

    const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    head.castShadow = true;
    bodyRoot.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.11, 1.34, 0.28);
    bodyRoot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.11, 1.34, 0.28);
    bodyRoot.add(rightEye);

    if (character.hat === 'antenna') {
      const antRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      antRod.position.set(0, 1.72, 0);
      bodyRoot.add(antRod);
      const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 }));
      antBall.position.set(0, 1.9, 0);
      bodyRoot.add(antBall);
    } else {
      const hatGeo = new THREE.CylinderGeometry(0.34, 0.36, 0.14, 16);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const hatMesh = new THREE.Mesh(hatGeo, hatMat);
      hatMesh.position.set(0, 1.58, 0);
      bodyRoot.add(hatMesh);

      const brimGeo = new THREE.BoxGeometry(0.4, 0.04, 0.24);
      const brim = new THREE.Mesh(brimGeo, hatMat);
      brim.position.set(0, 1.54, 0.3);
      bodyRoot.add(brim);
    }

    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.16, 0.24, 0);
    leftLeg.castShadow = true;
    bodyRoot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.16, 0.24, 0);
    rightLeg.castShadow = true;
    bodyRoot.add(rightLeg);

    charGroup.add(bodyRoot);
    scene.add(charGroup);

    // -------------------------------------------------------------
    // ANIMATION & PHYSICS LOOP
    // -------------------------------------------------------------
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Read active input keys
      const keys = (window as unknown as { _roomKeys?: { [key: string]: boolean } })._roomKeys || {};
      let moveX = 0;
      let moveZ = 0;

      if (keys['arrowleft'] || keys['a']) moveX -= 1;
      if (keys['arrowright'] || keys['d']) moveX += 1;
      if (keys['arrowup'] || keys['w']) moveZ -= 1;
      if (keys['arrowdown'] || keys['s']) moveZ += 1;

      if (isJoystickActive) {
        moveX += joystickVector.current.x;
        moveZ += joystickVector.current.y;
      }

      const inputLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const isSprinting = sprintMode || !!keys['shift'];
      const speed = isSprinting ? 7.2 : 4.3;
      const p = playerPosRef.current;

      if (inputLen > 0.1) {
        const normX = (moveX / inputLen) * speed;
        const normZ = (moveZ / inputLen) * speed;
        p.vx = normX;
        p.vz = normZ;
        p.rotY = Math.atan2(normX, normZ);

        const now = Date.now();
        const stepRate = isSprinting ? 220 : 310;
        if (now - lastFootstep.current > stepRate && p.isGrounded) {
          lastFootstep.current = now;
          audio.playFootstep();
        }
      } else {
        p.vx = THREE.MathUtils.damp(p.vx, 0, 12, delta);
        p.vz = THREE.MathUtils.damp(p.vz, 0, 12, delta);
      }

      // Physics Gravity and Jump
      p.x += p.vx * delta;
      p.z += p.vz * delta;
      p.y += p.vy * delta;
      p.vy -= 22 * delta;

      // Room boundaries
      p.x = Math.max(-4.4, Math.min(4.4, p.x));
      p.z = Math.max(-3.4, Math.min(3.8, p.z));

      // Bed Trampoline Rebound Collision (Bed at X: -2.8, Z: -2.2)
      let isBedBounce = false;
      if ((room.theme === 'bedroom' || room.theme === 'cabin') && p.x >= -3.9 && p.x <= -1.7 && p.z >= -3.5 && p.z <= -0.8) {
        if (p.y <= 0.85 && p.vy < -1.5) {
          isBedBounce = true;
        }
      }

      if (isBedBounce) {
        p.vy = 12.0;
        p.y = 0.95;
        p.isGrounded = false;
        audio.playSpringBounce();
        spawnScore('BOING! 🛏️', '#38BDF8', -80, -40);
      } else if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.isGrounded = true;
      }

      // -------------------------------------------------------------
      // 3D SOCCER BALL PHYSICS, KICKING & GOAL SCORING
      // -------------------------------------------------------------
      const b = ballPosRef.current;
      b.x += b.vx * delta;
      b.z += b.vz * delta;
      b.y += b.vy * delta;
      b.vy -= 18 * delta;

      // Ball ground bounce
      if (b.y <= 0.25) {
        b.y = 0.25;
        if (Math.abs(b.vy) > 0.8) {
          b.vy = -b.vy * 0.6;
        } else {
          b.vy = 0;
        }
        b.vx *= 0.96;
        b.vz *= 0.96;
      }

      // Ball wall bounces
      if (b.x >= 4.4 || b.x <= -4.4) {
        b.vx = -b.vx * 0.75;
        b.x = Math.max(-4.4, Math.min(4.4, b.x));
      }
      if (b.z >= 3.8 || b.z <= -3.4) {
        b.vz = -b.vz * 0.75;
        b.z = Math.max(-3.4, Math.min(3.8, b.z));
      }

      // 3D Mini-Soccer Goal Detection (Goal at X: 4.8, Z: 0.5, Z-span: [-0.5, 1.5], Height: 1.6)
      if (b.x > 4.3 && b.x <= 5.2 && b.z >= -0.5 && b.z <= 1.5 && b.y <= 1.6) {
        const now = Date.now();
        if (now - lastGoalTime.current > 2000) {
          lastGoalTime.current = now;
          setGoalsScored(prev => prev + 1);
          audio.playPowerUp();
          audio.speakSahabatKafaVoice('Gool! Hebat sekali Sahabat Kafa!');
          confetti({ particleCount: 75, spread: 90, origin: { x: 0.75, y: 0.55 } });
          spawnScore('⚽ GOOOOOL!! +25 KOIN SAHABAT KAFA!', '#F59E0B', 40, -60);
          onCollectCoin(25);
          // Rebound ball to center with bounce
          b.x = 0;
          b.z = 0.4;
          b.y = 1.4;
          b.vx = (Math.random() - 0.5) * 2;
          b.vz = (Math.random() - 0.5) * 2;
          b.vy = 2.2;
        }
      }

      // Check collision between player and ball
      const bdx = b.x - p.x;
      const bdz = b.z - p.z;
      const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
      if (bdist < 0.65 && p.y < 0.8) {
        const now = Date.now();
        if (now - lastKickTime.current > 240) {
          lastKickTime.current = now;
          const kickSpeed = Math.max(4.0, Math.sqrt(p.vx * p.vx + p.vz * p.vz) * (isSprinting ? 2.0 : 1.6));
          const kickDirX = bdist > 0.05 ? bdx / bdist : 1;
          const kickDirZ = bdist > 0.05 ? bdz / bdist : 0;
          b.vx = kickDirX * kickSpeed;
          b.vz = kickDirZ * kickSpeed;
          b.vy = Math.random() * 2.2 + 1.8;
          audio.playKickBall();
          spawnScore('⚽ TENDANG BOLA! +5 XP', '#38BDF8', 30, -50);
          onCollectCoin(1);
        }
      }

      // Dynamic thematic models animations
      if (dynamicHoloAtom) {
        dynamicHoloAtom.rotation.y += delta * 1.8;
        dynamicHoloAtom.rotation.x += delta * 1.1;
      }
      if (dynamicFireLight) {
        dynamicFireLight.intensity = 2.2 + Math.sin(time * 14) * 0.45 + Math.random() * 0.2;
      }
      if (dynamicEarthPlanet) {
        dynamicEarthPlanet.rotation.y += delta * 0.6;
      }

      // Emote character animation overrides
      if (isDoingEmote === 'dance') {
        p.rotY += delta * 14;
        bodyRoot.position.y = p.y + Math.abs(Math.sin(time * 16)) * 0.35;
      } else if (isDoingEmote === 'jurus') {
        bodyRoot.position.y = p.y + 0.25 + Math.sin(time * 8) * 0.08;
      }

      // Rotate ball based on velocity
      b.rotX += b.vz * delta * 4;
      b.rotZ -= b.vx * delta * 4;
      ballMesh.position.set(b.x, b.y, b.z);
      ballMesh.rotation.set(b.rotX, 0, b.rotZ);

      // Leg swing walking animation
      const isWalking = inputLen > 0.1 && p.isGrounded;
      if (isWalking) {
        leftLeg.rotation.x = Math.sin(time * 14) * 0.7;
        rightLeg.rotation.x = -Math.sin(time * 14) * 0.7;
        bodyRoot.position.y = Math.abs(Math.sin(time * 14)) * 0.08 + p.y;
      } else {
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);
        bodyRoot.position.y = p.y;
      }

      // Character Mesh Transform
      charGroup.position.set(p.x, 0, p.z);
      charGroup.rotation.y = THREE.MathUtils.damp(charGroup.rotation.y, p.rotY, 14, delta);

      const shadowScale = Math.max(0.3, 1 - p.y * 0.25);
      charShadow.scale.set(shadowScale, shadowScale, shadowScale);
      (charShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.12, 0.45 - p.y * 0.1);

      // Rotate 3D floating crystals
      vocabMeshes.forEach(vm => {
        vm.gem.rotation.y += delta * 1.5;
        vm.gem.position.y = 1.05 + Math.sin(time * 2.5 + vm.item.xp) * 0.12;
      });

      // Animate Pet Companion (Tail wag & look toward player)
      petTailPivot.rotation.y = Math.sin(time * 10) * 0.6;
      const petDx = p.x - petGroup.position.x;
      const petDz = p.z - petGroup.position.z;
      const petDist = Math.sqrt(petDx * petDx + petDz * petDz);
      if (petDist < 3.2) {
        petGroup.rotation.y = THREE.MathUtils.damp(petGroup.rotation.y, Math.atan2(petDx, petDz), 4, delta);
      }

      // Animate Jukebox record spinning
      jukeRecord.rotation.y += delta * 3;

      // Animate Disco Ball & Spotlights
      if (isDiscoMode) {
        discoBall.rotation.y += delta * 1.8;
        discoLight1.position.x = Math.sin(time * 3) * 3;
        discoLight1.position.z = Math.cos(time * 3) * 3;
        discoLight2.position.x = Math.cos(time * 2.5) * 3.5;
        discoLight2.position.z = Math.sin(time * 2.5) * 3.5;
      }

      // Animate Chest Opening Lid
      if (isChestOpened) {
        chestLidPivot.rotation.x = THREE.MathUtils.damp(chestLidPivot.rotation.x, -Math.PI * 0.42, 6, delta);
      }

      lampLight.intensity = THREE.MathUtils.damp(lampLight.intensity, isLampOn ? (atmosphere === 'night' ? 3.6 : 2.8) : 0.2, 8, delta);

      // Proximity Checks: Vocab items
      let closestItem: VocabItem | null = null;
      let minItemDist = Infinity;
      vocabMeshes.forEach(vm => {
        const dx = p.x - vm.group.position.x;
        const dz = p.z - vm.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.7 && dist < minItemDist) {
          minItemDist = dist;
          closestItem = vm.item;
        }
      });

      if (closestItem !== nearVocabRef.current) {
        nearVocabRef.current = closestItem;
        setNearVocab(closestItem);
      }

      // Proximity: Exit Door (Z: 4.0, X: 0)
      const doorDist = Math.sqrt(p.x * p.x + (p.z - 3.8) * (p.z - 3.8));
      const nearDoorNow = doorDist < 1.4;
      if (nearDoorNow !== nearDoorRef.current) {
        nearDoorRef.current = nearDoorNow;
        setNearDoor(nearDoorNow);
      }

      // Proximity: Chest (X: 3.4, Z: 2.0)
      const chestDist = Math.sqrt((p.x - 3.4) * (p.x - 3.4) + (p.z - 2.0) * (p.z - 2.0));
      const nearChestNow = chestDist < 1.5;
      if (nearChestNow !== nearChestRef.current) {
        nearChestRef.current = nearChestNow;
        setNearChest(nearChestNow);
      }

      // Proximity: Jukebox (X: 3.8, Z: -0.4)
      const jukeDist = Math.sqrt((p.x - 3.8) * (p.x - 3.8) + (p.z - -0.4) * (p.z - -0.4));
      const nearJukeNow = jukeDist < 1.6;
      if (nearJukeNow !== nearJukeboxRef.current) {
        nearJukeboxRef.current = nearJukeNow;
        setNearJukebox(nearJukeNow);
      }

      // Proximity: Wardrobe Mirror (X: -4.8, Z: 1.4)
      const mirrorDist = Math.sqrt((p.x - -4.6) * (p.x - -4.6) + (p.z - 1.4) * (p.z - 1.4));
      const nearMirrorNow = mirrorDist < 1.6;
      if (nearMirrorNow !== nearMirrorRef.current) {
        nearMirrorRef.current = nearMirrorNow;
        setNearMirror(nearMirrorNow);
      }

      // Proximity: Desk & Laptop (X: 2.8, Z: -2.6)
      const laptopDist = Math.sqrt((p.x - 2.8) * (p.x - 2.8) + (p.z - -2.6) * (p.z - -2.6));
      const nearLaptopNow = laptopDist < 1.6;
      if (nearLaptopNow !== nearLaptopRef.current) {
        nearLaptopRef.current = nearLaptopNow;
        setNearLaptop(nearLaptopNow);
      }

      // Proximity: Bookshelf (X: 4.6, Z: -2.2)
      const shelfDist = Math.sqrt((p.x - 4.4) * (p.x - 4.4) + (p.z - -2.2) * (p.z - -2.2));
      const nearShelfNow = shelfDist < 1.6;
      if (nearShelfNow !== nearBookshelfRef.current) {
        nearBookshelfRef.current = nearShelfNow;
        setNearBookshelf(nearShelfNow);
      }

      // Proximity: Pet Companion (X: 1.0, Z: 0.6)
      const petDistNow = petDist < 1.4;
      if (petDistNow !== nearPetRef.current) {
        nearPetRef.current = petDistNow;
        setNearPet(petDistNow);
      }

      // Proximity: Classroom Blackboard (X: 0, Z: -3.8)
      const isClassroom = room.theme === 'classroom';
      const bbDist = Math.sqrt(p.x * p.x + (p.z - -3.8) * (p.z - -3.8));
      const nearBbNow = isClassroom && bbDist < 1.9;
      if (nearBbNow !== nearBlackboardRef.current) {
        nearBlackboardRef.current = nearBbNow;
        setNearBlackboard(nearBbNow);
      }

      // Proximity: Science Lab Bench (X: -2.8, Z: -2.4 or X: 2.8, Z: -2.4)
      const isLab = room.theme === 'lab';
      const labDistL = Math.sqrt((p.x - -2.8) * (p.x - -2.8) + (p.z - -2.4) * (p.z - -2.4));
      const labDistR = Math.sqrt((p.x - 2.8) * (p.x - 2.8) + (p.z - -2.4) * (p.z - -2.4));
      const nearLabNow = isLab && (labDistL < 1.8 || labDistR < 1.8);
      if (nearLabNow !== nearLabBenchRef.current) {
        nearLabBenchRef.current = nearLabNow;
        setNearLabBench(nearLabNow);
      }

      // Proximity: Fireplace (X: 0, Z: -3.6)
      const isCabin = room.theme === 'cabin' || room.theme === 'treehouse';
      const fireDist = Math.sqrt(p.x * p.x + (p.z - -3.6) * (p.z - -3.6));
      const nearFireNow = isCabin && fireDist < 1.9;
      if (nearFireNow !== nearFireplaceRef.current) {
        nearFireplaceRef.current = nearFireNow;
        setNearFireplace(nearFireNow);
      }

      // Proximity: Cafe Bakery Counter (X: -2.2, Z: -2.2)
      const isCafe = room.theme === 'cafe';
      const cafeDist = Math.sqrt((p.x - -2.2) * (p.x - -2.2) + (p.z - -2.2) * (p.z - -2.2));
      const nearCafeNow = isCafe && cafeDist < 1.8;
      if (nearCafeNow !== nearBakeryRef.current) {
        nearBakeryRef.current = nearCafeNow;
        setNearBakery(nearCafeNow);
      }

      // Proximity: Stargazer Cockpit (X: 0, Z: -2.6)
      const isCockpit = room.theme === 'cockpit' || room.id.includes('vault') || room.id.includes('cockpit');
      const starDist = Math.sqrt(p.x * p.x + (p.z - -2.6) * (p.z - -2.6));
      const nearStarNow = isCockpit && starDist < 1.8;
      if (nearStarNow !== nearStargazerRef.current) {
        nearStargazerRef.current = nearStarNow;
        setNearStargazer(nearStarNow);
      }

      // Camera follow modes
      if (cameraMode === 'firstPerson') {
        charGroup.visible = false;
        camera.position.x = p.x;
        camera.position.y = p.y + 1.42;
        camera.position.z = p.z;
        const lookX = p.x + Math.sin(p.rotY) * 5;
        const lookZ = p.z + Math.cos(p.rotY) * 5;
        camera.lookAt(lookX, p.y + 1.35, lookZ);
      } else {
        charGroup.visible = true;
        if (cameraMode === 'isometric') {
          const targetCamX = p.x * 0.45;
          const targetCamZ = p.z * 0.45 + 10.5;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 9.5, 4, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4, delta);
          camera.lookAt(p.x * 0.3, 1.2, p.z * 0.3);
        } else if (cameraMode === 'orbit') {
          const radius = 12;
          const cx = Math.sin(orbitAngle.current.theta) * Math.sin(orbitAngle.current.phi) * radius;
          const cy = Math.cos(orbitAngle.current.phi) * radius;
          const cz = Math.cos(orbitAngle.current.theta) * Math.sin(orbitAngle.current.phi) * radius;
          camera.position.set(cx, Math.max(2, cy), cz);
          camera.lookAt(0, 1.2, 0);
        } else {
          // cinematic
          const camOffsetZ = Math.cos(p.rotY) * -3.2;
          const camOffsetX = Math.sin(p.rotY) * -3.2;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, p.x + camOffsetX, 5, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, p.y + 2.8, 5, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, p.z + camOffsetZ, 5, delta);
          camera.lookAt(p.x, p.y + 1.4, p.z);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      backWallGeo.dispose();
      backWallMat.dispose();
      leftWallGeo.dispose();
      leftWallMat.dispose();
    };
  }, [room, isLampOn, isChestOpened, isDiscoMode, cameraMode, atmosphere, character, spawnScore, onCollectCoin]);

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-slate-950"
      style={{ height: '100dvh' }}
    >
      {/* TOP HEADER: ROOM INFO, 3D CAMERA MODES, ATMOSPHERE SWITCHER, LIGHT, DISCO, EXIT */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Room Title */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-amber-400/80 text-white shadow-2xl">
            <span className="text-2xl animate-pulse">🚪</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 font-game tracking-wider uppercase">
                  {room.nameId}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded font-game shadow">
                  REAL 3D
                </span>
              </div>
              <div className="text-[10px] text-slate-300">{room.subtitleId}</div>
            </div>
          </div>

          {/* Quick 3D Room Teleport Switcher Button */}
          {allRooms && allRooms.length > 0 && onChangeRoom && (
            <button
              onClick={() => {
                audio.playButtonClick();
                setActiveRoomSelectModal(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl border-2 border-indigo-400 shadow-xl font-game font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Pindah ke Ruangan 3D Lainnya"
            >
              <span>🧭</span>
              <span className="hidden md:inline">PILIH RUANGAN</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                {allRooms.length}
              </span>
            </button>
          )}

          {/* Mini Soccer Scoreboard Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border-2 border-emerald-400/80 text-emerald-300 font-game font-bold text-xs shadow-xl">
            <span className="text-base">⚽</span>
            <span>GOL: <strong className="text-amber-300 font-black text-sm">{goalsScored}</strong></span>
          </div>
        </div>

        {/* Action Pills: Atmosphere, Disco, Light, Camera Angle, Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Atmosphere Mode Switcher */}
          <div className="flex items-center bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700 p-0.5 shadow-lg">
            <button
              onClick={() => {
                audio.playButtonClick();
                setAtmosphere('day');
                spawnScore('☀️ Suasana: Siang Cerah!', '#FBBF24', 0, -40);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                atmosphere === 'day' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Siang Cerah"
            >
              ☀️ Siang
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setAtmosphere('sunset');
                spawnScore('🌅 Suasana: Senja Emas!', '#F97316', 0, -40);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                atmosphere === 'sunset' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Senja Emas"
            >
              🌅 Senja
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setAtmosphere('night');
                spawnScore('🌙 Suasana: Malam Cyber!', '#38BDF8', 0, -40);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                atmosphere === 'night' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Malam Neon"
            >
              🌙 Malam
            </button>
          </div>

          {/* Disco Party Mode Toggle */}
          <button
            onClick={() => {
              audio.playPowerUp();
              setIsDiscoMode(!isDiscoMode);
              if (!isDiscoMode) {
                confetti({ particleCount: 50, spread: 80 });
                spawnScore('🪩 MODE PESTA DISKO AKTIF!', '#EC4899', 0, -50);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold font-game cursor-pointer active:scale-95 transition-all shadow-md ${
              isDiscoMode
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.8)]'
                : 'bg-slate-900/90 text-slate-300 border-slate-700'
            }`}
            title="Nyalakan Bola Disko & Lampu Sorot Pesta"
          >
            <span>🪩</span>
            <span className="hidden md:inline">{isDiscoMode ? 'Disko: ON' : 'Disko'}</span>
          </button>

          {/* Camera View Mode Switcher */}
          <div className="hidden sm:flex items-center bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700 p-0.5 shadow-lg">
            <button
              onClick={() => {
                audio.playButtonClick();
                setCameraMode('isometric');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                cameraMode === 'isometric' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Kamera Sudut 3D Isometrik"
            >
              📐 3D ISO
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setCameraMode('orbit');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                cameraMode === 'orbit' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Putar Kamera 360 Derajat Bebas"
            >
              🔄 ORBIT
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setCameraMode('cinematic');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                cameraMode === 'cinematic' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Kamera Sinematik Dekat"
            >
              🎬 DEKAT
            </button>
            <button
              onClick={() => {
                audio.playButtonClick();
                setCameraMode('firstPerson');
                spawnScore('👁️ Mode Orang Pertama (FPS)!', '#38BDF8', 0, -40);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                cameraMode === 'firstPerson' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Sudut Pandang Orang Pertama (FPS)"
            >
              👁️ FPS
            </button>
          </div>

          {/* Lamp Toggle Switch */}
          <button
            onClick={() => {
              audio.playButtonClick();
              setIsLampOn(!isLampOn);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-game cursor-pointer active:scale-95 transition-all shadow-md ${
              isLampOn
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-slate-900/90 text-slate-400 border-slate-700'
            }`}
          >
            <span>{isLampOn ? '💡' : '🌑'}</span>
            <span className="hidden md:inline">{isLampOn ? 'Lampu: Nyala' : 'Lampu: Mati'}</span>
          </button>

          {/* Exit Room Button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onExitRoom();
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl border border-rose-400 text-xs font-black font-game shadow-xl cursor-pointer active:scale-95 transition-all"
          >
            <span>🚪</span>
            <span>KELUAR</span>
          </button>
        </div>
      </div>

      {/* FLOATING ACTION BANNER PROMPT (PROXIMITY CONTEXTUAL BADGE) */}
      <AnimatePresence>
        {(nearVocab || nearDoor || (nearChest && !isChestOpened) || nearLaptop || nearBookshelf || nearPet || nearJukebox || nearMirror || nearBlackboard || nearLabBench || nearFireplace || nearBakery || nearStargazer) && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <button
              onClick={triggerInteraction}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 rounded-full font-black text-xs sm:text-sm shadow-[0_10px_35px_rgba(245,158,11,0.6)] border-2 border-white font-game cursor-pointer active:scale-95 transition-all animate-bounce ring-4 ring-amber-400/40"
            >
              <span className="px-2 py-0.5 bg-slate-950 text-amber-300 rounded-md text-[10px] font-black tracking-wider">
                [E] / SENTUH
              </span>
              <span>
                {nearDoor
                  ? '🚪 KELUAR KE DUNIA PETUALANGAN'
                  : nearChest
                  ? '🎁 BUKA PETI HARTA RAHASIA (+20 🪙 +1 ⭐)'
                  : nearBlackboard
                  ? '🎓 BUKA KUIS PAPAN TULIS SD (+30 XP +1 ⭐)'
                  : nearLabBench
                  ? '🧪 EKSPERIMEN RAMUAN SAINS (+25 XP +10 🪙)'
                  : nearFireplace
                  ? '🔥 HANGATKAN DIRI DI PERAPIAN (+15 XP 💖)'
                  : nearBakery
                  ? '☕ CICIPI ROTI & DONAT LEZAT (+20 XP +10 🪙)'
                  : nearStargazer
                  ? '🔭 TEROPONG BINTANG & PLANET (+35 XP ⭐)'
                  : nearJukebox
                  ? `📻 PUTAR RADIO JUKEBOX 3D (Lagu #${jukeboxTrack})`
                  : nearMirror
                  ? '🪞 CERMIN KOSTUM 3D (Ganti Gaya Hero)'
                  : nearLaptop
                  ? '💻 BUKA ROBO-LAPTOP BELAJAR (+25 XP)'
                  : nearBookshelf
                  ? '📚 AMBIL BUKU IDIOM RAHASIA (+20 XP)'
                  : nearPet
                  ? '🐾 ELUS ROBO-PET (+10 XP 💖)'
                  : `🔍 BELAJAR: ${nearVocab?.word.toUpperCase()} (${nearVocab?.translation})`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE 3D WARDROBE / MIRROR CUSTOMIZE MODAL */}
      <AnimatePresence>
        {activeMirrorModal && (
          <div className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-2 border-purple-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🪞</span>
                  <div>
                    <h3 className="font-game font-black text-purple-300 text-base">CERMIN KOSTUM 3D</h3>
                    <p className="text-xs text-slate-400">Ganti Warna Sasis & Aksesori Hero</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMirrorModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Outfit Chassis Colors */}
              <div className="mb-4">
                <label className="text-xs font-bold text-amber-300 font-game mb-2 block">
                  🎨 WARNA SASIS ROBOT:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Biru Cyber', hex: '#0EA5E9' },
                    { name: 'Hijau Daun', hex: '#10B981' },
                    { name: 'Emas Surya', hex: '#F59E0B' },
                    { name: 'Merah Laser', hex: '#EF4444' },
                    { name: 'Ungu Neon', hex: '#8B5CF6' },
                    { name: 'Titanium', hex: '#475569' },
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        audio.playButtonClick();
                        onUpdateCharacter?.({ ...character, outfitColor: c.hex });
                        spawnScore(`Warna: ${c.name}`, c.hex, 0, -70);
                      }}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer active:scale-95 ${
                        character.outfitColor === c.hex ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Backpack Booster Colors */}
              <div className="mb-4">
                <label className="text-xs font-bold text-cyan-300 font-game mb-2 block">
                  🎒 WARNA TAS BOOSTER:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Emas Energi', hex: '#F59E0B' },
                    { name: 'Cyan Plasma', hex: '#06B6D4' },
                    { name: 'Merah Reaktor', hex: '#EF4444' },
                    { name: 'Hijau Solar', hex: '#22C55E' },
                    { name: 'Biru Gelap', hex: '#1E3A8A' },
                  ].map(b => (
                    <button
                      key={b.hex}
                      onClick={() => {
                        audio.playButtonClick();
                        onUpdateCharacter?.({ ...character, backpackColor: b.hex });
                        spawnScore(`Tas: ${b.name}`, b.hex, 0, -70);
                      }}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer active:scale-95 ${
                        character.backpackColor === b.hex ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: b.hex }}
                      title={b.name}
                    />
                  ))}
                </div>
              </div>

              {/* Hat / Antenna */}
              <div className="mb-5">
                <label className="text-xs font-bold text-emerald-300 font-game mb-2 block">
                  📡 TOPI / AKSESORI KEPALA:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'antenna', label: '📡 Antena Sinyal' },
                    { id: 'cap', label: '🧢 Topi Petualang' },
                    { id: 'propeller', label: '🚁 Baling-baling' },
                    { id: 'radar', label: '🛰️ Piringan Radar' },
                  ].map(h => (
                    <button
                      key={h.id}
                      onClick={() => {
                        audio.playButtonClick();
                        onUpdateCharacter?.({ ...character, hat: h.id });
                        spawnScore(`Topi: ${h.label}`, '#10B981', 0, -70);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-game border transition-all cursor-pointer ${
                        character.hat === h.id
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-lg'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveMirrorModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black font-game text-xs transition-all shadow-lg cursor-pointer"
              >
                SIMPAN GAYA BARU ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE ROBO-LAPTOP MODAL */}
      <AnimatePresence>
        {activeLaptopModal && (
          <div className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">💻</span>
                  <div>
                    <h3 className="font-game font-black text-cyan-300 text-base">ROBO-LAPTOP 3D</h3>
                    <p className="text-xs text-slate-400">Pusat Teknologi & Pengetahuan Digital</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveLaptopModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 mb-4 font-mono text-xs text-cyan-200">
                <div className="text-amber-300 font-bold mb-1">🤖 Robo-Assistant says:</div>
                <p className="leading-relaxed">
                  "Did you know? In English, <strong>COMPUTER</strong> comes from the Latin word <em>'computare'</em> meaning <strong>to calculate</strong>! Let's test your vocabulary!"
                </p>
              </div>

              <div className="space-y-2 mb-5">
                <div className="text-xs font-bold text-slate-300">
                  Pertanyaan: Apa arti dari kata <span className="text-cyan-300 font-black">"KEYBOARD"</span>?
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'A. Papan Ketik Komputer', correct: true },
                    { label: 'B. Layar Kaca Sentuh', correct: false },
                    { label: 'C. Tetikus / Mouse', correct: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      disabled={laptopQuizAnswered}
                      onClick={() => {
                        setLaptopQuizAnswered(true);
                        if (opt.correct) {
                          audio.playPowerUp();
                          confetti({ particleCount: 60, spread: 70 });
                          onCollectCoin(5);
                          spawnScore('BENAR! +25 XP +5 🪙', '#10B981', 0, -80);
                        } else {
                          audio.playBlockBump();
                          spawnScore('Coba lagi!', '#EF4444', 0, -80);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600/30 border border-slate-700 hover:border-cyan-400 text-left text-xs font-bold font-game transition-all cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveLaptopModal(false);
                  setLaptopQuizAnswered(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-game text-xs transition-all shadow-lg cursor-pointer"
              >
                SELESAI BELAJAR 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE BOOKSHELF IDIOM MODAL */}
      <AnimatePresence>
        {activeBookshelfModal && (
          <div className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">📚</span>
                  <div>
                    <h3 className="font-game font-black text-amber-300 text-base">RAK BUKU AJAIB</h3>
                    <p className="text-xs text-slate-400">Koleksi Idiom & Peribahasa Inggris</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBookshelfModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 p-5 rounded-2xl border border-amber-400/40 mb-4 text-center">
                <span className="text-4xl block mb-2">🍰</span>
                <div className="text-lg font-black font-game text-amber-300 mb-1">
                  "Piece of cake!"
                </div>
                <div className="text-xs text-amber-100 font-medium mb-3">
                  (Arti: Sangat mudah / Gampang sekali!)
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-amber-400/20 italic">
                  Contoh: "Don't worry about the English test, it's a piece of cake!"
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => audio.speak("Piece of cake! That means very easy!")}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold font-game text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🔊</span>
                  <span>DENGARKAN SUARA</span>
                </button>
                <button
                  onClick={() => {
                    setActiveBookshelfModal(false);
                    spawnScore('+20 XP Pembaca Rajin! 📖', '#FBBF24', 0, -60);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-game text-xs transition-all shadow-lg cursor-pointer"
                >
                  SIMPAN ILMU ⭐
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE CLASSROOM BLACKBOARD QUIZ MODAL */}
      <AnimatePresence>
        {activeBlackboardModal && (
          <div className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-emerald-950 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-emerald-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🎓</span>
                  <div>
                    <h3 className="font-game font-black text-amber-300 text-base">PAPAN TULIS KUIS SD</h3>
                    <p className="text-xs text-emerald-200">Kuis Cepat Matematika & Bahasa Inggris</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveBlackboardModal(false);
                    setBlackboardQuizAnswered(false);
                  }}
                  className="w-8 h-8 rounded-full bg-emerald-900 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-emerald-900/80 p-4 rounded-2xl border-2 border-emerald-600/40 mb-4 font-game text-xs text-white">
                <div className="text-amber-300 font-bold mb-1">📝 Soal Ceria Sahabat Kafa:</div>
                <p className="text-sm font-black mb-2">
                  "Di kelas, seorang <span className="text-yellow-300">TEACHER</span> bertugas mendidik siswa. Apa arti kata <u>TEACHER</u>?"
                </p>
                <div className="text-[11px] text-emerald-200 italic">
                  Bonus Math: Berapakah hasil dari 25 + 75?
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { label: 'A. Guru (dan 25 + 75 = 100)', correct: true },
                  { label: 'B. Murid Sekolah (dan 25 + 75 = 90)', correct: false },
                  { label: 'C. Dokter Hewan (dan 25 + 75 = 80)', correct: false },
                ].map((opt, i) => (
                  <button
                    key={i}
                    disabled={blackboardQuizAnswered}
                    onClick={() => {
                      setBlackboardQuizAnswered(true);
                      if (opt.correct) {
                        audio.playPowerUp();
                        audio.speakSahabatKafaVoice('Jawabanmu tepat sekali!');
                        confetti({ particleCount: 70, spread: 80 });
                        onCollectCoin(10);
                        onCollectStar(1);
                        spawnScore('BENAR SEKALI! +30 XP +1 ⭐ +10 🪙', '#10B981', 0, -80);
                      } else {
                        audio.playBlockBump();
                        spawnScore('Jawaban belum tepat, coba lagi ya!', '#EF4444', 0, -80);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border-2 border-emerald-600 hover:border-amber-400 text-left text-xs font-bold font-game transition-all cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveBlackboardModal(false);
                  setBlackboardQuizAnswered(false);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-game text-xs transition-all shadow-lg cursor-pointer"
              >
                TUTUP PAPAN TULIS ✨
              </button>
            </motion.div>
          </div>
        )}

        {/* INTERACTIVE SCIENCE LAB POTION EXPERIMENT MODAL */}
        {activeLabModal && (
          <div className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-4 border-cyan-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-cyan-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🧪</span>
                  <div>
                    <h3 className="font-game font-black text-cyan-300 text-base">LABORATORIUM EKSPERIMEN</h3>
                    <p className="text-xs text-slate-400">Pencampuran Senyawa & Robotika</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveLabModal(false);
                    setLabExperimentMixed(false);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/40 mb-4 text-center">
                <div className="flex items-center justify-center gap-3 text-4xl mb-2">
                  <span>⚛️</span>
                  <span>➕</span>
                  <span>⚡</span>
                  <span>🟰</span>
                  <span>✨</span>
                </div>
                <div className="font-game font-black text-cyan-300 text-sm mb-1">
                  RAMUAN ENERGI SAHABAT KAFA
                </div>
                <p className="text-xs text-slate-300">
                  Campurkan kristal atom neon dan energi surya untuk menciptakan dorongan kecepatan robotik!
                </p>
              </div>

              {!labExperimentMixed ? (
                <button
                  onClick={() => {
                    setLabExperimentMixed(true);
                    audio.playPowerUp();
                    audio.speakSahabatKafaVoice('Eksperimen sains berhasil!');
                    confetti({ particleCount: 80, spread: 90 });
                    onCollectCoin(15);
                    spawnScore('EKSPERIMEN SUKSES! +25 XP +15 🪙', '#06B6D4', 0, -80);
                  }}
                  className="w-full py-3 mb-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 text-slate-950 font-black font-game text-sm shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer active:scale-95 transition-all"
                >
                  ⚗️ MULAI CAMPURKAN SENYAWA!
                </button>
              ) : (
                <div className="p-3 bg-cyan-950/80 border border-cyan-400/50 rounded-2xl text-center mb-3 text-xs text-cyan-200 font-game">
                  ✅ Ramuan aktif! Hero robotik Anda bersinar dengan kekuatan penuh!
                </div>
              )}

              <button
                onClick={() => {
                  setActiveLabModal(false);
                  setLabExperimentMixed(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-game text-xs font-bold cursor-pointer"
              >
                KEMBALI KE LAB
              </button>
            </motion.div>
          </div>
        )}

        {/* INTERACTIVE CABIN FIREPLACE WARM-UP MODAL */}
        {activeFireplaceModal && (
          <div className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-stone-900 border-4 border-orange-500 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-stone-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <h3 className="font-game font-black text-orange-400 text-base">PERAPIAN PONDOK HANGAT</h3>
                    <p className="text-xs text-stone-400">Tempat Beristirahat & Memulihkan Tenaga</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveFireplaceModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-950/80 to-stone-950 p-5 rounded-2xl border border-orange-500/30 text-center mb-4">
                <span className="text-5xl block mb-2 animate-bounce">🏕️</span>
                <div className="font-game font-black text-amber-300 text-base mb-1">
                  "Menghangatkan Diri di Perapian Kayu"
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Kayu bakar berderak hangat menenangkan jiwa petualang. Sahabat Kafa siap melanjutkan perjalanan ke pelosok pulau!
                </p>
              </div>

              <button
                onClick={() => {
                  audio.playPowerUp();
                  audio.speakSahabatKafaVoice('Tenagamu sudah pulih!');
                  confetti({ particleCount: 40, spread: 60 });
                  onCollectCoin(10);
                  spawnScore('💖 ENERGI PULIH TOTAL! +15 XP', '#F97316', 0, -70);
                  setActiveFireplaceModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-slate-950 font-black font-game text-sm shadow-xl cursor-pointer active:scale-95 transition-all"
              >
                ☕ MINUM COKLAT HANGAT (+15 XP)
              </button>
            </motion.div>
          </div>
        )}

        {/* INTERACTIVE CAFE BAKERY MODAL */}
        {activeBakeryModal && (
          <div className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-4 border-pink-500 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-pink-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">☕</span>
                  <div>
                    <h3 className="font-game font-black text-pink-300 text-base">TOKO ROTI & KAFE MANIS</h3>
                    <p className="text-xs text-slate-400">Roti Panggang Segar & Donat Stroberi</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBakeryModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { name: 'Donat Stroberi 🍩', xp: 20, coins: 10, quote: 'Manis dan lezat!' },
                  { name: 'Roti Baguette 🥖', xp: 20, coins: 10, quote: 'Renyah di luar, empuk di dalam!' },
                  { name: 'Kopi Susu Hangat ☕', xp: 25, coins: 12, quote: 'Memberi semangat belajar!' },
                  { name: 'Kue Ulang Tahun 🍰', xp: 30, coins: 15, quote: 'Kue lembut krim vanilla!' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      audio.playPowerUp();
                      confetti({ particleCount: 45, spread: 70 });
                      onCollectCoin(item.coins);
                      spawnScore(`NYAM! ${item.name}! +${item.xp} XP +${item.coins} 🪙`, '#EC4899', 0, -70);
                      setActiveBakeryModal(false);
                    }}
                    className="p-3 bg-slate-800/90 hover:bg-pink-600/30 border border-slate-700 hover:border-pink-400 rounded-2xl text-left transition-all cursor-pointer active:scale-95"
                  >
                    <div className="text-xs font-black font-game text-pink-300 mb-1">{item.name}</div>
                    <div className="text-[10px] text-slate-300 mb-1">{item.quote}</div>
                    <div className="text-[9px] text-amber-300 font-bold">+{item.xp} XP • +{item.coins} 🪙</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveBakeryModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-game text-xs font-bold cursor-pointer"
              >
                TUTUP ETALASE KAFE
              </button>
            </motion.div>
          </div>
        )}

        {/* INTERACTIVE STARGAZER SPACE MODAL */}
        {activeStargazerModal && (
          <div className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-indigo-950 border-4 border-cyan-400 rounded-3xl p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4 border-b border-indigo-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔭</span>
                  <div>
                    <h3 className="font-game font-black text-cyan-300 text-base">OBSERVATORIUM ANTARIKSA</h3>
                    <p className="text-xs text-indigo-200">Jendela Galaksi & Rasi Bintang</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStargazerModal(false)}
                  className="w-8 h-8 rounded-full bg-indigo-900 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-400/40 mb-4 text-center">
                <span className="text-5xl block mb-2">🌍 🛰️ ✨</span>
                <div className="font-game font-black text-amber-300 text-sm mb-1">
                  PLANET BUMI & GAYA GRAVITASI
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Dari kokpit ini, planet Bumi tampak biru memesona karena 71% permukaannya diselimuti air laut.
                </p>
                <div className="p-2.5 bg-indigo-900/40 rounded-xl text-[11px] text-cyan-200 font-mono">
                  English: "Earth revolves around the Sun every 365 days!"
                </div>
              </div>

              <button
                onClick={() => {
                  audio.playPowerUp();
                  audio.speakSahabatKafaVoice('Pengetahuan antariksa hebat!');
                  confetti({ particleCount: 60, spread: 80 });
                  onCollectStar(1);
                  spawnScore('DATA ASTRONOMI TERCATAT! +35 XP +1 ⭐', '#38BDF8', 0, -80);
                  setActiveStargazerModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 text-slate-950 font-black font-game text-sm shadow-xl cursor-pointer active:scale-95 transition-all"
              >
                🛰️ SIMPAN PETA BINTANG (+35 XP +1 ⭐)
              </button>
            </motion.div>
          </div>
        )}

        {/* 3D ROOM INSTANT TELEPORT SWITCHER MODAL (10 ROOMS) */}
        {activeRoomSelectModal && allRooms && (
          <div className="fixed inset-0 z-[850] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl text-white font-sans max-h-[88vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🧭</span>
                  <div>
                    <h3 className="font-game font-black text-amber-300 text-lg">PILIH RUANGAN 3D EKSPLORASI</h3>
                    <p className="text-xs text-slate-400">Pindah Seketika ke Berbagai Ruangan 3D Keren</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRoomSelectModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 py-1">
                {allRooms.map((rm) => {
                  const isCurrent = rm.id === room.id;
                  const icon =
                    rm.theme === 'bedroom'
                      ? '🛏️'
                      : rm.theme === 'attic'
                      ? '🗝️'
                      : rm.theme === 'classroom'
                      ? '🏫'
                      : rm.theme === 'lab'
                      ? '🔬'
                      : rm.theme === 'cafe'
                      ? '☕'
                      : rm.theme === 'cabin'
                      ? '🏡'
                      : rm.theme === 'treehouse'
                      ? '🏕️'
                      : '🚀';

                  return (
                    <button
                      key={rm.id}
                      onClick={() => {
                        audio.playDoorOpen();
                        onChangeRoom?.(rm.id);
                        setActiveRoomSelectModal(false);
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer active:scale-95 ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800/90 border-slate-700 hover:border-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{icon}</span>
                        <div>
                          <div className="font-game font-black text-xs text-white flex items-center gap-1.5">
                            <span>{rm.nameId}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                                AKTIF
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{rm.subtitleId}</div>
                        </div>
                      </div>
                      <span className="text-xs text-amber-300 font-bold">MASUK ➔</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveRoomSelectModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-game font-bold text-xs cursor-pointer"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING POPUP SCORES */}
      {floatingScores.map(score => (
        <motion.div
          key={score.id}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -65, scale: 1.25 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute pointer-events-none z-[850] font-black text-sm md:text-lg font-game drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
          style={{
            left: `${score.x}px`,
            top: `${score.y}px`,
            transform: 'translate(-50%, -50%)',
            color: score.color,
          }}
        >
          {score.text}
        </motion.div>
      ))}

      {/* ERGONOMIC BOTTOM DOCK: JOYSTICK & ACTION BUTTONS */}
      <div className="absolute inset-0 pointer-events-none z-[600] flex flex-col justify-end p-4 md:p-6">
        <div className="w-full flex items-end justify-between">
          {/* Virtual Touch Joystick */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="joystick-container w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-950/50 backdrop-blur-md border-2 border-amber-400/50 flex items-center justify-center pointer-events-auto touch-none shadow-2xl active:bg-slate-950/70 cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 shadow-xl border-2 border-white flex items-center justify-center transition-transform"
              style={{
                transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-950/70" />
            </div>
          </div>

          {/* Quick instructions in center */}
          <div className="hidden lg:flex flex-col items-center gap-1 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 text-[10px] text-slate-300 font-game">
            <div className="text-amber-300 font-bold">🎮 KONTROL EKSPLORASI 3D:</div>
            <div>[W/A/S/D] atau [PANAH] Bergerak • [SPASI] Lompat • [E] Aksi Objek</div>
            <div className="text-slate-400">💡 Tendang Bola ⚽ • Jukebox 📻 • Cermin Kostum 🪞 • Tempat Tidur 🛏️</div>
          </div>

          {/* Action Buttons: Sprint, Emote, Interact & Jump */}
          <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
            {/* Sprint / Turbo Run Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                audio.playButtonClick();
                setSprintMode(!sprintMode);
                spawnScore(!sprintMode ? '⚡ LARI CEPAT 3D AKTIF!' : '🚶 JALAN BIASA', '#F59E0B', 0, -50);
              }}
              className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 cursor-pointer ${
                sprintMode
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-white ring-4 ring-amber-300 animate-pulse'
                  : 'bg-slate-900/80 text-amber-300 border-amber-400/50 hover:border-amber-400'
              }`}
              title="Toggle Lari Cepat 3D (Shift)"
            >
              <span className="text-lg sm:text-xl">⚡</span>
              <span className="font-game text-[8px] sm:text-[9px] uppercase font-black">
                {sprintMode ? 'SPRINT' : 'LARI'}
              </span>
            </motion.button>

            {/* Emote Actions Menu Button */}
            <div className="relative">
              {showEmoteMenu && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute bottom-16 sm:bottom-20 right-0 mb-2 w-52 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-purple-400 p-2 shadow-2xl flex flex-col gap-1.5 z-50 text-white font-game"
                >
                  <div className="text-[10px] text-purple-300 font-bold px-2 py-0.5 border-b border-purple-500/30 flex items-center justify-between">
                    <span>✨ AKSI HERO 3D:</span>
                    <button
                      onClick={() => setShowEmoteMenu(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={() => handlePerformEmote('dance')}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-pink-500 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-base">💃</span>
                    <div>
                      <div className="font-black">Joget Putar 360°</div>
                      <div className="text-[9px] text-pink-300">Sparks & Disco Flip!</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePerformEmote('jurus')}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-xs font-black transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-base">👑</span>
                    <div>
                      <div className="font-black text-amber-300">Jurus Sahabat Kafa!</div>
                      <div className="text-[9px] text-amber-200">Aura Emas & Suara Hero</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePerformEmote('kick')}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-base">🚀</span>
                    <div>
                      <div className="font-black">Tendangan Roket ⚽</div>
                      <div className="text-[9px] text-cyan-300">Tembak Langsung ke Gawang!</div>
                    </div>
                  </button>
                </motion.div>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmoteMenu(!showEmoteMenu)}
                className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 cursor-pointer ${
                  showEmoteMenu
                    ? 'bg-purple-600 text-white border-white ring-4 ring-purple-300'
                    : 'bg-slate-900/80 text-purple-300 border-purple-400/50 hover:border-purple-400'
                }`}
                title="Menu Aksi Keren Hero 3D"
              >
                <span className="text-lg sm:text-xl">✨</span>
                <span className="font-game text-[8px] sm:text-[9px] uppercase font-black">AKSI</span>
              </motion.button>
            </div>

            {/* Interact Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerInteraction}
              className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 cursor-pointer ${
                nearVocab ||
                nearDoor ||
                nearChest ||
                nearLaptop ||
                nearBookshelf ||
                nearPet ||
                nearJukebox ||
                nearMirror ||
                nearBlackboard ||
                nearLabBench ||
                nearFireplace ||
                nearBakery ||
                nearStargazer
                  ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300 animate-pulse'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700'
              }`}
            >
              <span className="text-lg sm:text-xl">🔍</span>
              <span className="font-game text-[8px] sm:text-[9px] uppercase font-black">SENTUH</span>
            </motion.button>

            {/* Jump Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerJump}
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-slate-900/80 text-white font-bold text-xs shadow-2xl border-2 border-slate-700 flex flex-col items-center justify-center active:scale-95 cursor-pointer hover:border-emerald-400"
            >
              <span className="text-lg sm:text-xl">🦘</span>
              <span className="font-game text-[8px] sm:text-[9px] uppercase font-black">LOMPAT</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
