/**
 * Web Audio API synthesizer & Web Speech API integration.
 * Zero external audio files required, runs reliably in all modern browsers.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    try {
      const saved = localStorage.getItem('game_audio_muted');
      if (saved === 'true') {
        this.isMuted = true;
      }
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    try {
      localStorage.setItem('game_audio_muted', String(muted));
    } catch {
      // ignore
    }
    if (muted) {
      if (this.bgmInterval) {
        clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      }
    } else if (this.musicEnabled) {
      this.startAmbientMusic();
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public setSoundSettings(sfx: boolean, music: boolean) {
    this.sfxEnabled = sfx;
    this.musicEnabled = music;
    if ((!music || this.isMuted) && this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    } else if (music && !this.isMuted && !this.bgmInterval) {
      this.startAmbientMusic();
    }
  }

  // --- Sound Effects using Oscillator Nodes ---

  public playButtonClick() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playJump() {
    this.playMarioJump();
  }

  public playMarioJump() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.14);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playBlockBump() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playSpringBounce() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPowerUp() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.14, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.12);
    });
  }

  public playSahabatKafaPower() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Royal Sahabat Kafa heroic arpeggio (C5, E5, G5, C6, G6) with celestial shine
    const arpeggio = [
      { f: 523.25, time: 0, dur: 0.22, vol: 0.18, type: 'triangle' as OscillatorType },
      { f: 659.25, time: 0.08, dur: 0.22, vol: 0.20, type: 'triangle' as OscillatorType },
      { f: 783.99, time: 0.16, dur: 0.25, vol: 0.22, type: 'triangle' as OscillatorType },
      { f: 1046.50, time: 0.24, dur: 0.45, vol: 0.25, type: 'sine' as OscillatorType },
      { f: 1318.51, time: 0.32, dur: 0.55, vol: 0.22, type: 'sine' as OscillatorType },
      { f: 1567.98, time: 0.40, dur: 0.75, vol: 0.26, type: 'sine' as OscillatorType },
      { f: 2093.00, time: 0.48, dur: 0.95, vol: 0.20, type: 'sine' as OscillatorType },
    ];

    arpeggio.forEach(n => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.time);

      gain.gain.setValueAtTime(n.vol, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * Signature Sahabat Kafa Jurus / Ultimate Skill Audio & Heroic Voice Shout.
   * Plays a high-impact synthesized battle fanfare with bass shockwave
   * and triggers an energetic Indonesian superhero speech shout: "Jurus Sahabat Kafa!"
   */
  public playSahabatKafaJurus(powerName?: string) {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Heavy bass impact / shockwave surge
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(160, now);
    bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
    bassGain.gain.setValueAtTime(0.35, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.45);

    // 2. Ascending heroic anime-style trumpet fanfares (C5, G5, C6, E6, G6)
    const fanfare = [
      { f: 523.25, time: 0, dur: 0.18, vol: 0.25 },
      { f: 659.25, time: 0.08, dur: 0.22, vol: 0.28 },
      { f: 783.99, time: 0.16, dur: 0.25, vol: 0.30 },
      { f: 1046.50, time: 0.24, dur: 0.55, vol: 0.35 },
      { f: 1318.51, time: 0.32, dur: 0.65, vol: 0.32 },
      { f: 1567.98, time: 0.40, dur: 0.85, vol: 0.38 },
    ];

    fanfare.forEach(note => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.time);
      gain.gain.setValueAtTime(note.vol, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });

    // 3. Shimmering celestial glitter / star power chime
    const glints = [2093.0, 2637.0, 3135.96, 4186.0];
    glints.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.2 + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + 0.2 + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + 0.2 + idx * 0.06);
      osc.stop(now + 0.2 + idx * 0.06 + 0.35);
    });

    // 4. Energetic Superhero Voice Branding Shout: "Jurus Sahabat Kafa!"
    const voiceText = powerName 
      ? `Jurus Sahabat Kafa! ${powerName}!` 
      : 'Jurus Sahabat Kafa!';
    this.speakSahabatKafaVoice(voiceText);
  }

  /**
   * Energetic vocal callout for Sahabat Kafa branding
   */
  public speakSahabatKafaVoice(text: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      // Don't cancel speech immediately if user is listening to an English vocab quiz,
      // but ensure short heroic delivery
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15; // fast, energetic hero voice
      utterance.pitch = 1.25; // heroic, youthful anime hero tone
      utterance.lang = 'id-ID';

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('ms'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore if browser blocks audio policy
    }
  }

  public playTrophyUnlock() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Iconic console achievement / PS3 trophy crystal double ping
    const pings = [
      { f: 2093.0, delay: 0, dur: 0.65, vol: 0.18 },      // C7
      { f: 2637.0, delay: 0.12, dur: 0.95, vol: 0.22 },   // E7
      { f: 3135.96, delay: 0.24, dur: 1.2, vol: 0.15 },   // G7
    ];

    pings.forEach(p => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now + p.delay);

      gain.gain.setValueAtTime(p.vol, now + p.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + p.delay + p.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + p.delay);
      osc.stop(now + p.delay + p.dur);
    });
  }

  public playStarBurst() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.04 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.18);
    });
  }

  public playStageClearFanfare() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Classic triumph fanfare notes: G4, C5, E5, G5, C6, E6, G6
    const fanfare = [
      { f: 392.00, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.13 },
      { f: 659.25, d: 0.12, t: 0.26 },
      { f: 783.99, d: 0.20, t: 0.39 },
      { f: 659.25, d: 0.12, t: 0.62 },
      { f: 783.99, d: 0.45, t: 0.75 },
    ];

    fanfare.forEach(note => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.22, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }

  public playFootstep() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + Math.random() * 25, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playStompEnemy() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playCuteBump() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playTornadoSpin() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playFireball() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playShieldActivate() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  public playSuperNova() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [392, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  public playPlayerHurt() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playDoorOpen() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.32);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playDoorClose() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playShootMagic() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.28);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playEnemyShoot() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playThunderPound() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sub-bass heavy slam with crackle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playGameOver() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 392, 349, 293];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.25, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.18 + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.24);
    });
  }

  public playCoin() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playInteract() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.18);
    });
  }

  public playCorrect() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.28);
    });
  }

  public playWrong() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLevelUp() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.22, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.45);
    });
  }

  public playMissionComplete() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.6);
    });
  }

  // --- HARVEST MOON FARMING AUDIO FX ---
  public playHoeTill() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWaterPlant() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [320, 480, 640].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.15);
    });
  }

  public playPlantSeed() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playHarvestCrop() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.16, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  public playAnimalPet() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(550, now + 0.08);
    osc.frequency.linearRampToValueAtTime(660, now + 0.16);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playMarketSell() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  public playKickBall() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playJukeboxTune(trackId: number = 1) {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const tunes = [
      [
        { f: 261.63, t: 0, d: 0.12, type: 'square' },
        { f: 329.63, t: 0.12, d: 0.12, type: 'square' },
        { f: 392.00, t: 0.24, d: 0.12, type: 'square' },
        { f: 523.25, t: 0.36, d: 0.24, type: 'square' },
        { f: 440.00, t: 0.60, d: 0.15, type: 'triangle' },
        { f: 523.25, t: 0.75, d: 0.35, type: 'sine' },
      ],
      [
        { f: 392.00, t: 0, d: 0.14, type: 'triangle' },
        { f: 523.25, t: 0.14, d: 0.14, type: 'square' },
        { f: 659.25, t: 0.28, d: 0.14, type: 'square' },
        { f: 783.99, t: 0.42, d: 0.28, type: 'sine' },
        { f: 659.25, t: 0.70, d: 0.14, type: 'square' },
        { f: 783.99, t: 0.84, d: 0.45, type: 'sine' },
      ],
      [
        { f: 440.00, t: 0, d: 0.22, type: 'sine' },
        { f: 554.37, t: 0.1, d: 0.22, type: 'sine' },
        { f: 659.25, t: 0.2, d: 0.35, type: 'sine' },
        { f: 880.00, t: 0.35, d: 0.55, type: 'triangle' },
      ]
    ];

    const track = tunes[(trackId - 1) % tunes.length];
    track.forEach(note => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = note.type as OscillatorType;
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.16, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }

  public playBell() {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Classic School Bell Westminster chime notes (E5, C5, D5, G4)
    const bellNotes = [
      { f: 659.25, t: 0, d: 0.35 },
      { f: 523.25, t: 0.32, d: 0.35 },
      { f: 587.33, t: 0.64, d: 0.35 },
      { f: 392.00, t: 0.96, d: 0.65 },
    ];

    bellNotes.forEach(n => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.22, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  // --- Background ambient chimes (playful, gentle, warm) ---
  public startAmbientMusic() {
    if (!this.musicEnabled || this.bgmInterval) return;

    const melody = [
      523.25, 659.25, 587.33, 659.25,
      783.99, 659.25, 523.25, 440.00
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const note = melody[this.bgmStep % melody.length];
      this.bgmStep++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      // Very soft, peaceful background chime
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.7);
    }, 1400);
  }

  // --- Speech Synthesis for English Pronunciation ---

  public speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slightly slower, crystal clear for children
      utterance.pitch = 1.15; // Friendly, warm pitch
      utterance.lang = 'en-US';

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  // --- Speech Synthesis for Indonesian Pronunciation / Guide ---
  public speakId(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.lang = 'id-ID';

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('ms'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }
}

export const audio = new AudioEngine();
