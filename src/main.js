import 'katex/dist/katex.min.css';
import 'prism-themes/themes/prism-nord.css';

import { injectStyles } from './styles.js';
import { state, subscribe, recompute } from './state.js';
import { initControls } from './controls.js';
import { initRenderer3D } from './renderer3d.js';
import { init2DRenderers } from './renderer2d.js';
import { initMatrixPanel } from './matrixPanel.js';
import { initModal } from './modal.js';

injectStyles();

const canvas3d = document.getElementById('canvas3d');
const canvas2d1 = document.getElementById('canvas2d-1');
const canvas2d2 = document.getElementById('canvas2d-2');

// Bootstrap all subsystems
const r3d = initRenderer3D(canvas3d, state);
const r2d = init2DRenderers(canvas2d1, canvas2d2, state);
const matPanel = initMatrixPanel();
initControls();
initModal();

// Subscribe to state changes
subscribe((s) => {
  r2d.render(s);
  matPanel.update(s);
});

// Run initial computation
recompute();

// Animation loop (drives the 3D orbit controls and live rendering)
function loop(s) {
  r3d.render(s);
  requestAnimationFrame(() => loop(state));
}
loop(state);

// Handle resize for 3D canvas
window.addEventListener('resize', () => {
  r3d.resize();
  r2d.resize();
  recompute();
});
