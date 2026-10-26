let ctx = null;
let master = null;
let sfxGain = null;
let musicGain = null;
let timer = null;
let trackName = null;
let step = 0;
let nextTime = 0;
let hatBuf = null;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = 0.9;
  sfxGain.connect(master);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.4;
  musicGain.connect(master);
  return ctx;
}

export function setVolume(v) {
  ensureAudio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v));
}

function tone(freq, start, dur, type, level, dest) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(level, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(dest || sfxGain);
  o.start(start);
  o.stop(start + dur + 0.03);
}

function noiseBurst(start, dur, level, freq) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = level;
  src.connect(f);
  f.connect(g);
  g.connect(sfxGain);
  src.start(start);
}

export function sfx(name) {
  if (!ctx) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'click':
      tone(880, t, 0.06, 'square', 0.09);
      break;
    case 'select':
      tone(660, t, 0.08, 'triangle', 0.14);
      tone(990, t + 0.06, 0.1, 'triangle', 0.1);
      break;
    case 'step':
      tone(70 + Math.random() * 18, t, 0.07, 'sine', 0.11);
      break;
    case 'jump':
      tone(300, t, 0.14, 'triangle', 0.1);
      break;
    case 'shard':
      tone(1320, t, 0.1, 'sine', 0.13);
      tone(1980, t + 0.07, 0.16, 'sine', 0.1);
      break;
    case 'correct':
      tone(660, t, 0.1, 'triangle', 0.15);
      tone(880, t + 0.09, 0.12, 'triangle', 0.13);
      tone(1320, t + 0.18, 0.18, 'triangle', 0.11);
      break;
    case 'wrong':
      tone(220, t, 0.16, 'sawtooth', 0.14);
      tone(150, t + 0.12, 0.24, 'sawtooth', 0.11);
      break;
    case 'hit':
      tone(120, t, 0.22, 'sawtooth', 0.18);
      noiseBurst(t, 0.18, 0.12, 900);
      break;
    case 'unlock':
      tone(440, t, 0.1, 'square', 0.12);
      tone(660, t + 0.1, 0.1, 'square', 0.12);
      tone(880, t + 0.2, 0.32, 'square', 0.12);
      break;
    case 'xp':
      tone(1046, t, 0.1, 'sine', 0.1);
      tone(1568, t + 0.07, 0.14, 'sine', 0.08);
      break;
    case 'boom':
      tone(90, t, 0.5, 'sawtooth', 0.24);
      noiseBurst(t, 0.5, 0.22, 400);
      break;
    case 'punch':
      noiseBurst(t, 0.07, 0.14, 1800);
      tone(160, t, 0.08, 'square', 0.1);
      break;
    case 'whoosh':
      noiseBurst(t, 0.25, 0.12, 700);
      noiseBurst(t + 0.08, 0.2, 0.1, 1400);
      break;
    case 'dash':
      tone(520, t, 0.12, 'sawtooth', 0.07);
      noiseBurst(t, 0.18, 0.14, 2600);
      break;
    case 'charge':
      tone(220, t, 0.35, 'triangle', 0.08);
      tone(440, t + 0.12, 0.25, 'triangle', 0.06);
      break;
    case 'blast':
      tone(880, t, 0.08, 'square', 0.1);
      tone(110, t, 0.45, 'sawtooth', 0.2);
      noiseBurst(t, 0.4, 0.2, 1100);
      break;
    default:
      break;
  }
}

const TRACKS = {
  hub: {
    root: 55,
    bpm: 104,
    bass: [0, null, 7, null, 3, null, 10, null, 5, null, 12, null, 3, null, 10, null],
    lead: [12, 15, 19, 15, 17, 20, 24, 20, 19, 22, 26, 22, 17, 15, 12, 15],
    leadWave: 'square'
  },
  boss: {
    root: 46.25,
    bpm: 140,
    bass: [0, 0, null, 0, 1, 1, null, 1, 3, 3, null, 3, 5, 5, null, 5],
    lead: [12, null, 13, null, 12, null, 10, null, 12, null, 15, null, 13, null, 10, null],
    leadWave: 'sawtooth'
  }
};

function kick(time) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(140, time);
  o.frequency.exponentialRampToValueAtTime(42, time + 0.16);
  g.gain.setValueAtTime(0.45, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  o.connect(g);
  g.connect(musicGain);
  o.start(time);
  o.stop(time + 0.22);
}

function hat(time, level) {
  if (!ctx) return;
  if (!hatBuf) {
    const len = Math.floor(ctx.sampleRate * 0.05);
    hatBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = hatBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = hatBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7200;
  const g = ctx.createGain();
  g.gain.value = level;
  src.connect(f);
  f.connect(g);
  g.connect(musicGain);
  src.start(time);
}

function schedule(t, i, time) {
  const s = i % 16;
  const b = t.bass[s];
  if (b !== null && b !== undefined) {
    tone(t.root * Math.pow(2, b / 12), time, 0.28, 'sawtooth', 0.2, musicGain);
  }
  const l = t.lead[s];
  if (l !== null && l !== undefined) {
    tone(t.root * 4 * Math.pow(2, l / 12), time, 0.17, t.leadWave, 0.045, musicGain);
  }
  if (s % 4 === 0) kick(time);
  if (s % 4 === 2) hat(time, 0.1);
  if (t === TRACKS.boss && s % 2 === 1) hat(time, 0.05);
}

function tick() {
  if (!ctx || !trackName) return;
  const t = TRACKS[trackName];
  const spb = 60 / t.bpm / 4;
  while (nextTime < ctx.currentTime + 0.25) {
    schedule(t, step, nextTime);
    nextTime += spb;
    step += 1;
  }
}

export function startMusic(name) {
  ensureAudio();
  if (!ctx || !TRACKS[name]) return;
  if (trackName === name) return;
  stopMusic();
  trackName = name;
  step = 0;
  nextTime = ctx.currentTime + 0.12;
  timer = window.setInterval(tick, 50);
}

export function stopMusic() {
  if (timer) window.clearInterval(timer);
  timer = null;
  trackName = null;
}