export type GameScreen = 
  | 'SPLASH'
  | 'MAIN_MENU'
  | 'CHARACTER_SELECT'
  | 'GAME_WORLD'
  | 'WORLD_MAP'
  | 'VOCAB_COLLECTION'
  | 'BADGES'
  | 'MINI_GAME'
  | 'HARVEST_FARM';

export type MiniGameType = 
  | 'FIND_IT'
  | 'MATCH_IT'
  | 'LISTEN_AND_FIND'
  | 'WORD_PUZZLE'
  | 'BUILD_SENTENCE'
  | 'MATH_CHALLENGE'
  | 'SCIENCE_QUIZ'
  | 'RELIGION_VALUES'
  | 'ENGLISH_QUEST'
  | 'INDONESIA_CHALLENGE'
  | 'PPKN_CHALLENGE';

export type SDSubject = 'indonesia' | 'matematika' | 'ipa' | 'inggris' | 'agama';

export interface SubjectItemData {
  title: string;
  fact: string;
  quiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

export type RobotModelId = 
  | 'robo_smart'
  | 'robo_farmer'
  | 'robo_astro'
  | 'robo_spark'
  | 'robo_aqua'
  | 'robo_titan';

export interface RobotModelMeta {
  id: RobotModelId;
  name: string;
  role: string;
  description: string;
  emoji: string;
  defaultColor: string;
  defaultBackpack: string;
  defaultHat: string;
  perk: string;
}

export interface CharacterConfig {
  name: string;
  robotModel?: RobotModelId;
  gender?: 'boy' | 'girl'; // backward compatibility
  outfitColor: string; // chassis armor color
  backpackColor: string; // battery / booster / solar pack
  hat: 'cap' | 'explorer' | 'none' | 'antenna' | 'radar' | 'propeller' | 'horns' | string;
}

// ==========================================
// HARVEST MOON FARM ADVENTURE DATA MODELS
// ==========================================
export type CropType = 'corn' | 'tomato' | 'carrot' | 'strawberry' | 'watermelon' | 'rice';
export type FarmGrowthStage = 0 | 1 | 2 | 3; // 0=Benih/Seed, 1=Tunas/Sprout, 2=Berbunga/Flowering, 3=Panen/Ripe

export interface FarmTile {
  id: number;
  tilled: boolean;
  watered: boolean;
  crop: CropType | null;
  stage: FarmGrowthStage;
  plantedAt?: number;
}

export interface FarmAnimal {
  id: string;
  name: string;
  nameId: string;
  type: 'cow' | 'hen' | 'sheep';
  emoji: string;
  fed: boolean;
  productReady: boolean;
  productName: string;
  productNameId: string;
  productEmoji: string;
  productValue: number;
}

export interface FarmInventory {
  seeds: Record<CropType, number>;
  crops: Record<CropType, number>;
  animalProducts: {
    milk: number;
    egg: number;
    wool: number;
  };
}

export interface FarmSaveData {
  tiles: FarmTile[];
  animals: FarmAnimal[];
  inventory: FarmInventory;
  farmDay: number;
  season: 'spring' | 'summer' | 'fall';
}

export interface PlayerPhysics {
  x: number;
  y: number; // ground position on world plane
  z: number; // jump height off ground
  vx: number;
  vy: number;
  vz: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking' | 'running' | 'jumping' | 'celebrating';
  isGrounded: boolean;
}

export type WordCategory = 'home' | 'school' | 'food' | 'animals' | 'nature' | 'city' | 'tools' | 'space';

export interface VocabItem {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  category: WordCategory;
  emoji: string;
  description: string;
  exampleSentence: string;
  xp: number;
  coins: number;
  worldPosition: { x: number; y: number }; // world coordinate in meters/pixels
  size: { w: number; h: number };
  interactRadius: number;
  primarySubject?: SDSubject;
  subjects?: {
    indonesia?: SubjectItemData;
    matematika?: SubjectItemData;
    ipa?: SubjectItemData;
    inggris?: SubjectItemData;
    agama?: SubjectItemData;
  };
}

export interface CollectibleItem {
  id: string;
  type: 'coin' | 'star';
  x: number;
  y: number;
  collected: boolean;
  value: number;
}

export interface WorldObstacle {
  id: string;
  type: 'rock' | 'puddle' | 'fence' | 'crate';
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  emoji: string;
  x: number;
  y: number;
  dialogue: {
    text: string;
    indonesianText: string;
    speechPrompt: string;
  };
  questTitle: string;
  questDescription: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetWords: string[];
  reward: {
    xp: number;
    coins: number;
    stars: number;
  };
}

export interface StoryStep {
  step: number;
  speechText: string;
  indonesianText: string;
  targetWordId: string;
  itemHint: string;
}

export interface MysteryBlock {
  id: string;
  x: number;
  y: number;
  z: number;
  type: 'coin' | 'star' | 'word';
  wordId?: string;
  hit: boolean;
}

export interface LevelPlatform {
  id: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  type: 'brick' | 'cloud' | 'wood' | 'pipe';
}

export interface LevelBouncer {
  id: string;
  x: number;
  y: number;
  power: number;
}

export interface LevelEnemy {
  id: string;
  name: string;
  type: 'goomba' | 'spiky' | 'piranha' | 'bee';
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  direction: 'left' | 'right';
  defeated?: boolean;
  squashed?: boolean;
  isAggro?: boolean;
  lastShootTime?: number;
}

export type HeroPowerType =
  | 'sahabat_kafa'    // 👑 Jurus Sahabat Kafa Power (Flagship)
  | 'star_blast'      // ⚡ Tembakan Bintang Beruntun
  | 'tornado_spin'    // 🌪️ Topan Badai Putar
  | 'fire_dragon'     // 🔥 Bola Api Naga
  | 'thunder_pound'   // 💥 Hantaman Gempa Petir
  | 'star_shield'     // 🛡️ Perisai Pelindung Bintang
  | 'cosmic_nova';    // ✨ Super Nova Ultimate

export interface HeroPowerConfig {
  id: HeroPowerType;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  keyHint: string;
  cooldownMs: number;
  energyCost: number;
}

export interface PlayerProjectile {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy?: number;
  type: 'star_blast' | 'fire_dragon' | 'tornado_spin' | 'cosmic_nova' | 'sahabat_kafa';
  createdAt: number;
  piercing?: boolean;
  radius?: number;
}

export interface EnemyProjectile {
  id: string;
  enemyId: string;
  x: number;
  y: number;
  vx: number;
  type: 'fireball' | 'stinger' | 'spike';
  createdAt: number;
}

export interface DoorPortal {
  id: string;
  roomId: string;
  name: string;
  x: number;
  y: number;
  label?: string;
  icon?: string;
}

export interface RoomDecoration {
  id: string;
  type: string;
  x: number;
  y: number;
  z?: number;
  w: number;
  h: number;
  label?: string;
  color?: string;
}

export interface RoomConfig {
  id: string;
  name: string;
  nameId: string;
  subtitle: string;
  subtitleId: string;
  theme: 'bedroom' | 'classroom' | 'cabin' | 'attic' | 'cafe' | 'lab' | 'treehouse' | 'cockpit';
  width: number;
  minY: number;
  maxY: number;
  wallColor: string;
  floorPattern: 'wood' | 'carpet' | 'tile';
  windowView: 'forest' | 'garden' | 'sky';
  doorEntrance: { x: number; y: number };
  playerStartX: number;
  playerStartY: number;
  vocabItems: VocabItem[];
  collectibles?: CollectibleItem[];
  decorations?: RoomDecoration[];
  hasSecretChest?: boolean;
}

export interface LevelZone {
  id: string;
  name: string;
  nameId: string;
  startX: number;
  endX: number;
  icon: string;
}

export interface SpeedPad {
  id: string;
  x: number;
  y: number;
}

export interface GameLevel {
  id: number;
  areaId: string;
  name: string;
  nameId: string;
  subtitle: string;
  subtitleId: string;
  icon: string;
  bgImage: string;
  themeColor: string;
  groundY: number;
  worldWidth: number;
  playerStartX: number;
  playerStartY: number;
  mission: Mission;
  storySteps?: StoryStep[];
  mysteryBlocks?: MysteryBlock[];
  platforms?: LevelPlatform[];
  bouncers?: LevelBouncer[];
  speedPads?: SpeedPad[];
  zones?: LevelZone[];
  enemies?: LevelEnemy[];
  hasFlagpole?: boolean;
  missionHints: { [wordId: string]: string };
  vocabItems: VocabItem[];
  collectibles: CollectibleItem[];
  obstacles: WorldObstacle[];
  npc: NPCCharacter;
  doorPortals?: DoorPortal[];
  rooms?: RoomConfig[];
  subjects?: SDSubject[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'words' | 'missions' | 'exploration' | 'games';
}

export type LanguageMode = 'id' | 'en' | 'bilingual';

export interface PlayerSaveData {
  character: CharacterConfig;
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  stars: number;
  hearts?: number; // legacy optional (player is invincible now)
  energy: number; // 0 to 100 power meter
  maxEnergy: number;
  activePower: HeroPowerType;
  unlockedPowers: HeroPowerType[];
  currentLevelId: number;
  unlockedLevelIds: number[];
  discoveredWords: string[];
  completedMissions: string[];
  unlockedAreas: string[];
  unlockedBadges: string[];
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hasSeenIntro: boolean;
  languageMode: LanguageMode;
  selectedSubject?: SDSubject;
  graphicSettings?: PS3GraphicSettings;
  farmData?: FarmSaveData;
}

export interface PS3GraphicSettings {
  cleanBackgroundMode: boolean; // Clean, spacious, uncluttered background for optimal focus
  bloomGlow: boolean;
  volumetricRays: boolean;
  parallaxBokeh: boolean;
  heroRimLight: boolean;
  cinematicVignette: boolean;
  dualshockPrompts: boolean;
  highDefShadows: boolean;
  cameraZoom?: 'wide' | 'standard' | 'close';
  atmospherePreset?: 'day' | 'golden' | 'night' | 'wonder';
  floorReflections?: boolean;
  impactJuice?: boolean;
}

export interface PS3TrophyNotification {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  icon?: string;
}
