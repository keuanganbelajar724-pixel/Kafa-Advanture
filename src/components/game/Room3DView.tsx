import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CharacterConfig, VocabItem, RoomConfig } from '../../types/game';
import { audio } from '../../services/audio';

interface Room3DViewProps {
  room: RoomConfig;
  character: CharacterConfig;
  discoveredWords: string[];
  onInteractVocab: (item: VocabItem) => void;
  onCollectCoin: (amount: number) => void;
  onCollectStar: (amount: number) => void;
  onUpdateCharacter?: (config: CharacterConfig) => void;
  onExitRoom: () => void;
}

type CameraViewMode = 'isometric' | 'orbit' | 'cinematic';
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

export const Room3DView: React.FC<Room3DViewProps> = ({
  room,
  character,
  discoveredWords,
  onInteractVocab,
  onCollectCoin,
  onCollectStar,
  onUpdateCharacter,
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

  // Proximity states
  const [nearVocab, setNearVocab] = useState<VocabItem | null>(null);
  const [nearDoor, setNearDoor] = useState<boolean>(false);
  const [nearChest, setNearChest] = useState<boolean>(false);
  const [nearLaptop, setNearLaptop] = useState<boolean>(false);
  const [nearBookshelf, setNearBookshelf] = useState<boolean>(false);
  const [nearPet, setNearPet] = useState<boolean>(false);
  const [nearJukebox, setNearJukebox] = useState<boolean>(false);
  const [nearMirror, setNearMirror] = useState<boolean>(false);

  const nearVocabRef = useRef<VocabItem | null>(null);
  const nearDoorRef = useRef<boolean>(false);
  const nearChestRef = useRef<boolean>(false);
  const nearLaptopRef = useRef<boolean>(false);
  const nearBookshelfRef = useRef<boolean>(false);
  const nearPetRef = useRef<boolean>(false);
  const nearJukeboxRef = useRef<boolean>(false);
  const nearMirrorRef = useRef<boolean>(false);

  // Modals for special interactive 3D items
  const [activeLaptopModal, setActiveLaptopModal] = useState<boolean>(false);
  const [activeBookshelfModal, setActiveBookshelfModal] = useState<boolean>(false);
  const [activeMirrorModal, setActiveMirrorModal] = useState<boolean>(false);
  const [laptopQuizAnswered, setLaptopQuizAnswered] = useState<boolean>(false);

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
    } else if (nearPetRef.current) {
      handlePetInteract();
    } else if (nearVocabRef.current) {
      handleItemInteract(nearVocabRef.current);
    }
  }, [isChestOpened, handleOpenChest, handleJukeboxInteract, handleItemInteract, handlePetInteract, onExitRoom]);

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

    // Furniture models by theme
    if (room.theme === 'bedroom' || room.theme === 'cabin') {
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
    } else {
      const labGroup = new THREE.Group();
      labGroup.position.set(-2.4, 0, -2.4);
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 1.3, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
      );
      bench.position.set(0, 0.65, 0);
      bench.castShadow = true;
      labGroup.add(bench);
      furnitureGroup.add(labGroup);
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
      const speed = 4.3;
      const p = playerPosRef.current;

      if (inputLen > 0.1) {
        const normX = (moveX / inputLen) * speed;
        const normZ = (moveZ / inputLen) * speed;
        p.vx = normX;
        p.vz = normZ;
        p.rotY = Math.atan2(normX, normZ);

        const now = Date.now();
        if (now - lastFootstep.current > 310 && p.isGrounded) {
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
      // 3D SOCCER BALL PHYSICS & KICKING
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

      // Check collision between player and ball
      const bdx = b.x - p.x;
      const bdz = b.z - p.z;
      const bdist = Math.sqrt(bdx * bdx + bdz * bdz);
      if (bdist < 0.65 && p.y < 0.8) {
        const now = Date.now();
        if (now - lastKickTime.current > 240) {
          lastKickTime.current = now;
          const kickSpeed = Math.max(3.8, Math.sqrt(p.vx * p.vx + p.vz * p.vz) * 1.6);
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

      // Camera follow modes
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
        const camOffsetZ = Math.cos(p.rotY) * -3.2;
        const camOffsetX = Math.sin(p.rotY) * -3.2;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, p.x + camOffsetX, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, p.y + 2.8, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, p.z + camOffsetZ, 5, delta);
        camera.lookAt(p.x, p.y + 1.4, p.z);
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
              className={`px-2.5 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg text-[10px] font-game font-bold transition-all cursor-pointer ${
                cameraMode === 'cinematic' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
              title="Kamera Sinematik Dekat"
            >
              🎬 DEKAT
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
        {(nearVocab || nearDoor || (nearChest && !isChestOpened) || nearLaptop || nearBookshelf || nearPet || nearJukebox || nearMirror) && (
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

          {/* Action Buttons: Jump & Interact */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            {/* Interact Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerInteraction}
              className={`w-16 h-16 md:w-18 md:h-18 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-2xl transition-all border-2 cursor-pointer ${
                nearVocab || nearDoor || nearChest || nearLaptop || nearBookshelf || nearPet || nearJukebox || nearMirror
                  ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-300 animate-pulse'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700'
              }`}
            >
              <span className="text-xl">🔍</span>
              <span className="font-game text-[9px] uppercase font-black">AKSI</span>
            </motion.button>

            {/* Jump Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={triggerJump}
              className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-slate-900/80 text-white font-bold text-xs shadow-2xl border-2 border-slate-700 flex flex-col items-center justify-center active:scale-95 cursor-pointer hover:border-emerald-400"
            >
              <span className="text-xl">🦘</span>
              <span className="font-game text-[9px] uppercase font-black">LOMPAT</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
