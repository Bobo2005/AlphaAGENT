import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.resolve('..');

console.log('Bundling Remotion project...');
const serveUrl = await bundle({
  entryPoint: path.resolve('src/index.ts'),
  webpackOverride: (c) => c,
});

const targets: [string, string][] = [
  ['Desktop', path.join(ROOT, 'alphaagent-16x9.mp4')],
  ['Vertical', path.join(ROOT, 'alphaagent-9x16.mp4')],
];

for (const [id, outputLocation] of targets) {
  console.log(`\nSelecting composition ${id}...`);
  const composition = await selectComposition({ serveUrl, id, browserExecutable: CHROME });
  console.log(`Rendering ${id} -> ${outputLocation} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames @ ${composition.fps}fps)...`);
  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    browserExecutable: CHROME,
    crf: 16,
    pixelFormat: 'yuv420p',
    audioBitrate: '320k',
    concurrency: 8,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastPct + 10) {
        lastPct = pct;
        console.log(`  [${id}] ${pct}%`);
      }
    },
  });
  console.log(`Finished ${outputLocation}`);
}

