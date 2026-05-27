/**
 * Pure epipolar geometry math utilities.
 * All matrices are flat Float64Array in row-major order unless noted.
 */

/** @param {number[]} t - translation [tx, ty, tz] */
export function skew(t) {
  const [x, y, z] = t;
  return [0, -z, y, z, 0, -x, -y, x, 0];
}

/** 3x3 matrix multiply (row-major flat arrays) */
export function mat3mul(A, B) {
  const C = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      for (let k = 0; k < 3; k++) {
        C[r * 3 + c] += A[r * 3 + k] * B[k * 3 + c];
      }
    }
  }
  return C;
}

/** Transpose 3x3 */
export function mat3T(A) {
  return [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
}

/** mat3 × vec3 */
export function mat3vec(M, v) {
  return [
    M[0] * v[0] + M[1] * v[1] + M[2] * v[2],
    M[3] * v[0] + M[4] * v[1] + M[5] * v[2],
    M[6] * v[0] + M[7] * v[1] + M[8] * v[2],
  ];
}

/** vec3 dot */
export function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Build rotation matrix from Euler angles (yaw/pitch/roll in degrees, ZYX order).
 * @returns {number[]} flat 3x3 row-major
 */
export function eulerToR(yawDeg, pitchDeg, rollDeg) {
  const toRad = (d) => (d * Math.PI) / 180;
  const cy = Math.cos(toRad(yawDeg));
  const sy = Math.sin(toRad(yawDeg));
  const cp = Math.cos(toRad(pitchDeg));
  const sp = Math.sin(toRad(pitchDeg));
  const cr = Math.cos(toRad(rollDeg));
  const sr = Math.sin(toRad(rollDeg));

  // ZYX convention: Rz * Ry * Rx
  return [
    cy * cp,  cy * sp * sr - sy * cr,  cy * sp * cr + sy * sr,
    sy * cp,  sy * sp * sr + cy * cr,  sy * sp * cr - cy * sr,
    -sp,      cp * sr,                  cp * cr,
  ];
}

/**
 * Compute Essential Matrix: E = [t]× R
 * @param {number[]} R - 3x3 rotation (cam1→cam2 in cam1 frame)
 * @param {number[]} t - translation vector
 */
export function essentialMatrix(R, t) {
  return mat3mul(skew(t), R);
}

/**
 * Compute Fundamental Matrix: F = K2^{-T} E K1^{-1}
 * For equal pinhole cams: K = diag(f, f, 1) with principal point at origin.
 */
export function fundamentalMatrix(E, f1, f2) {
  const iK1 = [1 / f1, 0, 0, 0, 1 / f1, 0, 0, 0, 1];
  const iK2T = [1 / f2, 0, 0, 0, 1 / f2, 0, 0, 0, 1]; // K2^{-T} = K2^{-1} when symmetric
  return mat3mul(mat3mul(iK2T, E), iK1);
}

/**
 * Project 3D world point into camera image coords (pixels, origin = image center).
 * @param {number[]} P3  - [X,Y,Z] in world
 * @param {number[]} R   - 3x3 world→cam rotation
 * @param {number[]} t   - translation (cam centre in world)
 * @param {number}   f   - focal length (pixels)
 * @returns {{ u: number, v: number, depth: number } | null}
 */
export function project(P3, R, camCenter, f) {
  const rel = [P3[0] - camCenter[0], P3[1] - camCenter[1], P3[2] - camCenter[2]];
  const cam = mat3vec(R, rel);
  if (cam[2] <= 0.01) return null;
  return { u: (f * cam[0]) / cam[2], v: (f * cam[1]) / cam[2], depth: cam[2] };
}

/**
 * Compute epipolar line l = F p (for cam2 given point in cam1 homogeneous coords).
 * @param {number[]} F - flat 3x3
 * @param {number[]} p - [u, v, 1]
 * @returns {number[]} line coefficients [a, b, c] for ax+by+c=0
 */
export function epipolarLine(F, p) {
  return mat3vec(F, p);
}

/**
 * Epipolar constraint: p2^T F p1 (should be ~0)
 */
export function epipolarConstraint(F, p1, p2) {
  const Fp1 = mat3vec(F, p1);
  return dot3(p2, Fp1);
}

/** Normalize vec3 */
export function normalize3(v) {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  if (len < 1e-12) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** Cross product */
export function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Check if configuration is degenerate (pure rotation: |t| ≈ 0,
 * or coincident cameras).
 */
export function isDegenerate(t) {
  return Math.sqrt(t[0] ** 2 + t[1] ** 2 + t[2] ** 2) < 0.01;
}
