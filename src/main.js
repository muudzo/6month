import './styles/tokens.css';
import './styles/base.css';
import './styles/entrance.css';
import './styles/hud.css';
import './styles/placard.css';
import './styles/modal.css';
import './styles/guide.css';

import { MUSEUM } from './config/museum.js';
import { prepareConfig, validateConfig } from './lib/config.js';
import { startExperience } from './app/experience.js';
import { el } from './ui/dom.js';
import { ensureFonts } from './world/fonts.js';
import { createStage, detectQuality } from './world/stage.js';
import { createWorld } from './world/world.js';

const loader = document.getElementById('loader');
const loaderBar = loader.querySelector('.loader__bar');
const loaderFill = loader.querySelector('.loader__fill');

const setProgress = (fraction) => {
  const percent = Math.round(fraction * 100);
  loaderFill.style.transform = `scaleX(${fraction})`;
  loaderBar.setAttribute('aria-valuenow', String(percent));
};

/** Replace the loader with a plain explanation of what went wrong and how to fix it. */
const showProblem = (title, details) => {
  loader.replaceChildren(
    el('p', { class: 'loader__eyebrow', text: 'The museum is closed for a moment' }),
    el('p', { class: 'loader__title', text: title }),
    el('ul', { class: 'loader__error' }, details.map((detail) => el('li', { text: detail }))),
  );
};

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
};

async function boot() {
  const check = validateConfig(MUSEUM);
  if (!check.ok) {
    showProblem('src/config/museum.js needs a small fix', check.errors);
    return;
  }
  if (!hasWebGL()) {
    showProblem('This browser can’t open the 3D museum', [
      'WebGL is switched off or unsupported here. Try the latest Chrome, Safari or Firefox, or another device.',
    ]);
    return;
  }

  const museum = prepareConfig(MUSEUM);
  document.title = museum.museumName;
  const stage = createStage(document.getElementById('stage'), detectQuality());
  await ensureFonts();
  setProgress(0.05);
  const world = await createWorld({ renderer: stage.renderer, museum, onProgress: (f) => setProgress(0.05 + f * 0.95) });
  stage.attach(world.scene);
  startExperience({ stage, world, museum });
  loader.classList.add('is-done');
  window.setTimeout(() => {
    loader.hidden = true;
  }, 800);
}

boot().catch((error) => {
  console.error('[museum] Failed to open', error);
  showProblem('Something went wrong while opening the doors', [
    'Try reloading the page. If it keeps happening, the browser console has the details.',
  ]);
});
