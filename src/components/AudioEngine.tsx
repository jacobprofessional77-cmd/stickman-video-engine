import React from 'react';
import { Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { SceneBeat, SoundEffectEvent } from '../types/schema';

interface AudioEngineProps {
  audioUrl: string;
  beats: SceneBeat[];
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ audioUrl, beats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const voiceSrc = audioUrl.startsWith('http') ? audioUrl : staticFile(audioUrl);
  const bedSrc = staticFile('sfx/ambient_tension_bed.wav');

  const bedVolume = interpolate(
    currentTime,
    [0, 11.25, 12.8, 14.5, 15.01],
    [0.14, 0.14, 0.24, 0.24, 0.14],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

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
      <Audio src={voiceSrc} volume={1.0} />
      <Audio src={bedSrc} volume={bedVolume} loop />
      {allSfx.map((sfx, idx) => {
        const fileName = sfx.sfxKey.endsWith('.wav') ? sfx.sfxKey : `${sfx.sfxKey}.wav`;
        const sfxSrc = staticFile(`sfx/${fileName}`);

        return (
          <Audio
            key={`${sfx.sfxKey}_${idx}`}
            src={sfxSrc}
            startFrom={0}
            volume={sfx.volume}
            playbackRate={1}
          />
        );
      })}
    </>
  );
};
