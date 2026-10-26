import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { EpisodeBlueprint } from './types/schema.js';
import { Stage3D } from './components/Stage3D.js';
import { SubtitleOverlay } from './components/SubtitleOverlay.js';
import { AudioEngine } from './components/AudioEngine.js';

interface EpisodeCompositionProps {
  blueprint: EpisodeBlueprint;
}

export const EpisodeComposition: React.FC<EpisodeCompositionProps> = ({ blueprint }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0F19' }}>
      {/* 3D Scene Layer */}
      <Stage3D stage={blueprint.stage} beats={blueprint.beats} />

      {/* 2D Isolated Subtitle Layer (Screen-space locked at Y=1420px) */}
      <SubtitleOverlay subtitles={blueprint.subtitles} />

      {/* Procedural Audio & Voiceover Layer */}
      <AudioEngine audioUrl={blueprint.audioUrl} beats={blueprint.beats} />
    </AbsoluteFill>
  );
};
