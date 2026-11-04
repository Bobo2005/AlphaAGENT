import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, lerp, prog, spr } from '../anim';
import { CUES } from '../timeline';
import { AppShell } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Glow, Slider } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.luck;

function coinFlipTail(n: number, wins: number): number {
  let ways = 0;
  let c = 1;
  for (let k = 0; k <= n; k++) {
    if (k >= wins) ways += c;
    c = (c * (n - k)) / (k + 1);
  }
  return ways / Math.pow(2, n);
}

export const Luck: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';

  // Picks made: 5 -> 10 (drag1) -> 15 (drag2) -> 20 (dragRate)
  const n =
    f < Q.drag1.at
      ? 5
      : f < Q.drag2.at
      ? Math.round(lerp(5, 10, prog(f, Q.drag1.at, Q.drag1.end)))
      : f < Q.dragRate.at
      ? Math.round(lerp(10, 15, prog(f, Q.drag2.at, Q.drag2.end)))
      : Math.round(lerp(15, 20, prog(f, Q.dragRate.at, Q.dragRate.end)));

  // Share won: 100% -> 75% during dragRate
  const rate =
    f < Q.dragRate.at
      ? 100
      : Math.round(lerp(100, 75, prog(f, Q.dragRate.at, Q.dragRate.end)));

  const wins = Math.round((n * rate) / 100);
  const p = coinFlipTail(n, wins);
  const oneIn = Math.max(1, Math.round(1 / Math.max(p, 1e-9)));

  const activeDragN: [number, number] | undefined =
    f < Q.drag1.end + 16
      ? [Q.drag1.at, Q.drag1.end]
      : f < Q.drag2.end + 16
      ? [Q.drag2.at, Q.drag2.end]
      : [Q.dragRate.at, Q.dragRate.end];

  const activeDragRate: [number, number] | undefined = [Q.dragRate.at, Q.dragRate.end];

  const simpleFollow = rate >= 70 && n >= 5;

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 16, target: 'coinFlip', zoom: 1.32, dur: 20 },
        { at: Q.compareCards.at - 8, target: 'compareRow', zoom: 1.24, dur: 20 },
        { at: Q.drag1.at - 12, target: 'sliderCard', zoom: 1.3, dur: 18 },
        { at: Q.verdict.at - 6, target: 'alphaCard', zoom: 1.35, dur: 20 },
        { at: Q.dragRate.at - 10, target: 'sliderCard', zoom: 1.28, dur: 18 },
        { at: Q.settled.at, target: 'coinFlip', zoom: 1.32, dur: 18 },
        { at: 565, zoom: 1, dur: 24 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 16, target: 'coinFlip', zoom: 1.2, dur: 20 },
        { at: Q.compareCards.at - 8, target: 'compareRow', zoom: 1.2, dur: 20 },
        { at: Q.drag1.at - 12, target: 'sliderCard', zoom: 1.2, dur: 18 },
        { at: Q.verdict.at - 6, target: 'alphaCard', zoom: 1.45, dur: 20 },
        { at: Q.dragRate.at - 10, target: 'sliderCard', zoom: 1.2, dur: 18 },
        { at: Q.settled.at, target: 'coinFlip', zoom: 1.2, dur: 18 },
        { at: 565, zoom: 1, dur: 24 },
      ];

  const scroll = mobile
    ? keyed(f, [
        { at: 0, v: 0 },
        { at: 14, v: 210, dur: 18 },
        { at: Q.drag1.at - 14, v: 40, dur: 18 },
        { at: Q.verdict.at - 8, v: 185, dur: 18 },
        { at: Q.dragRate.at - 12, v: 40, dur: 18 },
        { at: Q.settled.at - 6, v: 210, dur: 18 },
        { at: 565, v: 0, dur: 22 },
      ])
    : 0;

  const coinHighlight = (f >= Q.highlight.at && f < Q.compareCards.at) || (f >= Q.settled.at && f < 575);

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/luck-lab">
      <AppShell route="/luck-lab" mobile={mobile} wallet="guest" scroll={scroll}>
        <h1>Luck Lab</h1>
        <p className="mut lead">
          Illustration. Drag the sliders to see what record AlphaAgent needs before it trusts a tipster.
        </p>
        <div className="card" style={{ marginBottom: 16, position: 'relative' }} data-a="sliderCard">
          <Callout
            at={Q.midPause.at}
            until={Q.drag2.at - 4}
            k="SAMPLE GATE"
            text="10 picks = 1 in 1,024 · still needs 5 more"
            color={C.amber}
          />
          <label>
            <strong>Picks made: {n}</strong>
          </label>
          <Slider value={n} min={3} max={40} drag={activeDragN} />
          <label>
            <strong>Share won: {rate}%</strong>
          </label>
          <Slider value={rate} min={50} max={100} drag={activeDragRate} />
        </div>
        <div className="row" data-a="compareRow">
          <div className="card" style={{ position: 'relative' }}>
            <Glow from={Q.compareCards.at} to={Q.drag1.at - 10} color={C.amber} />
            <Callout
              at={Q.compareCards.at}
              until={Q.drag1.at - 8}
              k="NAIVE RULE"
              text="Fooled by 5-0 coin-flip run"
              color={C.amber}
            />
            <h2>Simple rule</h2>
            <p className="mut" style={{ marginTop: 0 }}>
              Follow anyone who wins 70% or more over 5+ picks.
            </p>
            <span className={`b ${simpleFollow ? 'f' : 's'}`}>{simpleFollow ? 'FOLLOW' : 'SKIP'}</span>
          </div>
          <div className="card" style={{ position: 'relative' }} data-a="alphaCard">
            <Glow from={Q.verdict.at} to={Q.dragRate.at - 8} color={C.green} />
            <h2>AlphaAgent</h2>
            <p className="mut" style={{ marginTop: 0 }}>
              Needs 15 verified picks and a luck check.
            </p>
            {n < 15 ? (
              <div>
                <span className="b w">WATCH</span>{' '}
                <span className="small">Needs {15 - n} more verified picks.</span>
              </div>
            ) : (
              <div style={{ transform: `scale(${0.92 + 0.08 * spr(f, Q.verdict.at, 12)})`, transformOrigin: 'left center' }}>
                <span className="small" style={{ color: C.green, fontWeight: 600 }}>
                  Enough picks to grade. The verdict now depends on the market line. See Check a tipster.
                </span>
              </div>
            )}
            <Callout at={Q.verdict.at} until={Q.dragRate.at - 6} k="GATE UNLOCKED" text="n = 15 verified picks reached" color={C.green} place="top" />
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 28 }} data-a="coinFlip">
          <Glow from={Q.highlight.at} to={Q.compareCards.at - 6} color={C.amber} radius={8} />
          <Glow from={Q.settled.at} to={570} color={C.blue} radius={8} />
          <Callout
            at={Q.settled.at}
            until={572}
            k="REAL SAMPLE"
            text="15 wins in 20 picks = 1 in 48 coin-flip tail"
            color={C.blue}
          />
          <p
            className="mut"
            style={{
              margin: 0,
              padding: '8px 12px',
              borderRadius: 8,
              background: coinHighlight ? (f >= Q.settled.at ? '#eff6ff' : '#fdf0d5') : 'transparent',
              color: coinHighlight ? (f >= Q.settled.at ? C.blue : C.amber) : undefined,
              fontWeight: coinHighlight ? 600 : 400,
            }}
          >
            {wins} wins in {n} picks happens about 1 time in {oneIn.toLocaleString()} if every game is a coin flip. Real verdicts also weigh how hard each pick was against the market line.
          </p>
        </div>
      </AppShell>
    </Camera>
  );
};
