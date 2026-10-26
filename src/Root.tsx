import React from 'react';
import { Composition } from 'remotion';
import { EpisodeComposition } from './EpisodeComposition.js';
import currentEpisodeData from './data/currentEpisode.json';
import type { EpisodeBlueprint } from './types/schema.js';

export const Root: React.FC = () => {
  const blueprint = currentEpisodeData as unknown as EpisodeBlueprint;
  const fps = blueprint.fps || 30;
  const durationInFrames = Math.round((blueprint.durationInSeconds || 15.01) * fps);

  return (
    <Composition
      id="StickmanEpisode"
      component={EpisodeComposition}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1080}
      height={1920}
      defaultProps={{
        blueprint,
      }}
    />
  );
};
