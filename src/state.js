import { eulerToR, essentialMatrix, fundamentalMatrix, isDegenerate, mat3mul, mat3T } from './math.js';

const listeners = new Set();

// Cam1 looks in -Z (toward smaller Z where P lives).
// Rx180 = rotate 180° around X: keeps world X, flips Y and Z.
// This means world +X stays image-right, and removing ctx.scale(1,-1)
// in renderer2d.js gives the correct up/down orientation.
const CAM1_R = [1, 0, 0,  0, -1, 0,  0, 0, -1];

export const state = {
  P: [-0.3, 0.3, 0.0],
  cam1: { center: [0, 0, 3], R: CAM1_R },
  cam2: { tx: -1.0, ty: 0.0, tz: 3.0, yaw: 0, pitch: 0, roll: 0, center: [-1, 0, 3], R: null },
  focal: 400,

  R: null, t: null, E: null, F: null,
  p1: null, p2: null, l1: null, l2: null,
  degenerate: false,

  trail: [],
  trailEnabled: false,
};

export function subscribe(fn) { listeners.add(fn); }
export function notify() { listeners.forEach((fn) => fn(state)); }

function mv(M, v) {
  return [
    M[0]*v[0] + M[1]*v[1] + M[2]*v[2],
    M[3]*v[0] + M[4]*v[1] + M[5]*v[2],
    M[6]*v[0] + M[7]*v[1] + M[8]*v[2],
  ];
}

function projectToCam(P3, R, center, f) {
  const rel = [P3[0]-center[0], P3[1]-center[1], P3[2]-center[2]];
  const [cx, cy, cz] = mv(R, rel);
  if (cz <= 0.01) return null;
  return [f * cx / cz, f * cy / cz, 1];
}

export function recompute() {
  const { P, cam1, cam2, focal } = state;

  // cam2 world rotation = cam1 base (CAM1_R) × user euler rotation
  // When yaw=pitch=roll=0, cam2 is parallel to cam1.
  const R2 = eulerToR(cam2.yaw, cam2.pitch, cam2.roll);
  const R_cam2 = mat3mul(CAM1_R, R2);
  cam2.R = R_cam2;
  cam2.center = [cam2.tx, cam2.ty, cam2.tz];

  // Relative rotation between cam1 and cam2 (in cam1 frame):
  // R_12 = R_cam2 × R_cam1^T = (CAM1_R × R2) × CAM1_R (CAM1_R is its own inverse)
  const R_relative = mat3mul(mat3mul(CAM1_R, R2), mat3T(CAM1_R));

  // Relative translation expressed in cam1 coordinate frame
  const delta = [
    cam2.tx - cam1.center[0],
    cam2.ty - cam1.center[1],
    cam2.tz - cam1.center[2],
  ];
  const t_relative = mv(CAM1_R, delta);

  state.R = R_relative;
  state.t = t_relative;
  state.degenerate = isDegenerate(t_relative);

  if (!state.degenerate) {
    state.E = essentialMatrix(state.R, state.t);
    state.F = fundamentalMatrix(state.E, focal, focal);
  } else {
    state.E = null;
    state.F = null;
  }

  state.p1 = projectToCam(P, CAM1_R, cam1.center, focal);
  state.p2 = projectToCam(P, R_cam2, cam2.center, focal);

  const F = state.F;
  if (F && state.p1 && state.p2) {
    const p1 = state.p1;
    const p2 = state.p2;
    state.l2 = [
      F[0]*p1[0] + F[1]*p1[1] + F[2],
      F[3]*p1[0] + F[4]*p1[1] + F[5],
      F[6]*p1[0] + F[7]*p1[1] + F[8],
    ];
    state.l1 = [
      F[0]*p2[0] + F[3]*p2[1] + F[6],
      F[1]*p2[0] + F[4]*p2[1] + F[7],
      F[2]*p2[0] + F[5]*p2[1] + F[8],
    ];
  } else {
    state.l1 = null;
    state.l2 = null;
  }

  notify();
}

export const PRESETS = {
  stereo:   { tx: -1,      ty: 0, tz: 3,   yaw:  0, pitch: 0, roll: 0, P: [-0.3, 0.3, 0] },
  forward:  { tx:  0,      ty: 0, tz: 2,   yaw:  0, pitch: 0, roll: 0, P: [-0.2, 0.1, 0.5] },
  rotation: { tx: -0.0001, ty: 0, tz: 3,   yaw: 20, pitch: 0, roll: 0, P: [-0.3, 0.3, 0] },
};
