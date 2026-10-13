import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CharacterConfig, RobotModelId, RobotModelMeta } from '../../types/game';
import { audio } from '../../services/audio';
import { RoboHero } from '../game/RoboHero';

interface CharacterSelectProps {
  initialConfig: CharacterConfig;
  onSave: (config: CharacterConfig) => void;
  onBack: () => void;
}

export const ROBOT_MODELS: RobotModelMeta[] = [
  {
    id: 'robo_smart',
    name: 'Robo-Cerdas',
    role: 'Robot Pelajar Pintar',
    description: 'Robot canggih berantena emas sahabat belajar 5 mapel SD!',
    emoji: '🤖',
    defaultColor: '#0EA5E9',
    defaultBackpack: '#F59E0B',
    defaultHat: 'antenna',
    perk: '+10% Kecepatan Membaca Kosakata',
  },
  {
    id: 'robo_farmer',
    name: 'Robo-Tani (FarmBot)',
    role: 'Robot Petani Harvest Moon',
    description: 'Spesialis bertani di kebun, menyiram tanaman & merawat hewan ternak!',
    emoji: '🚜',
    defaultColor: '#10B981',
    defaultBackpack: '#F59E0B',
    defaultHat: 'antenna',
    perk: '+1 Koin Ekstra Setiap Panen',
  },
  {
    id: 'robo_astro',
    name: 'Astro-Bot',
    role: 'Penjelajah Antariksa',
    description: 'Robot penjelajah kosmik dengan antena radar satelit!',
    emoji: '🚀',
    defaultColor: '#6366F1',
    defaultBackpack: '#38BDF8',
    defaultHat: 'radar',
    perk: 'Daya Lompat Roket Super Ringan',
  },
  {
    id: 'robo_spark',
    name: 'Cyber-Spark',
    role: 'Robot Inti Energi Kilat',
    description: 'Dilengkapi tanduk energi petir dan reaktor kilat berkecepatan tinggi!',
    emoji: '⚡',
    defaultColor: '#EAB308',
    defaultBackpack: '#EF4444',
    defaultHat: 'horns',
    perk: 'Pengisian Daya Jurus 20% Lebih Cepat',
  },
  {
    id: 'robo_aqua',
    name: 'Aqua-Bot',
    role: 'Penjaga Air & Alam',
    description: 'Robot baling-baling ramah lingkungan pembersih sungai dan danau!',
    emoji: '💧',
    defaultColor: '#06B6D4',
    defaultBackpack: '#3B82F6',
    defaultHat: 'propeller',
    perk: 'Dapat Menyiram 2 Petak Sekaligus',
  },
  {
    id: 'robo_titan',
    name: 'Mecha-Titan',
    role: 'Robot Pelindung Abadi',
    description: 'Baja titanium terkuat dengan perisai pertahanan tak terkalahkan!',
    emoji: '🛡️',
    defaultColor: '#E11D48',
    defaultBackpack: '#475569',
    defaultHat: 'antenna',
    perk: 'Dinding Pelindung Kebal Sempurna',
  },
];

const CHASSIS_COLORS = [
  { name: 'Biru Cyan Cyber', hex: '#0EA5E9' },
  { name: 'Hijau Daun Kebun', hex: '#10B981' },
  { name: 'Emas Surya', hex: '#F59E0B' },
  { name: 'Merah Laser', hex: '#EF4444' },
  { name: 'Ungu Neon', hex: '#8B5CF6' },
  { name: 'Baja Titanium', hex: '#475569' },
];

const BOOSTER_COLORS = [
  { name: 'Kuning Energi', hex: '#F59E0B' },
  { name: 'Cyan Plasma', hex: '#06B6D4' },
  { name: 'Merah Inti Reaktor', hex: '#EF4444' },
  { name: 'Hijau Solar', hex: '#22C55E' },
  { name: 'Biru Gelap', hex: '#1E3A8A' },
];

const HEAD_ACCESSORIES = [
  { id: 'antenna', name: 'Antena Sinyal 📡' },
  { id: 'radar', name: 'Piringan Radar 🛰️' },
  { id: 'propeller', name: 'Baling-baling 🚁' },
  { id: 'horns', name: 'Tanduk Petir ⚡' },
];

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  initialConfig,
  onSave,
  onBack,
}) => {
  const [config, setConfig] = useState<CharacterConfig>(() => ({
    ...initialConfig,
    robotModel: initialConfig.robotModel || 'robo_smart',
    name: initialConfig.name || 'Robo-Cerdas',
    outfitColor: initialConfig.outfitColor || '#0EA5E9',
    backpackColor: initialConfig.backpackColor || '#F59E0B',
    hat: initialConfig.hat || 'antenna',
  }));

  const activeModel = ROBOT_MODELS.find(m => m.id === config.robotModel) || ROBOT_MODELS[0];

  const handleSelectModel = (model: RobotModelMeta) => {
    audio.playButtonClick();
    setConfig(prev => ({
      ...prev,
      robotModel: model.id,
      name: model.name,
      outfitColor: model.defaultColor,
      backpackColor: model.defaultBackpack,
      hat: model.defaultHat,
    }));
  };

  const handleSave = () => {
    audio.playButtonClick();
    audio.playCorrect();
    onSave(config);
    onBack();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={() => {
            audio.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-full border border-slate-700 shadow-md text-xs font-game cursor-pointer active:scale-95 transition-all"
        >
          <span>⬅ Kembali (Back)</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 font-game drop-shadow-md flex items-center gap-2">
            <span>🤖</span>
            <span>HANGGAR ROBOT PETUALANG</span>
          </h1>
          <span className="text-xs text-slate-300 font-bold">
            Pilih Model Robot, Warna Bodi Armor, dan Antena Canggih
          </span>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-game font-black text-xs border-2 border-white shadow-xl cursor-pointer active:scale-95 transition-all"
        >
          <span>SIMPAN ROBOT ✓</span>
        </button>
      </div>

      {/* Main Split: Robot Live Preview on Left, Customizer on Right */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 my-auto py-2">
        {/* Left: Live 2.5D Robot Preview (Cols 1-5) */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 border-2 border-amber-400/50 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="text-xs font-black uppercase tracking-wider text-amber-300 font-game mb-2 z-10 flex items-center gap-1.5">
            <span>⚡</span>
            <span>TAMPILAN ROBOT KAMU:</span>
          </div>

          {/* Pedestal Platform */}
          <div className="relative flex flex-col items-center my-4 z-10">
            {/* 2.5D Robot Hero Component */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="relative z-10 scale-125 my-4"
            >
              <RoboHero
                outfitColor={config.outfitColor}
                backpackColor={config.backpackColor}
                hat={config.hat}
                state="idle"
                facing="right"
                jumpZ={0}
              />
            </motion.div>

            {/* Glowing Cyber Platform Base */}
            <div className="w-48 h-10 bg-gradient-to-r from-cyan-500/40 via-amber-400/40 to-cyan-500/40 rounded-full blur-md -mt-4 border-t border-cyan-400/60" />
          </div>

          <div className="z-10 text-center mt-2">
            <div className="text-2xl font-black text-white font-game flex items-center justify-center gap-2">
              <span>{activeModel.emoji}</span>
              <span>{config.name}</span>
            </div>
            <div className="text-xs text-amber-300 font-bold mt-0.5">
              {activeModel.role}
            </div>
            <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
              {activeModel.description}
            </div>
            <div className="mt-1.5 text-[10px] text-emerald-400 font-bold">
              ✨ Keunggulan: {activeModel.perk}
            </div>
          </div>
        </div>

        {/* Right: Customization Controls (Cols 6-12) */}
        <div className="md:col-span-7 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col gap-5">
          {/* 1. Pilih Model Robot */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 font-game flex items-center gap-1.5">
              <span>1. PILIH MODEL ROBOT:</span>
            </label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROBOT_MODELS.map(m => {
                const isSelected = config.robotModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModel(m)}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg ring-2 ring-amber-300 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-[11px] font-game font-bold">{m.name}</span>
                    <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                      {m.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Warna Bodi Armor Robot */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 font-game">
              2. WARNA BODI ARMOR ROBOT:
            </label>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {CHASSIS_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => {
                    audio.playButtonClick();
                    setConfig(prev => ({ ...prev, outfitColor: c.hex }));
                  }}
                  className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                    config.outfitColor === c.hex
                      ? 'border-white scale-110 shadow-lg ring-2 ring-amber-400'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {config.outfitColor === c.hex && (
                    <span className="text-xs text-white font-bold drop-shadow">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Warna Ransel Baterai & Roket Booster */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 font-game">
              3. WARNA RANSEL BATERAI / ROCKET BOOSTER:
            </label>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {BOOSTER_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => {
                    audio.playButtonClick();
                    setConfig(prev => ({ ...prev, backpackColor: c.hex }));
                  }}
                  className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                    config.backpackColor === c.hex
                      ? 'border-white scale-110 shadow-lg ring-2 ring-amber-400'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {config.backpackColor === c.hex && (
                    <span className="text-xs text-white font-bold drop-shadow">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Aksesoris Kepala Robot */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 font-game">
              4. AKSESORIS KEPALA ROBOT:
            </label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HEAD_ACCESSORIES.map(h => (
                <button
                  key={h.id}
                  onClick={() => {
                    audio.playButtonClick();
                    setConfig(prev => ({ ...prev, hat: h.id }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-game font-bold border transition-all cursor-pointer text-center ${
                    config.hat === h.id
                      ? 'bg-amber-400 text-slate-950 border-white shadow font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Semua karakter ramah anak tanpa visual manusia sesuai permintaan.</span>
        <button
          onClick={handleSave}
          className="text-amber-400 hover:underline font-bold font-game cursor-pointer"
        >
          Selesai & Simpan ➔
        </button>
      </div>
    </div>
  );
};
