import React from 'react';
import { Composition } from 'remotion';
import { FPS, TOTAL_FRAMES } from './timeline';
import { Main } from './Main';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Desktop" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ format: 'desktop' as const }} />
    <Composition id="Vertical" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ format: 'vertical' as const }} />
  </>
);

