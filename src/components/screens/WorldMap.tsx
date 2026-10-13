import React from 'react';
import { motion } from 'motion/react';
import { WORLD_AREAS } from '../../data/gameData';
import { audio } from '../../services/audio';
import worldMapBg from '../../assets/images/world_map_island_1791068214127.jpg';

interface WorldMapProps {
  unlockedAreas: string[];
  playerLevel: number;
  onEnterArea: (areaId: string) => void;
  onBack: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  unlockedAreas,
  playerLevel,
  onEnterArea,
  onBack,
}) => {
  const areaDescriptionsId: Record<string, { idName: string; idDesc: string; subjects: { icon: string; name: string }[] }> = {
    area_home: {
      idName: 'LITTLE HOME (Rumah Cilik Pintar)',
      idDesc: 'Pondok hangat penuh benda rumah, kosa kata keluarga, dan adab sopan santun.',
      subjects: [
        { icon: '🇮🇩', name: 'B. Indonesia' },
        { icon: '🇬🇧', name: 'English' },
        { icon: '🕌', name: 'Adab & Budi Pekerti' },
      ],
    },
    area_school: {
      idName: 'SUNNY SCHOOL (Sekolah Ceria SD)',
      idDesc: 'Ruang kelas matematika, geometri, ejaan bahasa Indonesia, dan sains kelas.',
      subjects: [
        { icon: '📐', name: 'Matematika' },
        { icon: '🇮🇩', name: 'B. Indonesia' },
        { icon: '🔬', name: 'IPA Dasar' },
      ],
    },
    area_park: {
      idName: 'HAPPY PARK (Taman Sains Alam)',
      idDesc: 'Eksplorasi tumbuhan, siklus air, fotosintesis, dan merawat makhluk hidup.',
      subjects: [
        { icon: '🔬', name: 'IPA Sains' },
        { icon: '🕌', name: 'Kelestarian Alam' },
        { icon: '🇬🇧', name: 'Nature English' },
      ],
    },
    area_market: {
      idName: 'FOOD MARKET (Pasar Cerdas Matematika)',
      idDesc: 'Kios buah & makanan, berhitung uang kembalian, timbangan, dan kejujuran berdagang.',
      subjects: [
        { icon: '📐', name: 'Hitung Jual-Beli' },
        { icon: '🕌', name: 'Kejujuran Moral' },
        { icon: '🇮🇩', name: 'Percakapan Pasar' },
      ],
    },
    area_city: {
      idName: 'ENGLISH & SCIENCE CITY (Kota Juara)',
      idDesc: 'Kota metropolitan penuh teka-teki 5 mata pelajaran terintegrasi tingkat lanjut!',
      subjects: [
        { icon: '🌟', name: 'Semua 5 Mapel SD' },
      ],
    },
    area_cavern: {
      idName: 'CRYSTAL CAVERN (Gua Kristal & Mineral)',
      idDesc: 'Jalur gua bawah tanah panjang nan memukau penuh batuan permata, mineral, dan geologi bumi.',
      subjects: [
        { icon: '🔬', name: 'IPA Geologi & Batuan' },
        { icon: '💎', name: 'Mineral English' },
        { icon: '🕌', name: 'Kekayaan Alam Bumi' },
      ],
    },
    area_space: {
      idName: 'COSMIC SPACE (Stasiun Orbit & Antariksa)',
      idDesc: 'Petualangan kosmik spektakuler melintasi modul stasiun luar angkasa, satelit, planet, dan galaksi.',
      subjects: [
        { icon: '🚀', name: 'Sains Tata Surya' },
        { icon: '🛰️', name: 'Aero English' },
        { icon: '📐', name: 'Fisika & Gravitasi' },
      ],
    },
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-sky-950 flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Background World Map Graphic */}
      <img
        src={worldMapBg}
        alt="English Island Map"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/70 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        <button
          onClick={() => {
            audio.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-white font-bold rounded-full border border-slate-700 shadow-md text-xs font-game cursor-pointer"
        >
          <span>⬅ Kembali (Back)</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-black text-amber-300 font-game drop-shadow-md">
            PETA PETUALANGAN PINTAR SD 🗺️
          </h1>
          <span className="text-xs text-sky-200 font-bold drop-shadow">
            Pilih wilayah petualangan: Matematika, IPA Sains & Bahasa Inggris
          </span>
        </div>

        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Center Island Path & Node Cards */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto py-6 flex flex-col gap-4">
        {WORLD_AREAS.map((area, idx) => {
          const isUnlocked = unlockedAreas.includes(area.id) || playerLevel >= area.requiredLevel;
          const isHome = area.id === 'area_home';
          const idInfo = areaDescriptionsId[area.id] || { idName: area.name, idDesc: area.description };

          return (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              onClick={() => {
                if (isUnlocked) {
                  audio.playButtonClick();
                  onEnterArea(area.id);
                } else {
                  audio.playWrong();
                }
              }}
              className={`p-4 rounded-3xl border-3 shadow-xl backdrop-blur-md transition-all flex items-center justify-between cursor-pointer ${
                isUnlocked
                  ? 'bg-slate-900/90 hover:bg-slate-800/95 border-amber-400 ring-2 ring-amber-300/30'
                  : 'bg-slate-950/70 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    isUnlocked ? 'bg-amber-400/20 border-2 border-amber-400 text-amber-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {area.emoji}
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-black text-white font-game">
                      {idInfo.idName}
                    </span>
                    {isHome && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full font-game shadow">
                        LOKASI AKTIF ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 max-w-sm mt-0.5 line-clamp-1">
                    {idInfo.idDesc}
                  </p>
                  {/* Subject Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {idInfo.subjects.map(s => (
                      <span
                        key={s.name}
                        className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-1"
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                {isUnlocked ? (
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow font-game hover:brightness-105 cursor-pointer">
                    {isHome ? 'MAINKAN 🎮' : 'MASUK 🔓'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-xl text-slate-400 text-xs font-bold font-game border border-slate-700">
                    <span>🔒</span>
                    <span>Terbuka di Lvl {area.requiredLevel}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info in Indonesian */}
      <div className="relative z-10 text-center text-xs text-slate-300 pb-2">
        Selesaikan misi di Little Home untuk membuka area Sunny School!
      </div>
    </div>
  );
};
