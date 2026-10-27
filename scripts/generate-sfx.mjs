import fs from 'node:fs';
import path from 'node:path';

function createWavBuffer(sampleRate, numChannels, samples) {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Normalize to safe -3dB peak (0.707)
  let maxAmp = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxAmp) maxAmp = abs;
  }
  const gain = maxAmp > 0 ? 0.707 / maxAmp : 1;

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * gain));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.round(val), offset);
    offset += 2;
  }

  return buffer;
}

function synthesizeSound(recipe) {
  const sampleRate = 44100;
  const numChannels = 2;
  const duration = recipe.durationSec || 0.65;
  const numFrames = Math.floor(sampleRate * duration);
  const totalSamples = numFrames * numChannels;
  const samples = new Float32Array(totalSamples);

  const startF = recipe.startFreqHz || 120;
  const endF = recipe.endFreqHz || 45;
  const archetype = recipe.archetype;

  let phase = 0;
  let filterState = 0;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Smooth Hann window envelope (strictly click-free)
    const env = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (numFrames - 1)));
    let sampleL = 0;
    let sampleR = 0;

    if (archetype === 'SWEEP_BASS' || archetype === 'SUB_DROP') {
      // Warm organic cinematic sub boom (smooth exponential pitch drop, no harsh harmonics)
      const freq = startF * Math.pow(Math.max(20, endF) / startF, progress);
      phase += (2 * Math.PI * freq) / sampleRate;
      const decay = Math.exp(-progress * 3.2);
      const sub = Math.sin(phase) * 0.85 + Math.sin(phase * 0.5) * 0.25;
      sampleL = sub * env * decay;
      sampleR = sampleL;
    } else if (archetype === 'AIR_WHOOSH') {
      // Organic cinematic air whoosh (soft Gaussian filtered noise)
      const white = (Math.random() * 2 - 1) * 0.7;
      const cutoff = 400 + 700 * Math.sin(progress * Math.PI);
      const rc = 1.0 / (2 * Math.PI * cutoff);
      const dt = 1.0 / sampleRate;
      const alpha = dt / (rc + dt);
      filterState += alpha * (white - filterState);
      const decay = Math.sin(progress * Math.PI);
      sampleL = filterState * env * decay;
      sampleR = sampleL * 0.95;
    } else if (archetype === 'CRYSTAL_GLASS' || archetype === 'METAL_RING') {
      // Warm acoustic glass harmonic decay (soft sine modes, no metallic buzzing)
      const m1 = Math.sin(2 * Math.PI * startF * t) * Math.exp(-progress * 2.8);
      const m2 = Math.sin(2 * Math.PI * (startF * 2.1) * t) * Math.exp(-progress * 4.5) * 0.35;
      sampleL = (m1 + m2) * env * 0.6;
      sampleR = sampleL * 0.92;
    } else {
      // Soft organic mechanical tap
      const freq = startF * Math.exp(-progress * 15);
      phase += (2 * Math.PI * freq) / sampleRate;
      const decay = Math.exp(-progress * 12);
      sampleL = Math.sin(phase) * env * decay;
      sampleR = sampleL;
    }

    samples[i * 2] = sampleL;
    samples[i * 2 + 1] = sampleR;
  }

  return createWavBuffer(sampleRate, numChannels, samples);
}

function synthesizeAmbientBed(durationSec = 22) {
  const sampleRate = 44100;
  const numChannels = 2;
  const numFrames = Math.floor(sampleRate * durationSec);
  const totalSamples = numFrames * numChannels;
  const samples = new Float32Array(totalSamples);

  let p1 = 0;
  let p2 = 0;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    // Ultra-soft 43Hz and 65Hz warm cinematic sub-drone (imperceptible, non-intrusive warmth)
    p1 += (2 * Math.PI * 43.65) / sampleRate;
    p2 += (2 * Math.PI * 65.4) / sampleRate;

    // Slow 0.15Hz breathing swell
    const swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.15 * t);
    const sL = (Math.sin(p1) * 0.7 + Math.sin(p2) * 0.3) * swell;
    const sR = (Math.sin(p1 + 0.4) * 0.7 + Math.sin(p2 - 0.3) * 0.3) * swell;

    // Smooth head and tail fade
    const fadeLen = sampleRate * 1.5;
    let fade = 1;
    if (i < fadeLen) fade = i / fadeLen;
    else if (i > numFrames - fadeLen) fade = (numFrames - i) / fadeLen;

    samples[i * 2] = sL * fade * 0.35;
    samples[i * 2 + 1] = sR * fade * 0.35;
  }

  return createWavBuffer(sampleRate, numChannels, samples);
}

export function generateSfx() {
  const sfxDir = path.resolve('public/sfx');
  if (!fs.existsSync(sfxDir)) {
    fs.mkdirSync(sfxDir, { recursive: true });
  }

  const bedPath = path.join(sfxDir, 'ambient_tension_bed.wav');
  fs.writeFileSync(bedPath, synthesizeAmbientBed(22));
  console.log('[SFX Synthesizer] Generated organic ambient bed:', bedPath);

  const episodePath = path.resolve('src/data/currentEpisode.json');
  if (fs.existsSync(episodePath)) {
    const ep = JSON.parse(fs.readFileSync(episodePath, 'utf8'));
    let generated = 0;
    for (const b of ep.beats) {
      if (b.sfxEvents) {
        for (const sfx of b.sfxEvents) {
          const fn = sfx.sfxKey.endsWith('.wav') ? sfx.sfxKey : `${sfx.sfxKey}.wav`;
          const fp = path.join(sfxDir, fn);
          const buf = synthesizeSound(sfx.synthRecipe || {});
          fs.writeFileSync(fp, buf);
          generated++;
          console.log(`[SFX Synthesizer] Generated warm cinematic SFX: ${fn} (${sfx.synthRecipe?.archetype})`);
        }
      }
    }
    console.log(`[SFX Synthesizer] Successfully synthesized ${generated + 1} organic WAV files.`);
  }
}

generateSfx();

