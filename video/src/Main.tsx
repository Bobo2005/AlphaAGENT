import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Format } from './brand';
import { SCENES, SceneId } from './timeline';
import { Background, Caption, Stage } from './Layout';
import { Cover } from './scenes/Cover';
import { Directory } from './scenes/Directory';
import { Audit } from './scenes/Audit';
import { Luck } from './scenes/Luck';
import { Pick } from './scenes/Pick';
import { Bot } from './scenes/Bot';
import { Payoff } from './scenes/Payoff';
import { Outro } from './scenes/Outro';

const STEP_SCENES: Partial<Record<SceneId, React.FC<{ format: Format }>>> = {
  directory: Directory,
  audit: Audit,
  luck: Luck,
  pick: Pick,
  bot: Bot,
  payoff: Payoff,
};

export const Main: React.FC<{ format: Format }> = ({ format }) => {
  return (
    <AbsoluteFill style={{ fontFamily: 'Inter, sans-serif' }}>
      <Background />
      {SCENES.map((s) => {
        if (s.id === 'cover') {
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name="cover">
              <Cover format={format} />
            </Sequence>
          );
        }
        if (s.id === 'outro') {
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name="outro">
              <Outro format={format} />
            </Sequence>
          );
        }
        const Comp = STEP_SCENES[s.id];
        if (!Comp) return null;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
            <Stage format={format} dur={s.dur}>
              <Comp format={format} />
            </Stage>
            <Caption id={s.id} dur={s.dur} format={format} />
          </Sequence>
        );
      })}
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};
