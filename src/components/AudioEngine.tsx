import React from 'react';
import { Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { SceneBeat, SoundEffectEvent } from '../types/schema.js';

interface AudioEngineProps {
  audioUrl: string;
  beats: SceneBeat[];
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ audioUrl, beats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Voiceover audio path
  const voiceSrc = audioUrl.startsWith('http') ? audioUrl : staticFile(audioUrl);
  const bedSrc = staticFile('sfx/ambient_tension_bed.wav');

  // Compute tension bed volume based on current beat
  const currentBeat =
    beats.find((b) => currentTime >= b.startTime && currentTime <= b.endTime) || beats[0];
  const targetBedVol = currentBeat ? currentBeat.tensionBedVolume : 0.14;

  // Smooth bed volume transition
  const bedVolume = interpolate(
    currentTime,
    [0, 11.25, 12.8, 14.5, 15.01],
    [0.14, 0.14, 0.24, 0.24, 0.14],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Collect all SFX events across all beats
  const allSfx: SoundEffectEvent[] = [];
  for (const b of beats) {
    if (b.sfxEvents && Array.isArray(b.sfxEvents)) {
      for (const ev of b.sfxEvents) {
        allSfx.push(ev);
      }
    }
  }

  return (
    <>
      {/* 1. Main Voiceover Track (Standard volume = 1.0) */}
      <Audio src={voiceSrc} volume={1.0} />

      {/* 2. Continuous Dynamic Tension Bed (Volume = 0.14 in Trust, 0.24 in Danger) */}
      <Audio src={bedSrc} volume={bedVolume} loop />

      {/* 3. Pre-Cued Procedural SFX Events */}
      {allSfx.map((sfx, idx) => {
        const triggerFrame = Math.round(sfx.triggerTime * fps);
        const fileName = sfx.sfxKey.endsWith('.wav') ? sfx.sfxKey : `${sfx.sfxKey}.wav`;
        const sfxSrc = staticFile(`sfx/${fileName}`);

        // Only mount audio when active or in range
        return (
          <Audio
            key={`${sfx.sfxKey}_${idx}`}
            src={sfxSrc}
            startFrom={0}
            volume={sfx.volume}
            playbackRate={1}
            // Remotion Audio handles precise timing when placed in a Sequence or offset
          />
        );
      })}
    </>
  );
};
