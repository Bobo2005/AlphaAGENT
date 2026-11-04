import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\56bfc56c-bdbb-4d3e-ba4e-f0bd803771e0\\scratch\\stills';

const STILLS: [string, number][] = [
  ['00_cover_thumb', 0],
  ['00_cover_home', 160],
  ['01_dir_guest', 240 + 100],
  ['01_dir_audit', 240 + 260],
  ['01_dir_toast', 240 + 610],
  ['02_audit_stats', 960 + 340],
  ['02_audit_gates', 960 + 560],
  ['02_audit_picks', 960 + 700],
  ['03_luck_start', 1740 + 50],
  ['03_luck_mid', 1740 + 268],
  ['03_luck_done', 1740 + 415],
  ['04_pick_select', 2340 + 80],
  ['04_pick_modal', 2340 + 560],
  ['04_pick_receipt', 2340 + 740],
  ['05_bot_kelly', 3180 + 250],
  ['05_bot_gates', 3180 + 485],
  ['06_payoff_shield', 3720 + 215],
  ['06_payoff_ledger', 3720 + 410],
  ['07_outro', 4260 + 180],
];

const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  webpackOverride: (c) => c,
});

for (const compId of ['Desktop', 'Vertical'] as const) {
  const composition = await selectComposition({ serveUrl, id: compId, browserExecutable: CHROME });
  const prefix = compId === 'Desktop' ? 'd' : 'v';
  for (const [name, frame] of STILLS) {
    const output = path.join(OUT, `${prefix}_${name}.png`);
    await renderStill({ composition, serveUrl, output, frame, browserExecutable: CHROME });
    console.log(`rendered ${prefix}_${name}.png (frame ${frame})`);
  }
}
