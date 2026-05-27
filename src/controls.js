import { state, recompute, swapCameras, PRESETS } from './state.js';

export function initControls() {
  // P is a plain array — bind individually to avoid overwriting the array reference
  ['pt-x', 'pt-y', 'pt-z'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state.P[i];
    el.addEventListener('input', () => {
      if (state.trailEnabled && state.p1 && state.p2) {
        state.trail.push({ p1: [...state.p1], p2: [...state.p2] });
      }
      state.P[i] = parseFloat(el.value);
      recompute();
    });
  });

  ['cam2-tx', 'cam2-ty', 'cam2-tz'].forEach((id, i) => {
    const keys = ['tx', 'ty', 'tz'];
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state.cam2[keys[i]];
    el.addEventListener('input', () => {
      state.cam2[keys[i]] = parseFloat(el.value);
      recompute();
    });
  });

  ['cam2-yaw', 'cam2-pitch', 'cam2-roll'].forEach((id) => {
    const key = id.replace('cam2-', '');
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state.cam2[key];
    el.addEventListener('input', () => {
      state.cam2[key] = parseFloat(el.value);
      recompute();
    });
  });

  const focalEl = document.getElementById('focal');
  const focalVal = document.getElementById('focal-val');
  if (focalEl) {
    focalEl.value = state.focal;
    focalEl.addEventListener('input', () => {
      state.focal = parseFloat(focalEl.value);
      if (focalVal) focalVal.textContent = `${state.focal} px`;
      recompute();
    });
  }

  // Presets — also reset cam1 back to origin so swap state is cleared
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.preset];
      if (!preset) return;
      state.P = [...preset.P];
      state.cam1.tx = 0; state.cam1.ty = 0; state.cam1.tz = 3;
      state.cam1.yaw = 0; state.cam1.pitch = 0; state.cam1.roll = 0;
      state.cam2.tx = preset.tx;
      state.cam2.ty = preset.ty;
      state.cam2.tz = preset.tz;
      state.cam2.yaw = preset.yaw;
      state.cam2.pitch = preset.pitch;
      state.cam2.roll = preset.roll;
      syncSliders();
      recompute();
    });
  });

  // Swap cameras
  const swapBtn = document.getElementById('swap-cameras');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      swapCameras();
      syncSliders();
    });
  }

  // Trail
  const trailToggle = document.getElementById('trail-toggle');
  if (trailToggle) {
    trailToggle.addEventListener('change', () => {
      state.trailEnabled = trailToggle.checked;
    });
  }
  const clearTrail = document.getElementById('clear-trail');
  if (clearTrail) {
    clearTrail.addEventListener('click', () => { state.trail = []; });
  }

  function syncSliders() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal('pt-x', state.P[0]);
    setVal('pt-y', state.P[1]);
    setVal('pt-z', state.P[2]);
    setVal('cam2-tx', state.cam2.tx);
    setVal('cam2-ty', state.cam2.ty);
    setVal('cam2-tz', state.cam2.tz);
    setVal('cam2-yaw', state.cam2.yaw);
    setVal('cam2-pitch', state.cam2.pitch);
    setVal('cam2-roll', state.cam2.roll);
  }
}
