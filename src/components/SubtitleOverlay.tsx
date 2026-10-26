import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Cairo';
import type { SubtitleChunk } from '../types/schema';

const { fontFamily } = loadFont('normal', {
  weights: ['600'],
  subsets: ['arabic'],
});

interface SubtitleOverlayProps {
  subtitles: SubtitleChunk[];
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const activeSub = subtitles.find(
    (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 20 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 340,
          height: 320,
          background:
            'linear-gradient(180deg, rgba(11,15,25,0) 0%, rgba(11,15,25,0.82) 55%, rgba(11,15,25,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 1420,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          direction: 'rtl',
          padding: '0 80px',
        }}
      >
        {activeSub && (
          <span
            style={{
              fontFamily,
              fontWeight: 600,
              fontSize: '56px',
              color: '#F8FAFC',
              letterSpacing: '0px',
              lineHeight: 1.35,
              textShadow: '0px 4px 16px rgba(0, 0, 0, 0.75), 0px 2px 6px rgba(0, 0, 0, 0.9)',
              userSelect: 'none',
            }}
          >
            {activeSub.text}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};
