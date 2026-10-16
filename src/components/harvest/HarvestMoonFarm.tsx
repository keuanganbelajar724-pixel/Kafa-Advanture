import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PlayerSaveData, CharacterConfig, CropType, FarmTile, FarmAnimal, FarmInventory } from '../../types/game';
import { audio } from '../../services/audio';
import { RoboHero } from '../game/RoboHero';

interface HarvestMoonFarmProps {
  saveData: PlayerSaveData;
  character: CharacterConfig;
  onAddCoins: (amt: number) => void;
  onAddXp: (amt: number) => void;
  onBack: () => void;
}

interface CropInfo {
  id: CropType;
  name: string;
  nameId: string;
  emoji: string;
  seedPrice: number;
  sellPrice: number;
  growthTimeSec: number;
  description: string;
}

const CROPS: Record<CropType, CropInfo> = {
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    nameId: 'Wortel',
    emoji: '🥕',
    seedPrice: 4,
    sellPrice: 12,
    growthTimeSec: 6,
    description: 'Carrot = Wortel. Sayuran renyah kaya vitamin A!',
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    nameId: 'Tomat',
    emoji: '🍅',
    seedPrice: 6,
    sellPrice: 18,
    growthTimeSec: 8,
    description: 'Tomato = Tomat. Buah merah segar kaya nutrisi!',
  },
  corn: {
    id: 'corn',
    name: 'Corn',
    nameId: 'Jagung',
    emoji: '🌽',
    seedPrice: 5,
    sellPrice: 16,
    growthTimeSec: 7,
    description: 'Corn = Jagung. Biji kuning manis kaya karbohidrat!',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    nameId: 'Stroberi',
    emoji: '🍓',
    seedPrice: 10,
    sellPrice: 30,
    growthTimeSec: 10,
    description: 'Strawberry = Stroberi. Buah manis kesukaan anak-anak!',
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    nameId: 'Semangka',
    emoji: '🍉',
    seedPrice: 12,
    sellPrice: 38,
    growthTimeSec: 12,
    description: 'Watermelon = Semangka. Buah bulat manis kaya air!',
  },
  rice: {
    id: 'rice',
    name: 'Rice',
    nameId: 'Padi',
    emoji: '🌾',
    seedPrice: 5,
    sellPrice: 15,
    growthTimeSec: 7,
    description: 'Rice = Padi / Beras. Makanan pokok yang tumbuh subur!',
  },
};

const FARM_WORDS = [
  { en: 'Farmer', idWord: 'Petani', icon: '🧑‍🌾', sentence: 'The robot is a diligent farmer.' },
  { en: 'Hoe', idWord: 'Cangkul', icon: '⛏️', sentence: 'Use a hoe to till the soil.' },
  { en: 'Watering Can', idWord: 'Alat Penyiram', icon: '🚰', sentence: 'Water the plants with a watering can.' },
  { en: 'Seed', idWord: 'Benih / Bibit', icon: '🌱', sentence: 'Plant a seed in fertile soil.' },
  { en: 'Soil', idWord: 'Tanah Subur', icon: '🪴', sentence: 'The soil is rich and dark.' },
  { en: 'Harvest', idWord: 'Panen', icon: '🌾', sentence: 'Time to harvest the sweet corn.' },
  { en: 'Carrot', idWord: 'Wortel', icon: '🥕', sentence: 'A healthy orange carrot.' },
  { en: 'Tomato', idWord: 'Tomat', icon: '🍅', sentence: 'A juicy red tomato.' },
  { en: 'Corn', idWord: 'Jagung', icon: '🌽', sentence: 'Sweet corn grows tall in the sun.' },
  { en: 'Strawberry', idWord: 'Stroberi', icon: '🍓', sentence: 'Fresh strawberries in the basket.' },
  { en: 'Cow', idWord: 'Sapi', icon: '🐄', sentence: 'The robot cow gives fresh milk.' },
  { en: 'Milk', idWord: 'Susu', icon: '🥛', sentence: 'Drink a glass of cold milk.' },
  { en: 'Hen', idWord: 'Ayam', icon: '🐔', sentence: 'The mecha hen lays golden eggs.' },
  { en: 'Egg', idWord: 'Telur', icon: '🥚', sentence: 'Collect fresh eggs every morning.' },
  { en: 'Sheep', idWord: 'Domba', icon: '🐑', sentence: 'The cloud sheep has soft wool.' },
  { en: 'Wool', idWord: 'Wol', icon: '🧶', sentence: 'Soft warm wool for sweaters.' },
  { en: 'Barn', idWord: 'Kandang Ternak', icon: '🏡', sentence: 'Animals sleep inside the cozy barn.' },
  { en: 'Shipping Bin', idWord: 'Kotak Penjualan', icon: '📦', sentence: 'Sell your harvest in the shipping bin.' },
];

const FARM_SCIENCE_FACTS = [
  {
    topic: 'Fotosintesis Tumbuhan',
    emoji: '🌱☀️',
    fact: 'Tanaman di kebun memasak makanan menggunakan sinar matahari, air dari sumur, dan udara.',
    en: 'Plants make their own food using sunlight, water, and air (photosynthesis).',
  },
  {
    topic: 'Kandungan Vitamin Wortel',
    emoji: '🥕👀',
    fact: 'Wortel (Carrot) kaya vitamin A dan beta-karoten yang membuat mata anak tajam dan sehat.',
    en: 'Carrots are packed with Vitamin A, which is super healthy for our eyes.',
  },
  {
    topic: 'Susu Segar Sapi Robot',
    emoji: '🐄🥛',
    fact: 'Susu (Milk) mengandung kalsium tinggi dan protein untuk memperkuat tulang dan gigi anak.',
    en: 'Milk is full of calcium and protein that make our bones and teeth strong.',
  },
  {
    topic: 'Telur Ayam Penuh Protein',
    emoji: '🐔🥚',
    fact: 'Telur (Egg) adalah sumber protein lengkap yang membantu pertumbuhan otot dan kecerdasan.',
    en: 'Eggs provide high-quality protein that helps kids grow tall and smart.',
  },
  {
    topic: 'Manfaat Menanam & Berkebun',
    emoji: '🌾🧑‍🌾',
    fact: 'Berkebun mengajarkan rasa sabar, cinta alam semesta, dan rasa syukur atas nikmat pangan.',
    en: 'Farming teaches us patience, love for nature, and gratitude for our food.',
  },
];

const FARM_QUIZ_QUESTIONS = [
  {
    q: 'What is the English word for "Cangkul"?',
    options: ['Hoe', 'Watering Can', 'Basket'],
    ans: 0,
    exp: '"Hoe" is cangkul to till the soil.',
  },
  {
    q: 'Which robot animal gives fresh MILK in the farm?',
    options: ['Hen (Ayam)', 'Cow (Sapi)', 'Sheep (Domba)'],
    ans: 1,
    exp: 'Robo-Cow gives fresh milk!',
  },
  {
    q: 'What nutrient is rich in orange CARROTS?',
    options: ['Vitamin A', 'Vitamin C', 'Zat Besi'],
    ans: 0,
    exp: 'Wortel (Carrot) sangat kaya Vitamin A untuk kesehatan mata!',
  },
  {
    q: 'What is "Panen" in English?',
    options: ['Plant', 'Water', 'Harvest'],
    ans: 2,
    exp: '"Harvest" means panen hasil pertanian.',
  },
  {
    q: 'What does the Hen (Ayam) produce?',
    options: ['Egg (Telur)', 'Wool (Wol)', 'Milk (Susu)'],
    ans: 0,
    exp: 'The Hen produces eggs (telur).',
  },
];

// 12 Tile Plot coordinates in the walkable farm world (px)
const PLOT_COORDINATES = [
  { id: 1, x: 180, y: 310 },
  { id: 2, x: 265, y: 310 },
  { id: 3, x: 350, y: 310 },
  { id: 4, x: 435, y: 310 },
  { id: 5, x: 180, y: 395 },
  { id: 6, x: 265, y: 395 },
  { id: 7, x: 350, y: 395 },
  { id: 8, x: 435, y: 395 },
  { id: 9, x: 180, y: 480 },
  { id: 10, x: 265, y: 480 },
  { id: 11, x: 350, y: 480 },
  { id: 12, x: 435, y: 480 },
];

export const HarvestMoonFarm: React.FC<HarvestMoonFarmProps> = ({
  saveData,
  character,
  onAddCoins,
  onAddXp,
  onBack,
}) => {
  // Farm Mode: Selected Tool & Seed
  const [selectedTool, setSelectedTool] = useState<'hoe' | 'water' | 'seed' | 'harvest' | 'fertilizer'>('hoe');
  const [selectedSeed, setSelectedSeed] = useState<CropType>('carrot');

  // Mute toggle
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getIsMuted());

  // Farm Day & Stamina
  const [farmDay, setFarmDay] = useState<number>(1);
  const [farmEnergy, setFarmEnergy] = useState<number>(100);
  const [clockHour, setClockHour] = useState<number>(8); // 8:00 AM

  // Walkable Player Position on the farm (px)
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 290, y: 240 });
  const [playerFacing, setPlayerFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [toolActionAnim, setToolActionAnim] = useState<string | null>(null);

  // Floating notifications & dust
  const [floatingToast, setFloatingToast] = useState<string | null>(null);
  const [actionFx, setActionFx] = useState<{ x: number; y: number; text: string; icon: string } | null>(null);

  // Modals (Shop / Basket / Full Vocab / English Adventure Book)
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showBasketModal, setShowBasketModal] = useState<boolean>(false);
  const [showSeedPicker, setShowSeedPicker] = useState<boolean>(false);
  const [showFarmBookModal, setShowFarmBookModal] = useState<boolean>(false);
  const [farmBookTab, setFarmBookTab] = useState<'vocab' | 'science' | 'quiz'>('vocab');
  const [farmQuizIdx, setFarmQuizIdx] = useState<number>(0);
  const [farmQuizSelected, setFarmQuizSelected] = useState<number | null>(null);
  const [farmQuizAnswered, setFarmQuizAnswered] = useState<boolean>(false);

  // Key tracking ref & Mobile D-pad refs
  const keysRef = useRef<Record<string, boolean>>({});
  const mobileLeftRef = useRef<boolean>(false);
  const mobileRightRef = useRef<boolean>(false);
  const mobileUpRef = useRef<boolean>(false);
  const mobileDownRef = useRef<boolean>(false);
  const farmAreaRef = useRef<HTMLDivElement>(null);

  // 12 Farm Plots state
  const [tiles, setTiles] = useState<FarmTile[]>(() => [
    { id: 1, tilled: true, watered: true, crop: 'carrot', stage: 2, plantedAt: Date.now() - 4000 },
    { id: 2, tilled: true, watered: true, crop: 'tomato', stage: 3, plantedAt: Date.now() - 10000 },
    { id: 3, tilled: true, watered: false, crop: 'corn', stage: 1, plantedAt: Date.now() - 2000 },
    { id: 4, tilled: false, watered: false, crop: null, stage: 0 },
    { id: 5, tilled: true, watered: true, crop: 'strawberry', stage: 3, plantedAt: Date.now() - 12000 },
    { id: 6, tilled: true, watered: true, crop: 'watermelon', stage: 2, plantedAt: Date.now() - 6000 },
    { id: 7, tilled: false, watered: false, crop: null, stage: 0 },
    { id: 8, tilled: true, watered: false, crop: null, stage: 0 },
    { id: 9, tilled: true, watered: true, crop: 'rice', stage: 3, plantedAt: Date.now() - 9000 },
    { id: 10, tilled: false, watered: false, crop: null, stage: 0 },
    { id: 11, tilled: true, watered: false, crop: null, stage: 0 },
    { id: 12, tilled: false, watered: false, crop: null, stage: 0 },
  ]);

  // Inventory
  const [inventory, setInventory] = useState<FarmInventory>(() => ({
    seeds: { carrot: 5, tomato: 4, corn: 4, strawberry: 2, watermelon: 2, rice: 3 },
    crops: { carrot: 3, tomato: 2, corn: 1, strawberry: 0, watermelon: 0, rice: 0 },
    animalProducts: { milk: 1, egg: 2, wool: 1 },
  }));

  // Friendly Robot Animals with dynamic world coordinates in pasture
  const [animals, setAnimals] = useState<(FarmAnimal & { x: number; y: number; dir: 'left' | 'right' })[]>(() => [
    {
      id: 'cow_1',
      name: 'Robo-Cow Meka',
      nameId: 'Sapi Robot 🐄',
      type: 'cow',
      emoji: '🐄',
      fed: true,
      productReady: true,
      productName: 'Fresh Milk',
      productNameId: 'Susu Segar',
      productEmoji: '🥛',
      productValue: 25,
      x: 650,
      y: 210,
      dir: 'left',
    },
    {
      id: 'hen_1',
      name: 'Mecha-Hen Chicky',
      nameId: 'Ayam Mekanik 🐔',
      type: 'hen',
      emoji: '🐔',
      fed: true,
      productReady: true,
      productName: 'Golden Egg',
      productNameId: 'Telur Emas',
      productEmoji: '🥚',
      productValue: 15,
      x: 750,
      y: 270,
      dir: 'right',
    },
    {
      id: 'sheep_1',
      name: 'Cloud-Sheep Fluffy',
      nameId: 'Domba Awan 🐑',
      type: 'sheep',
      emoji: '🐑',
      fed: false,
      productReady: false,
      productName: 'Soft Wool',
      productNameId: 'Wol Hangat',
      productEmoji: '🧶',
      productValue: 30,
      x: 820,
      y: 190,
      dir: 'left',
    },
  ]);

  // Active educational vocabulary card
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const currentVocab = FARM_WORDS[vocabIndex];

  const showToast = (text: string) => {
    setFloatingToast(text);
    setTimeout(() => setFloatingToast(null), 2500);
  };

  const spawnFx = (x: number, y: number, text: string, icon: string) => {
    setActionFx({ x, y, text, icon });
    setTimeout(() => setActionFx(null), 1800);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = audio.toggleMute();
    setIsMuted(next);
  };

  // Grow crops over time
  useEffect(() => {
    const interval = setInterval(() => {
      setTiles(prev =>
        prev.map(tile => {
          if (!tile.crop || tile.stage >= 3) return tile;
          if (!tile.watered) return tile; // needs water to grow!

          if (Math.random() < 0.35) {
            return {
              ...tile,
              stage: (Math.min(3, tile.stage + 1) as 0 | 1 | 2 | 3),
              watered: tile.stage + 1 < 3 ? false : tile.watered,
            };
          }
          return tile;
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Autonomous wandering of robot animals inside their pasture
  useEffect(() => {
    const wanderInterval = setInterval(() => {
      setAnimals(prev =>
        prev.map(a => {
          const dx = (Math.random() - 0.5) * 50;
          const dy = (Math.random() - 0.5) * 40;
          const newX = Math.min(880, Math.max(610, a.x + dx));
          const newY = Math.min(320, Math.max(160, a.y + dy));
          return {
            ...a,
            x: newX,
            y: newY,
            dir: dx < 0 ? 'left' : 'right',
          };
        })
      );
    }, 3200);

    return () => clearInterval(wanderInterval);
  }, []);

  // Clock progression
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setClockHour(prev => (prev >= 22 ? 6 : prev + 1));
    }, 18000); // 18s = 1 in-game hour
    return () => clearInterval(clockTimer);
  }, []);

  // Nearest interactive targets detection
  // Farmhouse Bed: { x: 190, y: 180 }
  // Shipping Bin: { x: 310, y: 190 }
  // Water Well: { x: 440, y: 160 }
  // Shop Kiosk: { x: 800, y: 490 }
  const findNearestInteractive = useCallback(() => {
    const px = playerPos.x;
    const py = playerPos.y;

    // 1. Check Plots
    for (const coord of PLOT_COORDINATES) {
      const dist = Math.hypot(px - (coord.x + 36), py - (coord.y + 36));
      if (dist < 64) {
        const tile = tiles.find(t => t.id === coord.id);
        return { type: 'tile' as const, coord, tile };
      }
    }

    // 2. Check Animals
    for (const animal of animals) {
      const dist = Math.hypot(px - animal.x, py - animal.y);
      if (dist < 68) {
        return { type: 'animal' as const, animal };
      }
    }

    // 3. Shipping Bin
    if (Math.hypot(px - 310, py - 190) < 68) {
      return { type: 'shipping_bin' as const };
    }

    // 4. Farmhouse Bed (Sleep)
    if (Math.hypot(px - 190, py - 180) < 68) {
      return { type: 'bed' as const };
    }

    // 5. Water Well
    if (Math.hypot(px - 440, py - 160) < 68) {
      return { type: 'well' as const };
    }

    // 6. Seed Shop
    if (Math.hypot(px - 800, py - 490) < 75) {
      return { type: 'shop' as const };
    }

    return null;
  }, [playerPos, tiles, animals]);

  const nearestTarget = findNearestInteractive();

  // Perform Tile Action
  const interactWithTile = (tileId: number) => {
    const tile = tiles.find(t => t.id === tileId);
    const coord = PLOT_COORDINATES.find(c => c.id === tileId);
    if (!tile || !coord) return;

    const actionX = coord.x + 36;
    const actionY = coord.y + 36;

    if (selectedTool === 'hoe') {
      if (!tile.tilled) {
        audio.playHoeTill();
        setToolActionAnim('hoe');
        setTimeout(() => setToolActionAnim(null), 350);
        setTiles(prev => prev.map(t => (t.id === tileId ? { ...t, tilled: true } : t)));
        onAddXp(2);
        setFarmEnergy(e => Math.max(0, e - 2));
        spawnFx(actionX, actionY, 'CANGKUL! ⛏️', '🌱');
        showToast('⛏️ HOE = CANGKUL: Tanah subur berhasil dicangkul!');
      } else {
        showToast('Tanah ini sudah gembur siap tanam! 🌱');
      }
    } else if (selectedTool === 'water') {
      if (!tile.tilled) {
        showToast('⛏️ Cangkul tanah terlebih dahulu sebelum menyiram!');
        return;
      }
      if (!tile.watered) {
        audio.playWaterPlant();
        setToolActionAnim('water');
        setTimeout(() => setToolActionAnim(null), 350);
        setTiles(prev => prev.map(t => (t.id === tileId ? { ...t, watered: true } : t)));
        onAddXp(2);
        setFarmEnergy(e => Math.max(0, e - 1));
        spawnFx(actionX, actionY, 'SIRAM AIR! 💧', '✨');
        showToast('🚰 WATER = AIR: Tanah berkilau disiram air segar!');
      } else {
        showToast('Tanah sudah basah berkilau! 💧');
      }
    } else if (selectedTool === 'seed') {
      if (!tile.tilled) {
        showToast('⛏️ Cangkul tanah terlebih dahulu!');
        return;
      }
      if (tile.crop) {
        showToast('Sudah ada tanaman di petak ini!');
        return;
      }
      if ((inventory.seeds[selectedSeed] || 0) <= 0) {
        audio.playWrong();
        showToast(`Bibit ${CROPS[selectedSeed].nameId} habis! Beli di Kios Pasar.`);
        return;
      }

      audio.playPlantSeed();
      setToolActionAnim('seed');
      setTimeout(() => setToolActionAnim(null), 350);
      setInventory(prev => ({
        ...prev,
        seeds: {
          ...prev.seeds,
          [selectedSeed]: prev.seeds[selectedSeed] - 1,
        },
      }));
      setTiles(prev =>
        prev.map(t =>
          t.id === tileId
            ? {
                ...t,
                crop: selectedSeed,
                stage: 0,
                plantedAt: Date.now(),
              }
            : t
        )
      );
      onAddXp(3);
      spawnFx(actionX, actionY, `Tanam ${CROPS[selectedSeed].emoji}`, '🌱');
      showToast(`🌱 SEED = BENIH: Menanam ${CROPS[selectedSeed].nameId} (${CROPS[selectedSeed].name})!`);
    } else if (selectedTool === 'fertilizer') {
      if (!tile.crop) {
        showToast('Tanam bibit terlebih dahulu sebelum dipupuk!');
        return;
      }
      audio.playCorrect();
      setToolActionAnim('fertilizer');
      setTimeout(() => setToolActionAnim(null), 350);
      setTiles(prev =>
        prev.map(t => (t.id === tileId ? { ...t, stage: 3, watered: true } : t))
      );
      confetti({ particleCount: 30, spread: 45, origin: { x: actionX / 1000, y: actionY / 700 } });
      spawnFx(actionX, actionY, 'SUPER PUPUK! ✨', '🌟');
      showToast('✨ FERTILIZER = PUPUK: Tanaman langsung berbuah lebat!');
    } else if (selectedTool === 'harvest') {
      if (tile.crop && tile.stage === 3) {
        const crop = CROPS[tile.crop];
        audio.playHarvestCrop();
        setToolActionAnim('harvest');
        setTimeout(() => setToolActionAnim(null), 350);
        confetti({ particleCount: 45, spread: 60, origin: { x: actionX / 1000, y: actionY / 700 } });
        setInventory(prev => ({
          ...prev,
          crops: {
            ...prev.crops,
            [crop.id]: (prev.crops[crop.id] || 0) + 1,
          },
        }));
        setTiles(prev =>
          prev.map(t => (t.id === tileId ? { ...t, crop: null, stage: 0, watered: false } : t))
        );
        onAddXp(8);
        onAddCoins(crop.sellPrice);
        spawnFx(actionX, actionY, `+${crop.sellPrice} Koin`, crop.emoji);
        showToast(`🌾 HARVEST = PANEN: Memetik ${crop.nameId}! +${crop.sellPrice} Koin & +8 XP!`);
      } else if (tile.crop && tile.stage < 3) {
        showToast(`Tanaman ${CROPS[tile.crop].nameId} masih tumbuh. Siram air agar lekas berbuah!`);
      } else {
        showToast('Petak ini belum ada tanaman matang untuk dipanen!');
      }
    }
  };

  // Animal Interaction
  const interactWithAnimal = (animal: typeof animals[0]) => {
    if (!animal.fed) {
      audio.playAnimalPet();
      setAnimals(prev =>
        prev.map(a => (a.id === animal.id ? { ...a, fed: true, productReady: true } : a))
      );
      onAddXp(5);
      spawnFx(animal.x, animal.y, 'Kenyang! ❤️', '🌾');
      showToast(`🌾 FEED = MAKAN: Memberi makan ${animal.nameId}! Hewan sangat senang!`);
    } else if (animal.productReady) {
      audio.playHarvestCrop();
      confetti({ particleCount: 35, spread: 50, origin: { x: animal.x / 1000, y: animal.y / 700 } });
      if (animal.type === 'cow') {
        setInventory(prev => ({
          ...prev,
          animalProducts: { ...prev.animalProducts, milk: prev.animalProducts.milk + 1 },
        }));
      } else if (animal.type === 'hen') {
        setInventory(prev => ({
          ...prev,
          animalProducts: { ...prev.animalProducts, egg: prev.animalProducts.egg + 1 },
        }));
      } else if (animal.type === 'sheep') {
        setInventory(prev => ({
          ...prev,
          animalProducts: { ...prev.animalProducts, wool: prev.animalProducts.wool + 1 },
        }));
      }
      onAddCoins(animal.productValue);
      onAddXp(10);
      setAnimals(prev =>
        prev.map(a => (a.id === animal.id ? { ...a, productReady: false, fed: false } : a))
      );
      spawnFx(animal.x, animal.y, `+${animal.productValue} 🪙`, animal.productEmoji);
      showToast(`✨ Ambil ${animal.productNameId} ${animal.productEmoji}! +${animal.productValue} Koin!`);
    } else {
      audio.playAnimalPet();
      spawnFx(animal.x, animal.y, 'Sahabat! ❤️', '🤖');
      showToast(`${animal.nameId} sedang santai bahagia di padang rumput! ❤️`);
    }
  };

  // Sell All via Shipping Bin
  const handleSellViaBin = () => {
    let totalGain = 0;
    let itemCount = 0;

    Object.entries(inventory.crops).forEach(([cKey, count]) => {
      const crop = CROPS[cKey as CropType];
      if (crop && count > 0) {
        totalGain += crop.sellPrice * count;
        itemCount += count;
      }
    });

    totalGain += inventory.animalProducts.milk * 25;
    totalGain += inventory.animalProducts.egg * 15;
    totalGain += inventory.animalProducts.wool * 30;
    itemCount += inventory.animalProducts.milk + inventory.animalProducts.egg + inventory.animalProducts.wool;

    if (itemCount === 0) {
      showToast('📦 Kotak pengiriman: Keranjang panenmu masih kosong!');
      return;
    }

    audio.playMarketSell();
    confetti({ particleCount: 75, spread: 75 });
    onAddCoins(totalGain);
    onAddXp(Math.round(totalGain * 0.4));

    setInventory(prev => ({
      ...prev,
      crops: { carrot: 0, tomato: 0, corn: 0, strawberry: 0, watermelon: 0, rice: 0 },
      animalProducts: { milk: 0, egg: 0, wool: 0 },
    }));

    spawnFx(310, 190, `+${totalGain} KOIN! 💰`, '🎉');
    showToast(`📦 SHIPPING BIN: Berhasil menjual seluruh hasil panen! +${totalGain} Koin Emas! 🎉`);
  };

  // Sleep in Farmhouse Bed & Start New Day
  const handleSleepNextDay = () => {
    audio.playLevelUp();
    setFarmDay(prev => prev + 1);
    setFarmEnergy(100);
    setClockHour(6); // 6:00 AM Sunrise

    // Advance crops
    setTiles(prev =>
      prev.map(t => {
        if (!t.crop) return t;
        return {
          ...t,
          stage: Math.min(3, t.stage + 1) as 0 | 1 | 2 | 3,
          watered: false,
        };
      })
    );

    // Animals ready
    setAnimals(prev =>
      prev.map(a => ({
        ...a,
        fed: true,
        productReady: true,
      }))
    );

    spawnFx(190, 180, 'HARI BARU! ☀️', '🌸');
    showToast(`☀️ Kring! Hari ke-${farmDay + 1} dimulai! Tanaman tumbuh dan stamina terisi penuh!`);
  };

  // Refill Water at Well
  const handleRefillWell = () => {
    audio.playWaterPlant();
    setFarmEnergy(e => Math.min(100, e + 15));
    spawnFx(440, 160, 'Air Penuh! 🚰', '💧');
    showToast('🚰 WELL = SUMUR: Alat penyiram air penuh dan robot meminum air segar!');
  };

  // Buy Seeds from Store
  const handleBuySeed = (cropType: CropType) => {
    const crop = CROPS[cropType];
    if (saveData.coins < crop.seedPrice) {
      audio.playWrong();
      showToast('Koin emas tidak mencukupi untuk membeli bibit ini!');
      return;
    }
    audio.playMarketSell();
    onAddCoins(-crop.seedPrice);
    setInventory(prev => ({
      ...prev,
      seeds: {
        ...prev.seeds,
        [cropType]: (prev.seeds[cropType] || 0) + 1,
      },
    }));
    showToast(`🛒 Beli 1 Benih ${crop.nameId} (-${crop.seedPrice} Koin)`);
  };

  // Contextual Trigger: Action button / Spacebar
  const triggerContextualAction = () => {
    if (!nearestTarget) {
      // If facing nothing, swing tool in the air or give feedback
      if (selectedTool === 'hoe') {
        audio.playHoeTill();
        setToolActionAnim('hoe');
        setTimeout(() => setToolActionAnim(null), 300);
        showToast('Arahkan cangkul ke petak tanah terdekat! ⛏️');
      } else if (selectedTool === 'water') {
        audio.playWaterPlant();
        setToolActionAnim('water');
        setTimeout(() => setToolActionAnim(null), 300);
        showToast('Dekati petak tanah untuk menyiram! 🚰');
      } else {
        showToast('Dekati petak tanah, hewan ternak, atau kotak panen untuk beraksi!');
      }
      return;
    }

    if (nearestTarget.type === 'tile') {
      interactWithTile(nearestTarget.coord.id);
    } else if (nearestTarget.type === 'animal') {
      interactWithAnimal(nearestTarget.animal);
    } else if (nearestTarget.type === 'shipping_bin') {
      handleSellViaBin();
    } else if (nearestTarget.type === 'bed') {
      handleSleepNextDay();
    } else if (nearestTarget.type === 'well') {
      handleRefillWell();
    } else if (nearestTarget.type === 'shop') {
      setShowShopModal(true);
    }
  };

  // Walking Loop using RAF & Keyboard Keys
  useEffect(() => {
    let animId: number;
    const SPEED = 4.8;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      // Number keys 1-5 for tools
      if (key === '1') setSelectedTool('hoe');
      if (key === '2') setSelectedTool('water');
      if (key === '3') setSelectedTool('seed');
      if (key === '4') setSelectedTool('harvest');
      if (key === '5') setSelectedTool('fertilizer');

      // Action keys: Space or E or Enter
      if (key === ' ' || key === 'e' || key === 'enter') {
        e.preventDefault();
        triggerContextualAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup'] || mobileUpRef.current) dy -= 1;
      if (keys['s'] || keys['arrowdown'] || mobileDownRef.current) dy += 1;
      if (keys['a'] || keys['arrowleft'] || mobileLeftRef.current) dx -= 1;
      if (keys['d'] || keys['arrowright'] || mobileRightRef.current) dx += 1;

      if (dx !== 0 || dy !== 0) {
        setIsWalking(true);
        if (dx < 0) setPlayerFacing('left');
        else if (dx > 0) setPlayerFacing('right');

        // Normalize diagonal speed
        const length = Math.hypot(dx, dy);
        const normX = (dx / length) * SPEED;
        const normY = (dy / length) * SPEED;

        setPlayerPos(prev => {
          // Boundaries of the farm map: x: 60..940, y: 130..620
          const nextX = Math.min(940, Math.max(60, prev.x + normX));
          const nextY = Math.min(620, Math.max(130, prev.y + normY));
          return { x: nextX, y: nextY };
        });
      } else {
        setIsWalking(false);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [triggerContextualAction]);

  // Click-to-Move / Tap on map
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!farmAreaRef.current) return;
    const rect = farmAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Smoothly step player towards click target
    setPlayerFacing(clickX < playerPos.x ? 'left' : 'right');
    setIsWalking(true);
    setPlayerPos({
      x: Math.min(940, Math.max(60, clickX)),
      y: Math.min(620, Math.max(130, clickY)),
    });
    setTimeout(() => setIsWalking(false), 300);
  };

  const handleMapTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!farmAreaRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = farmAreaRef.current.getBoundingClientRect();
    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;

    setPlayerFacing(clickX < playerPos.x ? 'left' : 'right');
    setIsWalking(true);
    setPlayerPos({
      x: Math.min(940, Math.max(60, clickX)),
      y: Math.min(620, Math.max(130, clickY)),
    });
    setTimeout(() => setIsWalking(false), 300);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* TOP HEADER: Calendar, Clock, Stamina, MUTE & Stats */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full px-3 md:px-6 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-amber-400/40 text-white flex items-center justify-between shadow-2xl">
        {/* Back Button */}
        <button
          onClick={() => {
            audio.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-game font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
          title="Kembali ke Petualangan"
        >
          <span>⬅</span>
          <span className="hidden sm:inline">Petualangan</span>
        </button>

        {/* Center: Title & Day / Clock */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-lg">
            🚜
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black text-amber-300 font-game tracking-wider">
                HARVEST MOON ROBOT
              </span>
              <span className="text-[10px] bg-emerald-600/90 text-white px-2 py-0.5 rounded-full font-bold">
                Musim Semi • Hari {farmDay}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold flex items-center gap-2">
              <span>⏰ Jam {clockHour < 10 ? `0${clockHour}` : clockHour}:00</span>
              <span>•</span>
              <span className="text-cyan-300 flex items-center gap-1">
                <span>⚡</span> Stamina: {farmEnergy}/100
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Flashcard Vocab, Mute, Basket & Coins */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Quick Bilingual Flashcard Button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              setVocabIndex((vocabIndex + 1) % FARM_WORDS.length);
              audio.speak(FARM_WORDS[(vocabIndex + 1) % FARM_WORDS.length].en);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-300 rounded-2xl text-xs font-game font-bold cursor-pointer transition-all"
            title="Ganti Kosakata Pertanian"
          >
            <span>📖</span>
            <span className="hidden md:inline text-[11px] font-black">{currentVocab.en} = {currentVocab.idWord}</span>
            <span className="text-xs">🔊</span>
          </button>

          {/* Dedicated English Adventure & Science Book Button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              setShowFarmBookModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-indigo-600/30 text-indigo-200 border border-indigo-400/50 hover:bg-indigo-600/50 text-xs font-game font-bold cursor-pointer transition-all"
            title="Buku Petualangan Inggris & Pengetahuan Sains Kebun"
          >
            <span>📘</span>
            <span className="hidden sm:inline text-[10px]">Buku Inggris</span>
          </button>

          {/* Dedicated MUTE BUTTON */}
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl font-game font-black text-xs border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-sky-600 border-sky-400 text-white hover:bg-sky-500'
            }`}
            title={isMuted ? 'Buka Suara (Unmute)' : 'Matikan Suara (Mute)'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline text-[10px]">{isMuted ? 'BISU' : 'SUARA'}</span>
          </button>

          {/* Open Harvest Basket Modal */}
          <button
            onClick={() => {
              audio.playButtonClick();
              setShowBasketModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30 text-xs font-game font-bold cursor-pointer"
            title="Buka Keranjang Panen"
          >
            <span>🧺</span>
            <span className="hidden sm:inline text-[10px]">Keranjang</span>
          </button>

          {/* Open Farm Store */}
          <button
            onClick={() => {
              audio.playButtonClick();
              setShowShopModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-emerald-600/30 text-emerald-300 border border-emerald-400/50 hover:bg-emerald-600/40 text-xs font-game font-bold cursor-pointer"
            title="Buka Toko Benih & Pasar"
          >
            <span>🏪</span>
            <span className="hidden sm:inline text-[10px]">Pasar</span>
          </button>

          {/* Coins Counter */}
          <div className="flex items-center gap-1 bg-amber-400 px-3 py-1.5 rounded-2xl text-xs font-black text-slate-950 font-game shadow">
            <span>🪙</span>
            <span>{saveData.coins}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      <AnimatePresence>
        {floatingToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-950/95 text-amber-300 border-2 border-amber-400 rounded-2xl shadow-2xl font-game font-black text-xs text-center backdrop-blur-md max-w-md"
          >
            {floatingToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* WALKABLE 2.5D HARVEST MOON FARM WORLD CANVAS */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-1 sm:p-2 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200">
        <div
          ref={farmAreaRef}
          onClick={handleMapClick}
          onTouchStart={handleMapTouch}
          className="relative w-full max-w-[1040px] h-[520px] sm:h-[640px] md:h-[680px] rounded-3xl shadow-2xl border-4 border-amber-900/60 overflow-hidden cursor-crosshair select-none touch-none"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, #4ade80 0%, #22c55e 60%, #16a34a 100%)',
          }}
        >
          {/* GRASS CHECKERBOARD TEXTURE & SOFT MOWED PATTERN */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#15803d 1px, transparent 1px), radial-gradient(#15803d 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px',
            }}
          />

          {/* CURVED COBBLESTONE DIRT PATHWAY (Linking House, Field, Barn, Well & Shop) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 200 230 Q 300 240 330 260 T 500 260 Q 620 260 680 230 T 800 520"
              fill="none"
              stroke="#d97706"
              strokeWidth="48"
              strokeLinecap="round"
              strokeOpacity="0.35"
            />
            <path
              d="M 200 230 Q 300 240 330 260 T 500 260 Q 620 260 680 230 T 800 520"
              fill="none"
              stroke="#b45309"
              strokeWidth="40"
              strokeLinecap="round"
              strokeOpacity="0.45"
            />
            {/* Path down to garden field */}
            <path
              d="M 330 260 Q 340 310 340 400"
              fill="none"
              stroke="#b45309"
              strokeWidth="36"
              strokeLinecap="round"
              strokeOpacity="0.45"
            />
          </svg>

          {/* ==================================================== */}
          {/* 1. COZY FARMHOUSE (RUMAH PONDOK PETANI) */}
          {/* ==================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleSleepNextDay();
            }}
            className="absolute left-[70px] top-[70px] w-[210px] h-[160px] cursor-pointer group z-10"
            title="Pondok Petani: Klik untuk Tidur & Sambut Hari Baru"
          >
            {/* Shadow */}
            <div className="absolute inset-x-2 bottom-0 h-8 bg-black/25 rounded-full blur-md" />

            {/* House Body */}
            <div className="absolute inset-x-3 bottom-2 h-[95px] bg-gradient-to-b from-amber-800 to-amber-950 rounded-b-2xl border-2 border-amber-900 shadow-xl flex flex-col justify-end p-2">
              {/* Front Porch & Door */}
              <div className="flex items-end justify-between px-2">
                {/* Window with glow */}
                <div className="w-8 h-8 rounded-lg bg-yellow-200 border-2 border-amber-950 flex items-center justify-center text-xs shadow-inner animate-pulse">
                  🪟
                </div>
                {/* Front Door */}
                <div className="w-10 h-14 bg-amber-950 rounded-t-lg border-2 border-amber-700 flex flex-col items-center justify-center text-white text-xs shadow">
                  🚪
                </div>
                {/* Bed on Porch */}
                <div className="w-9 h-9 rounded-lg bg-indigo-900 border-2 border-indigo-700 flex items-center justify-center text-base shadow">
                  🛏️
                </div>
              </div>
            </div>

            {/* Red Slanted Shingle Roof */}
            <div className="absolute inset-x-0 top-0 h-[75px] bg-gradient-to-b from-rose-600 to-rose-800 rounded-t-3xl border-2 border-rose-900 shadow-2xl flex items-center justify-center text-white">
              {/* Chimney with Smoke */}
              <div className="absolute -top-3 right-6 w-5 h-9 bg-amber-900 rounded-t border border-amber-950 flex flex-col items-center">
                <span className="text-xs animate-bounce">☁️</span>
              </div>
              <span className="font-game font-black text-xs tracking-wider text-amber-200 drop-shadow">
                🏡 RUMAH ROBOT
              </span>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 text-amber-300 text-[10px] font-game font-bold rounded-full border border-amber-400/50 shadow whitespace-nowrap opacity-90 group-hover:opacity-100">
              🛏️ Tidur / Hari Baru
            </div>
          </div>

          {/* ==================================================== */}
          {/* 2. SHIPPING BIN (KOTAK PENJUALAN KAYU HARVEST MOON) */}
          {/* ==================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleSellViaBin();
            }}
            className="absolute left-[300px] top-[165px] w-[80px] h-[75px] cursor-pointer group z-10"
            title="Kotak Penjualan Kayu: Klik untuk Menjual Seluruh Panen"
          >
            <div className="absolute inset-x-1 bottom-0 h-5 bg-black/25 rounded-full blur-sm" />
            <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-950 rounded-2xl border-2 border-amber-900 shadow-xl flex flex-col items-center justify-center text-white p-1 group-hover:scale-105 transition-transform">
              <span className="text-2xl animate-bounce">📦</span>
              <span className="text-[9px] font-game font-black text-yellow-300 leading-tight">
                JUAL PANEN
              </span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-lg border border-white">
              💰
            </div>
          </div>

          {/* ==================================================== */}
          {/* 3. WATER WELL (SUMUR AIR DESA) */}
          {/* ==================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleRefillWell();
            }}
            className="absolute left-[415px] top-[135px] w-[75px] h-[85px] cursor-pointer group z-10"
            title="Sumur Air: Klik untuk Mengisi Air Alat Penyiram"
          >
            <div className="absolute inset-x-1 bottom-0 h-5 bg-black/25 rounded-full blur-sm" />
            <div className="w-full h-full bg-slate-700 rounded-2xl border-2 border-slate-600 shadow-xl flex flex-col items-center justify-between p-1.5 group-hover:scale-105 transition-transform">
              <div className="w-full h-4 bg-amber-800 rounded-t border-b border-amber-950 flex items-center justify-center text-[8px] text-amber-200 font-bold">
                SUMUR
              </div>
              <span className="text-2xl animate-pulse">🚰</span>
              <div className="w-full h-3 bg-cyan-500/80 rounded-b flex items-center justify-center text-[8px] text-white font-bold">
                💧 Air Segar
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 4. CENTRAL 12-PLOT CROP FIELDS (LAHAN PERTANIAN) */}
          {/* ==================================================== */}
          <div className="absolute left-[150px] top-[280px] w-[390px] h-[310px] bg-amber-950/70 rounded-3xl p-3 border-4 border-amber-800/80 shadow-2xl backdrop-blur-xs">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-amber-900 border-2 border-amber-500 rounded-full text-[10px] font-game font-black text-amber-200 shadow">
              🌾 12 PETAK KEBUN PERTANIAN
            </div>

            {/* 12 Plots Grid (Interactive Dirt Squares) */}
            <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-2.5 pt-1">
              {PLOT_COORDINATES.map(coord => {
                const tile = tiles.find(t => t.id === coord.id);
                if (!tile) return null;
                const crop = tile.crop ? CROPS[tile.crop] : null;

                const isTarget = nearestTarget?.type === 'tile' && nearestTarget.coord.id === coord.id;

                let stageIcon = '🌱';
                if (tile.stage === 1) stageIcon = '🌿';
                else if (tile.stage === 2) stageIcon = '🌸';
                else if (tile.stage === 3 && crop) stageIcon = crop.emoji;

                return (
                  <div
                    key={coord.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Walk robot to this tile and perform action
                      setPlayerPos({ x: coord.x + 36, y: coord.y + 36 });
                      interactWithTile(coord.id);
                    }}
                    className={`relative rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      !tile.tilled
                        ? 'bg-emerald-900/90 border-emerald-700/80 hover:bg-emerald-800'
                        : tile.watered
                        ? 'bg-[#452715] border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400/40'
                        : 'bg-[#5c3317] border-amber-800 hover:bg-[#6b3c1b]'
                    } ${isTarget ? 'ring-4 ring-amber-300 scale-105 shadow-xl' : ''}`}
                    title={`Petak #${coord.id}: ${tile.tilled ? (tile.crop ? `${crop?.nameId} (${tile.stage}/3)` : 'Tanah Gembur') : 'Semak Rumput'}`}
                  >
                    {/* Water shine badge */}
                    {tile.watered && (
                      <span className="absolute top-1 right-1 text-[9px] animate-pulse">💧</span>
                    )}

                    {/* Plant / Weed / Dirt Representation */}
                    {!tile.tilled ? (
                      <span className="text-xl opacity-75">🌿</span>
                    ) : !tile.crop ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm opacity-50">🪴</span>
                        <span className="text-[8px] font-game text-amber-300/80 font-bold">Gembur</span>
                      </div>
                    ) : (
                      <motion.div
                        animate={tile.stage === 3 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl filter drop-shadow">{stageIcon}</span>
                        <span className={`text-[8px] font-game font-black mt-0.5 ${tile.stage === 3 ? 'text-amber-300 animate-bounce' : 'text-slate-300'}`}>
                          {tile.stage === 3 ? 'SIAP!' : crop?.nameId}
                        </span>
                      </motion.div>
                    )}

                    {/* Target Reticle Arrow */}
                    {isTarget && (
                      <motion.div
                        animate={{ y: [-4, 0, -4] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="absolute -top-5 text-amber-300 text-xs font-black drop-shadow"
                      >
                        ▼
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================================================== */}
          {/* 5. ROBO-BARN & PASTURE (KANDANG TERNAK ROBOT) */}
          {/* ==================================================== */}
          <div className="absolute right-[40px] top-[70px] w-[420px] h-[340px] pointer-events-none">
            {/* Wooden Fence Perimeter */}
            <div className="absolute inset-0 rounded-3xl border-4 border-dashed border-amber-900/60 bg-emerald-500/20 backdrop-blur-xs shadow-inner">
              <div className="absolute top-2 left-4 px-3 py-0.5 bg-rose-900 text-rose-200 border-2 border-rose-500 rounded-full font-game font-black text-[10px] shadow">
                🏡 KANDANG TERNAK (ROBO-BARN)
              </div>
            </div>

            {/* Red Barn Shed Building */}
            <div className="absolute right-4 top-4 w-[140px] h-[110px] bg-gradient-to-b from-rose-700 to-rose-950 rounded-2xl border-2 border-rose-950 shadow-2xl flex flex-col items-center justify-between p-2">
              <div className="w-full text-center font-game font-black text-[10px] text-amber-300 border-b border-rose-800 pb-1">
                KANDANG SAPI & AYAM
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🛖</span>
                <span className="text-xs">🌾</span>
              </div>
              <span className="text-[8px] text-slate-300">Hay & Silo</span>
            </div>

            {/* Hay Bales */}
            <div className="absolute left-6 bottom-4 flex items-center gap-1.5 text-2xl select-none">
              <span>🌾</span>
              <span>🌾</span>
              <span>🌻</span>
            </div>
          </div>

          {/* Autonomous Friendly Robot Animals in Pasture */}
          {animals.map(animal => {
            const isTarget = nearestTarget?.type === 'animal' && nearestTarget.animal.id === animal.id;
            return (
              <motion.div
                key={animal.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayerPos({ x: animal.x, y: animal.y });
                  interactWithAnimal(animal);
                }}
                animate={{ x: animal.x, y: animal.y }}
                transition={{ type: 'spring', damping: 18, stiffness: 60 }}
                className={`absolute z-20 cursor-pointer flex flex-col items-center select-none group ${
                  animal.dir === 'left' ? 'scale-x-100' : '-scale-x-100'
                }`}
                style={{ top: 0, left: 0 }}
                title={`${animal.nameId}: Klik untuk membelai atau mengambil produk`}
              >
                {/* Heart emote bubble when player is near */}
                {isTarget && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -top-7 px-2 py-0.5 bg-rose-600 text-white font-game font-black text-[10px] rounded-full shadow-lg border border-white"
                  >
                    ❤️ {animal.productReady ? 'PANEN!' : 'ELUS!'}
                  </motion.div>
                )}

                {/* Animal Emoji Sprite */}
                <div className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                  {animal.emoji}
                </div>

                {/* Ground shadow */}
                <div className="w-10 h-3 bg-black/30 rounded-full blur-xs mt-0.5" />
              </motion.div>
            );
          })}

          {/* ==================================================== */}
          {/* 6. FARM MARKET STALL (KIOS TOKO PASAR) */}
          {/* ==================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowShopModal(true);
            }}
            className="absolute right-[50px] bottom-[30px] w-[180px] h-[130px] cursor-pointer group z-10"
            title="Kios Pasar Benih: Beli bibit sayur dan buah"
          >
            {/* Awning Roof */}
            <div className="w-full h-8 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-t-xl border-2 border-amber-950 flex items-center justify-around text-xs shadow-lg">
              <span>🏪</span>
              <span className="font-game font-black text-[9px] text-slate-900 uppercase">
                TOKO PASAR
              </span>
              <span>🥕</span>
            </div>
            {/* Stall Counter */}
            <div className="w-full h-[85px] bg-gradient-to-b from-amber-800 to-amber-950 rounded-b-xl border-2 border-amber-950 p-2 flex flex-col items-center justify-between text-white shadow-2xl">
              <div className="flex items-center gap-2 text-xl">
                <span>🌽</span>
                <span>🍅</span>
                <span>🍓</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-game font-black text-[9px] rounded-full shadow">
                🛒 Buka Pasar Benih
              </span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 7. DUCK POND & FLOWERS (KOLAM BEBEK & BUNGA) */}
          {/* ==================================================== */}
          <div className="absolute left-[30px] bottom-[30px] w-[130px] h-[110px] pointer-events-none">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-4 border-emerald-600 shadow-inner flex items-center justify-center text-2xl">
              <span className="animate-bounce">🦆</span>
              <span className="text-base ml-1">🪷</span>
            </div>
            <div className="absolute -top-3 left-4 text-xs">🌸🌼</div>
          </div>

          {/* Decorative Trees on Perimeter */}
          <div className="absolute left-4 top-2 text-3xl pointer-events-none">🌳</div>
          <div className="absolute left-[260px] top-3 text-3xl pointer-events-none">🍎</div>
          <div className="absolute left-[540px] top-6 text-3xl pointer-events-none">🌲</div>
          <div className="absolute right-[440px] top-4 text-3xl pointer-events-none">🌳</div>

          {/* ==================================================== */}
          {/* 8. CONTROLLABLE WALKABLE ROBOT PROTAGONIST (`RoboHero`) */}
          {/* ==================================================== */}
          <div
            className="absolute z-25 pointer-events-none flex flex-col items-center will-change-transform"
            style={{
              top: 0,
              left: 0,
              transform: `translate3d(${playerPos.x - 30}px, ${playerPos.y - 50}px, 0)`,
            }}
          >
            {/* Floating Contextual Interaction Hint above Robot */}
            {nearestTarget && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 px-3 py-1 bg-slate-950/95 border-2 border-amber-400 text-amber-300 font-game font-black text-[10px] rounded-2xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-50 ring-2 ring-amber-400/30"
              >
                {nearestTarget.type === 'tile' && (
                  <span>
                    [SPASI] {selectedTool === 'hoe' ? '⛏️ Cangkul' : selectedTool === 'water' ? '💧 Siram Air' : selectedTool === 'seed' ? `🌱 Tanam ${CROPS[selectedSeed].nameId}` : selectedTool === 'fertilizer' ? '✨ Pupuk' : '🧺 Panen'}
                  </span>
                )}
                {nearestTarget.type === 'animal' && (
                  <span>
                    [SPASI] ❤️ {nearestTarget.animal.productReady ? `Ambil ${nearestTarget.animal.productNameId}` : 'Belai Sahabat'}
                  </span>
                )}
                {nearestTarget.type === 'shipping_bin' && (
                  <span>[SPASI] 📦 Jual Semua Panen</span>
                )}
                {nearestTarget.type === 'bed' && (
                  <span>[SPASI] 🛏️ Tidur & Hari Baru</span>
                )}
                {nearestTarget.type === 'well' && (
                  <span>[SPASI] 🚰 Isi Air Sumur</span>
                )}
                {nearestTarget.type === 'shop' && (
                  <span>[SPASI] 🏪 Buka Pasar Benih</span>
                )}
              </motion.div>
            )}

            {/* Currently Equipped Tool badge above Robot's head */}
            <div className="absolute -top-5 w-6 h-6 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center text-xs shadow-lg">
              {selectedTool === 'hoe' && '⛏️'}
              {selectedTool === 'water' && '🚰'}
              {selectedTool === 'seed' && CROPS[selectedSeed].emoji}
              {selectedTool === 'harvest' && '🧺'}
              {selectedTool === 'fertilizer' && '✨'}
            </div>

            {/* The Animated Robot Hero Sprite */}
            <div className="w-14 h-14 flex items-center justify-center filter drop-shadow-xl">
              <RoboHero
                outfitColor={character.outfitColor || '#10B981'}
                backpackColor={character.backpackColor || '#F59E0B'}
                hat="antenna"
                state={isWalking ? 'walking' : 'idle'}
                facing={playerFacing}
                jumpZ={toolActionAnim ? 6 : 0}
              />
            </div>

            {/* Dynamic Footstep Dust / Tool Splash Effect */}
            {isWalking && (
              <div className="w-10 h-3 bg-white/40 rounded-full blur-xs -mt-1 animate-ping" />
            )}
            {toolActionAnim && (
              <div className="text-xl -mt-4 animate-bounce">
                {toolActionAnim === 'water' ? '💦' : toolActionAnim === 'hoe' ? '💥' : '✨'}
              </div>
            )}
          </div>

          {/* Action Floating Particle FX */}
          <AnimatePresence>
            {actionFx && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -45, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute z-40 pointer-events-none px-3 py-1 bg-slate-950/90 text-amber-300 border-2 border-amber-400 rounded-full font-game font-black text-xs shadow-2xl flex items-center gap-1.5"
                style={{ left: actionFx.x - 30, top: actionFx.y - 30 }}
              >
                <span>{actionFx.icon}</span>
                <span>{actionFx.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ON-SCREEN MOBILE D-PAD (FOR SMARTPHONES) */}
          <div className="absolute bottom-3 left-3 z-40 pointer-events-auto sm:hidden flex flex-col items-center gap-1 select-none">
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
              onPointerLeave={() => {
                mobileUpRef.current = false;
              }}
              className="w-11 h-11 rounded-xl bg-slate-950/85 border-2 border-amber-400 text-amber-300 font-black text-base flex items-center justify-center active:scale-90 shadow-xl touch-none"
              aria-label="Ke Atas"
            >
              ▲
            </button>
            <div className="flex items-center gap-2">
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
                onPointerLeave={() => {
                  mobileLeftRef.current = false;
                }}
                className="w-11 h-11 rounded-xl bg-slate-950/85 border-2 border-amber-400 text-amber-300 font-black text-base flex items-center justify-center active:scale-90 shadow-xl touch-none"
                aria-label="Ke Kiri"
              >
                ◀
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-amber-400/50 flex items-center justify-center text-xs text-amber-300 font-game font-bold">
                🚜
              </div>
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
                onPointerLeave={() => {
                  mobileRightRef.current = false;
                }}
                className="w-11 h-11 rounded-xl bg-slate-950/85 border-2 border-amber-400 text-amber-300 font-black text-base flex items-center justify-center active:scale-90 shadow-xl touch-none"
                aria-label="Ke Kanan"
              >
                ▶
              </button>
            </div>
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
              onPointerLeave={() => {
                mobileDownRef.current = false;
              }}
              className="w-11 h-11 rounded-xl bg-slate-950/85 border-2 border-amber-400 text-amber-300 font-black text-base flex items-center justify-center active:scale-90 shadow-xl touch-none"
              aria-label="Ke Bawah"
            >
              ▼
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM HOTBAR & CONTROLS: Tools, Seed Picker, Mobile Aksi */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full px-3 md:px-6 py-2.5 bg-slate-950/95 backdrop-blur-md border-t border-amber-400/40 text-white flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        {/* LEFT: Keyboard Hints */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-game text-slate-300">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span>🎮</span> KONTROL JALAN:
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-amber-300 font-bold border border-slate-700">W A S D / ⬆ ⬇ ⬅ ➡</kbd> Jalan
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold border border-amber-500/40">SPASI / KLIK</kbd>
            <span className="text-amber-300 font-bold">Aksi Bertani</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-amber-300 border border-slate-700">1-5</kbd> Ganti Alat
          </span>
        </div>

        {/* CENTER: Sleek Farm Tools Hotbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto lg:mx-0">
          {[
            { id: 'hoe', label: 'Cangkul', icon: '⛏️', keyHint: '1' },
            { id: 'water', label: 'Siram Air', icon: '🚰', keyHint: '2' },
            { id: 'seed', label: 'Benih', icon: '🌱', keyHint: '3' },
            { id: 'harvest', label: 'Panen', icon: '🧺', keyHint: '4' },
            { id: 'fertilizer', label: 'Pupuk', icon: '✨', keyHint: '5' },
          ].map(tool => {
            const isActive = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  audio.playButtonClick();
                  setSelectedTool(tool.id as any);
                  if (tool.id === 'seed') setShowSeedPicker(!showSeedPicker);
                }}
                className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-game font-black text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-white shadow-xl scale-105 ring-2 ring-amber-300'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
                title={`Alat [${tool.keyHint}]: ${tool.label}`}
              >
                <span className="text-base">{tool.icon}</span>
                <span className="hidden sm:inline">{tool.label}</span>
                <span className="text-[9px] opacity-60 ml-0.5">[{tool.keyHint}]</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Quick Seed Picker & BIG ACTION BUTTON (MOBILE / TOUCH) */}
        <div className="flex items-center gap-2">
          {/* Quick Seed Selector Popup if tool is seed */}
          {selectedTool === 'seed' && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-700">
              {Object.values(CROPS).map(crop => {
                const isCur = selectedSeed === crop.id;
                const count = inventory.seeds[crop.id] || 0;
                return (
                  <button
                    key={crop.id}
                    onClick={() => {
                      audio.playButtonClick();
                      setSelectedSeed(crop.id);
                    }}
                    className={`px-2 py-1 rounded-xl text-[10px] font-game font-bold flex items-center gap-0.5 cursor-pointer border ${
                      isCur
                        ? 'bg-emerald-500 text-slate-950 border-white ring-1 ring-emerald-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                    title={`Pilih Benih ${crop.nameId} (${count} sisa)`}
                  >
                    <span>{crop.emoji}</span>
                    <span className="text-[9px] font-black">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* BIG ACTION BUTTON (Touch / Click friendly) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={triggerContextualAction}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-game font-black text-xs md:text-sm shadow-2xl border-2 border-white flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            title="Tekan untuk melakukan aksi bertani pada petak / hewan / kotak terdekat"
          >
            <span className="text-base animate-pulse">⚡</span>
            <span>AKSI TANI [SPASI]</span>
          </motion.button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: HARVEST BASKET DRAWER (KERANJANG PANEN & JUAL) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showBasketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 border-4 border-amber-400 shadow-2xl text-white flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🧺</span>
                  <div>
                    <h3 className="font-game font-black text-amber-300 text-base">
                      KERANJANG HASIL PANEN
                    </h3>
                    <p className="text-xs text-slate-400">Hasil panen & produk peternakan robot</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBasketModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-game max-h-64 overflow-y-auto pr-1">
                {Object.entries(inventory.crops).map(([cKey, count]) => {
                  const c = CROPS[cKey as CropType];
                  return (
                    <div key={cKey} className="bg-slate-950/70 p-3 rounded-2xl flex items-center justify-between border border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-slate-200 font-bold">{c.nameId}</span>
                      </span>
                      <span className="text-amber-400 font-black text-sm">{count}</span>
                    </div>
                  );
                })}
                <div className="bg-slate-950/70 p-3 rounded-2xl flex items-center justify-between border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="text-2xl">🥛</span>
                    <span className="text-slate-200 font-bold">Susu Segar</span>
                  </span>
                  <span className="text-amber-400 font-black text-sm">{inventory.animalProducts.milk}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-2xl flex items-center justify-between border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="text-2xl">🥚</span>
                    <span className="text-slate-200 font-bold">Telur Emas</span>
                  </span>
                  <span className="text-amber-400 font-black text-sm">{inventory.animalProducts.egg}</span>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-2xl flex items-center justify-between border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="text-2xl">🧶</span>
                    <span className="text-slate-200 font-bold">Wol Hangat</span>
                  </span>
                  <span className="text-amber-400 font-black text-sm">{inventory.animalProducts.wool}</span>
                </div>
              </div>

              {/* Sell All Button */}
              <button
                onClick={() => {
                  handleSellViaBin();
                  setShowBasketModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-game font-black text-sm rounded-2xl shadow-xl border-2 border-white flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>💰</span>
                <span>JUAL SEMUA KE KOTAK PANEN</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: SEED STORE (TOKO BIBIT & PASAR PASARAN) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showShopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-6 border-4 border-emerald-400 shadow-2xl text-white flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🏪</span>
                  <div>
                    <h3 className="font-game font-black text-emerald-300 text-base">
                      TOKO BIBIT & PASAR TANI
                    </h3>
                    <p className="text-xs text-slate-400">Beli benih unggul dengan koin emas!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-400 px-3 py-1 rounded-xl text-slate-950 font-game font-black text-xs">
                    <span>🪙</span>
                    <span>{saveData.coins}</span>
                  </div>
                  <button
                    onClick={() => setShowShopModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Crops Shop List */}
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {Object.values(CROPS).map(crop => (
                  <div
                    key={crop.id}
                    className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{crop.emoji}</span>
                      <div>
                        <div className="font-game font-black text-amber-300 text-xs">
                          {crop.nameId} ({crop.name})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {crop.description}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          Harga Jual Panen: +{crop.sellPrice} koin
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuySeed(crop.id)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-game font-black text-xs rounded-xl shadow cursor-pointer active:scale-95 shrink-0"
                    >
                      Beli {crop.seedPrice} 🪙
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>💡 Tanam benih di petak tanah gembur, lalu siram air!</span>
                <button
                  onClick={() => setShowShopModal(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: BUKU PETUALANGAN INGGRIS & SAINS KEBUN */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showFarmBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-indigo-400/60 rounded-3xl p-5 md:p-6 w-full max-w-xl shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl">
                    📘
                  </div>
                  <div>
                    <h3 className="font-game font-black text-amber-300 text-lg leading-tight">
                      BUKU PETUALANGAN INGGRIS KEBUN
                    </h3>
                    <p className="text-xs text-indigo-200">Kuasai Kosakata, Sains Alam & Kuis Pertanian SD</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFarmBookModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setFarmBookTab('vocab');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-game font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    farmBookTab === 'vocab'
                      ? 'bg-indigo-600 text-white shadow font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>1. Kosakata ({FARM_WORDS.length})</span>
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setFarmBookTab('science');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-game font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    farmBookTab === 'science'
                      ? 'bg-emerald-600 text-white shadow font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🔬</span>
                  <span>2. Sains Kebun</span>
                </button>
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setFarmBookTab('quiz');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-game font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    farmBookTab === 'quiz'
                      ? 'bg-amber-500 text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎯</span>
                  <span>3. Kuis Berhadiah</span>
                </button>
              </div>

              {/* Tab 1: Vocab Cards */}
              {farmBookTab === 'vocab' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {FARM_WORDS.map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-indigo-400/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{w.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-game font-black text-amber-300 truncate">
                            {w.en}
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium truncate">
                            🇮🇩 {w.idWord}
                          </div>
                          <div className="text-[9px] text-slate-400 italic mt-0.5 truncate">
                            "{w.sentence}"
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          audio.speak(w.en);
                        }}
                        className="w-8 h-8 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center text-xs shrink-0 cursor-pointer active:scale-95"
                        title="Dengarkan pengucapan"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Science & Nature Facts */}
              {farmBookTab === 'science' && (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {FARM_SCIENCE_FACTS.map((fact, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{fact.emoji}</span>
                          <span className="font-game font-black text-emerald-300 text-xs">
                            {fact.topic}
                          </span>
                        </div>
                        <button
                          onClick={() => audio.speak(fact.en)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <span>🔊</span>
                          <span>Suara Inggris</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {fact.fact}
                      </p>
                      <p className="text-[11px] text-indigo-300 font-medium italic">
                        🇬🇧 "{fact.en}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Interactive Farm Quiz */}
              {farmBookTab === 'quiz' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block mb-1">
                      Soal {farmQuizIdx + 1} dari {FARM_QUIZ_QUESTIONS.length}
                    </span>
                    <h4 className="text-sm font-game font-black text-white leading-snug">
                      {FARM_QUIZ_QUESTIONS[farmQuizIdx].q}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {FARM_QUIZ_QUESTIONS[farmQuizIdx].options.map((opt, optIdx) => {
                      const isRight = optIdx === FARM_QUIZ_QUESTIONS[farmQuizIdx].ans;
                      const isChosen = farmQuizSelected === optIdx;

                      let btnStyle = 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700';
                      if (farmQuizAnswered) {
                        if (isRight) {
                          btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black animate-pulse';
                        } else if (isChosen && !isRight) {
                          btnStyle = 'bg-rose-600 text-white border-rose-400';
                        } else {
                          btnStyle = 'bg-slate-800 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={farmQuizAnswered}
                          onClick={() => {
                            setFarmQuizSelected(optIdx);
                            setFarmQuizAnswered(true);
                            if (isRight) {
                              audio.playCorrect();
                              confetti({ particleCount: 40, spread: 50 });
                              onAddXp(20);
                              onAddCoins(10);
                              showToast('🎉 Tepat Sekali! +20 XP • +10 Koin!');
                            } else {
                              audio.playWrong();
                            }
                          }}
                          className={`p-3 rounded-2xl border text-xs font-game font-bold text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {farmQuizAnswered && isRight && <span className="text-sm font-black">✓ Benar!</span>}
                          {farmQuizAnswered && isChosen && !isRight && <span className="text-sm font-black">✕</span>}
                        </button>
                      );
                    })}
                  </div>

                  {farmQuizAnswered && (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300">
                        💡 <span className="font-bold text-amber-300">Penjelasan:</span> {FARM_QUIZ_QUESTIONS[farmQuizIdx].exp}
                      </div>

                      <button
                        onClick={() => {
                          setFarmQuizSelected(null);
                          setFarmQuizAnswered(false);
                          setFarmQuizIdx((farmQuizIdx + 1) % FARM_QUIZ_QUESTIONS.length);
                        }}
                        className="py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-game font-black text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Soal Berikutnya ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>💡 Kumpulkan panen & dengarkan pengucapan fasih!</span>
                <button
                  onClick={() => setShowFarmBookModal(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Tutup Buku
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
