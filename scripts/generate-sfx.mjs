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
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples with normalization to -3dB (0.707 peak)
  let maxAmp = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxAmp) maxAmp = abs;
  }
  const targetPeak = 0.7079;
  const gain = maxAmp > 0 ? targetPeak / maxAmp : 1;

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i] * gain));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.round(val), offset);
    offset += 2;
  }

  return buffer;
}

function synthesizeSound(recipe) {
  const sampleRate = 44100;
  const numChannels = 2; // Stereo
  const duration = recipe.durationSec || 0.6;
  const numFrames = Math.floor(sampleRate * duration);
  const totalSamples = numFrames * numChannels;
  const samples = new Float32Array(totalSamples);

  const startF = recipe.startFreqHz || 120;
  const endF = recipe.endFreqHz || 45;
  const archetype = recipe.archetype;
  const resonance = recipe.resonance || 1.5;

  let phase = 0;
  let noiseState = 0;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Click-free Hann window envelope
    const env = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (numFrames - 1)));
    const decay = Math.exp(-progress * 3.5);

    let sampleL = 0;
    let sampleR = 0;

    if (archetype === 'SWEEP_BASS' || archetype === 'SUB_DROP') {
      const freq = startF * Math.pow(endF / startF, progress);
      phase += (2 * Math.PI * freq) / sampleRate;
      const subHarmonic = Math.sin(phase * 0.5) * 0.4;
      const sine = Math.sin(phase) + subHarmonic + Math.sin(phase * 2) * 0.15;
      sampleL = sine * env * decay;
      sampleR = sine * env * decay;
    } else if (archetype === 'AIR_WHOOSH') {
      const centerFreq = startF + (endF - startF) * Math.sin(progress * Math.PI);
      const white = (Math.random() * 2 - 1);
      // Bandpass approximation
      noiseState += (white - noiseState) * Math.min(1, (2 * Math.PI * centerFreq) / sampleRate);
      sampleL = noiseState * env * (1 - Math.abs(progress - 0.5) * 0.6);
      sampleR = sampleL * (0.8 + 0.4 * Math.sin(progress * Math.PI * 2));
    } else if (archetype === 'CRYSTAL_GLASS' || archetype === 'METAL_RING') {
      const modal1 = Math.sin(2 * Math.PI * startF * t) * Math.exp(-progress * 2.5);
      const modal2 = Math.sin(2 * Math.PI * (startF * 2.76) * t) * Math.exp(-progress * 4.0) * 0.5;
      const modal3 = Math.sin(2 * Math.PI * (startF * 5.4) * t) * Math.exp(-progress * 6.5) * 0.25;
      const ring = (modal1 + modal2 + modal3) * env;
      sampleL = ring;
      sampleR = ring * 0.95;
    } else if (archetype === 'TENSION_FRICTION' || archetype === 'WOOD_STONE_IMPACT') {
      const freq = startF + (endF - startF) * progress;
      const pulse = (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) * Math.exp(-progress * 5);
      const thud = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-progress * 4.2);
      sampleL = (pulse * 0.6 + thud * 0.7) * env;
      sampleR = sampleL;
    } else {
      phase += (2 * Math.PI * startF) / sampleRate;
      sampleL = Math.sin(phase) * env * decay;
      sampleR = sampleL;
    }

    samples[i * 2] = sampleL;
    samples[i * 2 + 1] = sampleR;
  }

  return createWavBuffer(sampleRate, numChannels, samples);
}

function synthesizeAmbientBed(durationSec = 20) {
  const sampleRate = 44100;
  const numChannels = 2;
  const numFrames = Math.floor(sampleRate * durationSec);
  const totalSamples = numFrames * numChannels;
  const samples = new Float32Array(totalSamples);

  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    // 55Hz (A1) + 82.4Hz (E2 fifth) + 110Hz (A2 octave) warm cinematic tension drone
    p1 += (2 * Math.PI * 55) / sampleRate;
    p2 += (2 * Math.PI * 82.4) / sampleRate;
    p3 += (2 * Math.PI * 110) / sampleRate;

    // Slow subtle beating / pulse
    const mod = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
    const sL = (Math.sin(p1) * 0.6 + Math.sin(p2) * 0.25 + Math.sin(p3) * 0.15) * mod;
    const sR = (Math.sin(p1 + 0.3) * 0.6 + Math.sin(p2 - 0.2) * 0.25 + Math.sin(p3 + 0.1) * 0.15) * mod;

    // Smooth head & tail fade
    const fadeLen = sampleRate * 0.5;
    let fade = 1;
    if (i < fadeLen) fade = i / fadeLen;
    else if (i > numFrames - fadeLen) fade = (numFrames - i) / fadeLen;

    samples[i * 2] = sL * fade * 0.5;
    samples[i * 2 + 1] = sR * fade * 0.5;
  }

  return createWavBuffer(sampleRate, numChannels, samples);
}

export async function runGenerateSFX() {
  const sfxDir = path.resolve('public/sfx');
  fs.mkdirSync(sfxDir, { recursive: true });

  // Generate continuous tension bed
  const bedPath = path.join(sfxDir, 'ambient_tension_bed.wav');
  fs.writeFileSync(bedPath, synthesizeAmbientBed(25));
  console.log(`[SFX Synthesizer] Generated ambient tension bed: ${bedPath}`);

  // Read episode JSON
  const episodePath = path.resolve('src/data/currentEpisode.json');
  if (!fs.existsSync(episodePath)) {
    console.log('[SFX Synthesizer] Warning: currentEpisode.json not found yet. Bed generated.');
    return;
  }

  const blueprint = JSON.parse(fs.readFileSync(episodePath, 'utf8'));
  const beats = blueprint.beats || [];
  const generatedKeys = new Set();

  for (const beat of beats) {
    if (beat.sfxEvents && Array.isArray(beat.sfxEvents)) {
      for (const ev of beat.sfxEvents) {
        if (!generatedKeys.has(ev.sfxKey) && ev.synthRecipe) {
          const wavBuffer = synthesizeSound(ev.synthRecipe);
          const outName = ev.sfxKey.endsWith('.wav') ? ev.sfxKey : `${ev.sfxKey}.wav`;
          const filePath = path.join(sfxDir, outName);
          fs.writeFileSync(filePath, wavBuffer);
          console.log(`[SFX Synthesizer] Generated procedural SFX: ${outName} (${ev.synthRecipe.archetype})`);
          generatedKeys.add(ev.sfxKey);
        }
      }
    }
  }

  console.log(`[SFX Synthesizer] Successfully synthesized ${generatedKeys.size + 1} pristine WAV files in public/sfx/`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-sfx.mjs')) {
  runGenerateSFX();
}
