import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import { continueRender, delayRender } from 'remotion';

const handle = delayRender('Loading fonts');
const loads = [400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 20px Inter`)).concat([400, 500, 600].map((w) => document.fonts.load(`${w} 20px "JetBrains Mono"`)));
Promise.all(loads)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

