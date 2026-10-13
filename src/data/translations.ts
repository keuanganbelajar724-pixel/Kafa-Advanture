export type LanguageMode = 'id' | 'en' | 'bilingual';

export interface TranslationStrings {
  // Splash & Menu
  gameTitle: string;
  gameTagline: string;
  tapToPlay: string;
  recommendedAge: string;
  startPlaying: string;
  worldMap: string;
  myWords: string;
  badges: string;
  character: string;
  settings: string;
  currentWorld: string;
  resetData: string;

  // HUD & In-Game
  level: string;
  activeMission: string;
  missionCompleted: string;
  talkToNpc: string;
  interact: string;
  jump: string;
  playGames: string;
  openMiniGames: string;
  languageToggle: string;

  // Modals & NPC
  discovered: string;
  inASentence: string;
  listenPronunciation: string;
  listenIndonesian: string;
  meaningInIndonesian: string;
  gotItCollect: string;
  guideTitle: string;
  guideRole: string;
  listenGuide: string;
  imOnIt: string;

  // Mini-games
  carnivalTitle: string;
  findItTitle: string;
  findItDesc: string;
  matchItTitle: string;
  matchItDesc: string;
  listenFindTitle: string;
  listenFindDesc: string;
  wordPuzzleTitle: string;
  wordPuzzleDesc: string;
  sentenceTitle: string;
  sentenceDesc: string;
  roundText: string;
  superJob: string;
  playAgain: string;
  listenPrompt: string;
  spellTheWord: string;
  resetTiles: string;
  clearSentence: string;

  // World Map & Badges & Closet
  englishIsland: string;
  mapSubtitle: string;
  back: string;
  unlocksAt: string;
  achievementsTitle: string;
  badgesSubtitle: string;
  closetTitle: string;
  closetSubtitle: string;
  selectAdventurer: string;
  outfitColor: string;
  backpackColor: string;
  headwear: string;
  saveContinue: string;
}

export const TRANSLATIONS: Record<LanguageMode, TranslationStrings> = {
  id: {
    gameTitle: 'PETUALANGAN BAHASA INGGRIS',
    gameTagline: 'Belajar Bahasa Inggris Sambil Bermain & Menjelajah!',
    tapToPlay: 'MULAI BERMAIN',
    recommendedAge: 'Cocok untuk anak usia 6–10 tahun',
    startPlaying: 'AYO MAIN SEKARANG',
    worldMap: 'Peta Dunia',
    myWords: 'Kamus Kata',
    badges: 'Piala & Medali',
    character: 'Ganti Karakter',
    settings: 'Pengaturan',
    currentWorld: 'LOKASI SAAT INI',
    resetData: 'Hapus & Ulang Data',

    level: 'LEVEL',
    activeMission: 'MISI AKTIF',
    missionCompleted: 'MISI SELESAI!',
    talkToNpc: 'Bicara dengan Pemandu',
    interact: 'INTERAKSI',
    jump: 'LOMPAT',
    playGames: 'Main Mini-Game',
    openMiniGames: 'BUKA 5 MINI-GAME!',
    languageToggle: 'Bahasa: Indonesia 🇮🇩',

    discovered: 'Kata Ditemukan!',
    inASentence: 'Contoh dalam Kalimat:',
    listenPronunciation: 'Dengarkan Pengucapan',
    listenIndonesian: 'Dengarkan Terjemahan',
    meaningInIndonesian: 'Artinya dalam Bahasa Indonesia:',
    gotItCollect: 'Paham! Masukkan ke Tas 🎒',
    guideTitle: 'Kapten Leo',
    guideRole: 'Pemandu Petualang Cilik',
    listenGuide: 'Dengarkan Suara Panduan',
    imOnIt: 'Siap! Saya akan cari sekarang! 🚀',

    carnivalTitle: 'ARENA MINI GAME',
    findItTitle: '1. Cari Bendanya',
    findItDesc: 'Cari benda sesuai kata bahasa Inggrisnya!',
    matchItTitle: '2. Cocokkan Gambar',
    matchItDesc: 'Pasangkan kata dengan gambar yang pas!',
    listenFindTitle: '3. Dengar & Tebak',
    listenFindDesc: 'Dengarkan suara bahasa Inggris lalu pilih bendanya!',
    wordPuzzleTitle: '4. Susun Huruf',
    wordPuzzleDesc: 'Susun huruf alfabet menjadi kata!',
    sentenceTitle: '5. Susun Kalimat',
    sentenceDesc: 'Susun kata menjadi kalimat bahasa Inggris yang benar!',
    roundText: 'Babak',
    superJob: 'Hebat Sekali! Kamu Berhasil!',
    playAgain: 'Main Lagi 🔄',
    listenPrompt: 'Tekan untuk dengar suara',
    spellTheWord: 'Susun Huruf Kata:',
    resetTiles: 'Ulangi Huruf ↺',
    clearSentence: 'Hapus Kalimat ↺',

    englishIsland: 'PULAU ENGLISH ISLAND',
    mapSubtitle: 'Pilih lokasi petualangan berikutnya',
    back: 'Kembali',
    unlocksAt: 'Terbuka di Level',
    achievementsTitle: 'MEDALI PENGHARGAAN 🏆',
    badgesSubtitle: 'Medali yang berhasil kamu kumpulkan',
    closetTitle: 'LEMARI PETUALANG 👕',
    closetSubtitle: 'Ganti baju, tas, dan topi petualangmu',
    selectAdventurer: 'Pilih Karakter Petualang',
    outfitColor: 'Warna Baju',
    backpackColor: 'Warna Tas Ransel',
    headwear: 'Aksesoris Topi',
    saveContinue: 'Simpan & Lanjutkan 🌟',
  },

  bilingual: {
    gameTitle: 'ENGLISH ADVENTURE',
    gameTagline: 'Learn English · Belajar Bahasa Inggris Sambil Bermain!',
    tapToPlay: 'TAP TO PLAY · AYO MAIN',
    recommendedAge: 'Usia 6–10 tahun · Bilingual English & Bahasa Indonesia',
    startPlaying: 'START PLAYING · MULAI MAIN',
    worldMap: 'World Map · Peta',
    myWords: 'My Words · Kamus',
    badges: 'Badges · Medali',
    character: 'Hero · Karakter',
    settings: 'Settings · Pengaturan',
    currentWorld: 'CURRENT AREA · AREA AKTIF',
    resetData: 'Reset Data · Ulang',

    level: 'LVL',
    activeMission: 'ACTIVE MISSION · MISI',
    missionCompleted: 'MISSION COMPLETE · SELESAI!',
    talkToNpc: 'Talk · Bicara',
    interact: 'INTERACT · LIHAT',
    jump: 'JUMP · LOMPAT',
    playGames: 'Mini-Games',
    openMiniGames: 'OPEN MINI-GAMES · 5 PERMAINAN!',
    languageToggle: '🇮🇩 ID & EN 🇬🇧',

    discovered: 'New Word Discovered · Kata Baru!',
    inASentence: 'Example Sentence · Contoh Kalimat:',
    listenPronunciation: 'Listen Audio · Dengar Suara',
    listenIndonesian: 'Arti Bahasa Indonesia',
    meaningInIndonesian: 'Arti Bahasa Indonesia:',
    gotItCollect: 'Got It! Simpan Kata 🎒',
    guideTitle: 'Captain Leo',
    guideRole: 'Explorer Guide · Pemandu',
    listenGuide: 'Listen Voice · Dengar',
    imOnIt: 'I Will Find Them! · Saya Cari Sekarang! 🚀',

    carnivalTitle: 'MINI GAME CARNIVAL · ARENA PERMAINAN',
    findItTitle: '1. Find It · Cari Benda',
    findItDesc: 'Find the correct item · Cari benda yang benar!',
    matchItTitle: '2. Match It · Cocokkan',
    matchItDesc: 'Match word with picture · Pasangkan kata & gambar!',
    listenFindTitle: '3. Listen & Find · Dengar',
    listenFindDesc: 'Listen to the audio & pick · Dengar lalu pilih!',
    wordPuzzleTitle: '4. Word Puzzle · Ejaan',
    wordPuzzleDesc: 'Spell the word · Susun hurufnya!',
    sentenceTitle: '5. Sentence · Kalimat',
    sentenceDesc: 'Build the sentence · Susun kalimat bahasa Inggris!',
    roundText: 'Round · Babak',
    superJob: 'Awesome Job! Hebat Sekali! 🎉',
    playAgain: 'Play Again · Main Lagi 🔄',
    listenPrompt: 'Tap speaker to listen · Dengar suara',
    spellTheWord: 'Spell the Word · Susun Kata:',
    resetTiles: 'Reset Tiles · Ulang Huruf ↺',
    clearSentence: 'Clear · Hapus Kalimat ↺',

    englishIsland: 'ENGLISH ISLAND · PETA PULAU',
    mapSubtitle: 'Choose your destination · Pilih wilayah tujuan',
    back: 'Back · Kembali',
    unlocksAt: 'Unlocks at Level · Terbuka di Lvl',
    achievementsTitle: 'BADGES & TROPHIES · MEDALI 🏆',
    badgesSubtitle: 'Your achievements · Medali pencapaianmu',
    closetTitle: 'ADVENTURER CLOSET · LEMARI PETUALANG 👕',
    closetSubtitle: 'Customize clothes & backpack · Ubah kostum',
    selectAdventurer: 'Select Explorer · Pilih Karakter',
    outfitColor: 'Outfit Color · Warna Baju',
    backpackColor: 'Backpack · Tas Ransel',
    headwear: 'Headwear · Topi Petualang',
    saveContinue: 'Save & Continue · Simpan 🌟',
  },

  en: {
    gameTitle: 'ENGLISH ADVENTURE',
    gameTagline: 'Learn English. Explore. Play.',
    tapToPlay: 'TAP TO PLAY',
    recommendedAge: 'Recommended for kids ages 6–10',
    startPlaying: 'START PLAYING',
    worldMap: 'World Map',
    myWords: 'My Words',
    badges: 'Badges',
    character: 'Character',
    settings: 'Settings',
    currentWorld: 'CURRENT AREA',
    resetData: 'Reset Data',

    level: 'LVL',
    activeMission: 'ACTIVE MISSION',
    missionCompleted: 'MISSION COMPLETE!',
    talkToNpc: 'Talk to Guide',
    interact: 'INTERACT',
    jump: 'JUMP',
    playGames: 'Play Games',
    openMiniGames: 'OPEN 5 MINI-GAMES!',
    languageToggle: 'Language: English 🇬🇧',

    discovered: 'Discovered!',
    inASentence: 'In A Sentence:',
    listenPronunciation: 'Listen Pronunciation',
    listenIndonesian: 'Indonesian Meaning',
    meaningInIndonesian: 'Meaning in Indonesian:',
    gotItCollect: 'Got It! Collect Word 🎒',
    guideTitle: 'Captain Leo',
    guideRole: 'Explorer Guide',
    listenGuide: 'Listen Guide Voice',
    imOnIt: 'I will find them! 🚀',

    carnivalTitle: 'MINI GAME CARNIVAL',
    findItTitle: '1. Find It',
    findItDesc: 'Find the correct item!',
    matchItTitle: '2. Match It',
    matchItDesc: 'Match words with pictures!',
    listenFindTitle: '3. Listen & Find',
    listenFindDesc: 'Listen to the prompt and pick the item!',
    wordPuzzleTitle: '4. Word Puzzle',
    wordPuzzleDesc: 'Spell the word by ordering letter tiles!',
    sentenceTitle: '5. Build Sentence',
    sentenceDesc: 'Arrange words into a correct English sentence!',
    roundText: 'Round',
    superJob: 'Awesome Job! You Won!',
    playAgain: 'Play Again 🔄',
    listenPrompt: 'Tap to listen prompt',
    spellTheWord: 'Spell the Word:',
    resetTiles: 'Reset Tiles ↺',
    clearSentence: 'Clear Sentence ↺',

    englishIsland: 'ENGLISH ISLAND',
    mapSubtitle: 'Choose your next destination',
    back: 'Back',
    unlocksAt: 'Unlocks at Level',
    achievementsTitle: 'ACHIEVEMENTS & BADGES 🏆',
    badgesSubtitle: 'Medals you have collected',
    closetTitle: 'ADVENTURER CLOSET 👕',
    closetSubtitle: 'Customize your English Explorer',
    selectAdventurer: 'Select Adventurer',
    outfitColor: 'Outfit Color',
    backpackColor: 'Backpack Color',
    headwear: 'Headwear',
    saveContinue: 'Save & Continue 🌟',
  },
};
