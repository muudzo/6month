const MASTER_LEVEL = 0.8;
const CHORD_SECONDS = 9;
const SCHEDULE_AHEAD_S = 0.6;
const TICK_MS = 250;

/** F major 9 → D minor 9 → B♭ major 7 → C 6/9, as MIDI notes. */
const PROGRESSION = [
  [41, 48, 57, 64, 67],
  [38, 45, 53, 60, 64],
  [34, 41, 57, 62, 64],
  [36, 43, 52, 57, 62],
];

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const impulse = (ctx, seconds) => {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
  }
  return buffer;
};

const noiseBuffer = (ctx, seconds) => {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
};

/**
 * Background music and small sound effects. Nothing plays until start() is
 * called from a user gesture (the ticket tear).
 * @param {{ musicUrl: string, enabled: boolean }} options
 */
export function createAudio({ musicUrl, enabled: initiallyEnabled }) {
  let ctx = null;
  let master = null;
  let music = null;
  let reverb = null;
  let enabled = initiallyEnabled;
  let timer = null;
  let nextChordAt = 0;
  let nextBellAt = 0;
  let chordIndex = 0;

  const envelope = (gain, at, peak, attack, release) => {
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  };

  const tone = ({ frequency, type = 'sine', at, peak, attack, release, wet = 0.4, detune = 0 }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    envelope(gain, at, peak, attack, release);
    osc.connect(gain);
    gain.connect(master);
    if (wet > 0) {
      const send = ctx.createGain();
      send.gain.value = wet;
      gain.connect(send);
      send.connect(reverb);
    }
    osc.start(at);
    osc.stop(at + attack + release + 0.1);
  };

  const padChord = (notes, at) => {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(master);
    filter.connect(reverb);
    notes.forEach((note) => {
      [-6, 6].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = hz(note);
        osc.detune.value = detune;
        envelope(gain, at, 0.022, 3.2, CHORD_SECONDS + 1.5);
        osc.connect(gain);
        gain.connect(filter);
        osc.start(at);
        osc.stop(at + CHORD_SECONDS + 5);
      });
    });
  };

  const schedule = () => {
    const horizon = ctx.currentTime + SCHEDULE_AHEAD_S;
    while (nextChordAt < horizon) {
      padChord(PROGRESSION[chordIndex % PROGRESSION.length], nextChordAt);
      chordIndex += 1;
      nextChordAt += CHORD_SECONDS;
    }
    while (nextBellAt < horizon) {
      const chord = PROGRESSION[(chordIndex - 1 + PROGRESSION.length) % PROGRESSION.length];
      const note = chord[1 + Math.floor(Math.random() * (chord.length - 1))] + 24;
      tone({ frequency: hz(note), at: nextBellAt, peak: 0.035, attack: 0.01, release: 3.5, wet: 0.7 });
      nextBellAt += 1.6 + Math.random() * 3.2;
    }
  };

  const startAmbient = () => {
    nextChordAt = ctx.currentTime + 0.1;
    nextBellAt = ctx.currentTime + 2;
    schedule();
    timer = window.setInterval(schedule, TICK_MS);
  };

  const startMusic = async () => {
    music = new Audio(musicUrl);
    music.loop = true;
    music.crossOrigin = 'anonymous';
    ctx.createMediaElementSource(music).connect(master);
    try {
      await music.play();
    } catch (error) {
      console.warn(`Could not play ${musicUrl}; using the museum's own music instead.`, error);
      music = null;
      startAmbient();
    }
  };

  const start = () => {
    if (ctx) return;
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = enabled ? MASTER_LEVEL : 0;
    master.connect(ctx.destination);
    reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, 3.2);
    const reverbLevel = ctx.createGain();
    reverbLevel.gain.value = 0.5;
    reverb.connect(reverbLevel);
    reverbLevel.connect(master);
    if (musicUrl) startMusic();
    else startAmbient();
  };

  const noiseBurst = ({ at, seconds, from, to, peak }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx, seconds);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(to, at + seconds);
    const gain = ctx.createGain();
    envelope(gain, at, peak, 0.01, seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(at);
  };

  const effects = {
    tear: () => noiseBurst({ at: ctx.currentTime, seconds: 0.35, from: 900, to: 4200, peak: 0.5 }),
    doors: () => {
      const at = ctx.currentTime + 0.3;
      tone({ frequency: 55, at, peak: 0.25, attack: 0.02, release: 1.4, wet: 0.6 });
      noiseBurst({ at, seconds: 1.2, from: 300, to: 120, peak: 0.12 });
    },
    chime: () => {
      const at = ctx.currentTime;
      tone({ frequency: hz(84), at, peak: 0.05, attack: 0.005, release: 1.6, wet: 0.6 });
      tone({ frequency: hz(91), at: at + 0.09, peak: 0.035, attack: 0.005, release: 1.6, wet: 0.6 });
    },
    sparkle: () => {
      const at = ctx.currentTime;
      [84, 88, 91, 96, 100].forEach((note, i) => tone({ frequency: hz(note), at: at + i * 0.07, peak: 0.05, attack: 0.005, release: 0.9, wet: 0.5 }));
    },
    fanfare: () => {
      const at = ctx.currentTime;
      [72, 76, 79, 84].forEach((note, i) => tone({ frequency: hz(note), type: 'triangle', at: at + i * 0.12, peak: 0.08, attack: 0.01, release: 1.8 }));
      [60, 64, 67, 72].forEach((note) => tone({ frequency: hz(note), type: 'triangle', at: at + 0.5, peak: 0.05, attack: 0.3, release: 3 }));
    },
  };

  return {
    start,
    /** @param {keyof typeof effects} name */
    play: (name) => {
      if (!ctx || !enabled) return;
      if (ctx.state === 'suspended') ctx.resume();
      effects[name]?.();
    },
    setEnabled: (on) => {
      enabled = on;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.setTargetAtTime(on ? MASTER_LEVEL : 0, ctx.currentTime, 0.25);
    },
    get enabled() {
      return enabled;
    },
    stop: () => {
      window.clearInterval(timer);
      music?.pause();
      ctx?.close();
    },
  };
}
