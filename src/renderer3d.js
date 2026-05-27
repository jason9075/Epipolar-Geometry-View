import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const C1_COLOR = 0x88C0D0;
const C2_COLOR = 0x81A1C1;
const PT_COLOR = 0xEBCB8B;
const PLANE_COLOR = 0x5E81AC;

// Viewer at +Z looking in -Z; right=+X, far end=negative Z → right-far corner
const AXES_ORIGIN = new THREE.Vector3(5, 0, -5);

export function initRenderer3D(canvas, stateRef) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);

  // CSS2D overlay for camera labels
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.cssText =
    'position:absolute;top:0;left:0;pointer-events:none;';
  canvas.parentElement.style.position = 'relative';
  canvas.parentElement.appendChild(labelRenderer.domElement);

  // ── Main scene ────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2E3440);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
  // Viewer on +Z side, looking toward -Z.
  // right vector = (view_dir) × up = (0,0,-1)×(0,1,0) = (+1,0,0) = world +X  ✓
  // forward in viewport = -Z  ✓
  camera.position.set(-0.5, 3, 7);
  camera.lookAt(-0.5, 0, 1);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(-0.5, 0, 1);

  scene.add(new THREE.AmbientLight(0x4C566A, 1.2));
  const dLight = new THREE.DirectionalLight(0xECEFF4, 1.0);
  dLight.position.set(3, 5, 4);
  scene.add(dLight);

  const grid = new THREE.GridHelper(10, 20, 0x3B4252, 0x3B4252);
  grid.position.y = -0.01;
  scene.add(grid);

  // Scene point
  const ptGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const ptMat = new THREE.MeshStandardMaterial({
    color: PT_COLOR, emissive: PT_COLOR, emissiveIntensity: 0.3,
  });
  const ptMesh = new THREE.Mesh(ptGeo, ptMat);
  scene.add(ptMesh);

  // Camera frustum factory
  function makeFrustum(color) {
    const group = new THREE.Group();
    const edges = [
      [-0.3, -0.2, 0.5], [0.3, -0.2, 0.5],
      [0.3,  0.2, 0.5],  [-0.3, 0.2, 0.5],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const apex = new THREE.Vector3(0, 0, 0);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const makeL = (a, b) => {
      const g = new THREE.BufferGeometry().setFromPoints([a, b]);
      return new THREE.Line(g, lineMat);
    };
    for (let i = 0; i < 4; i++) group.add(makeL(edges[i], edges[(i + 1) % 4]));
    for (let i = 0; i < 4; i++) group.add(makeL(apex, edges[i]));
    const planeG = new THREE.PlaneGeometry(0.6, 0.4);
    const planeM = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeG, planeM);
    plane.position.z = 0.5;
    group.add(plane);
    return group;
  }

  function makeLabel(text, hexColor) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `
      font: bold 11px/1 'JetBrains Mono', monospace;
      color: #${hexColor.toString(16).padStart(6, '0')};
      background: rgba(46,52,64,0.75);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
    `;
    return new CSS2DObject(div);
  }

  const frustumA = makeFrustum(C2_COLOR); // Cam 1, fixed at c1 origin
  const frustumB = makeFrustum(C1_COLOR); // Cam 2, follows cam2 pose
  scene.add(frustumA, frustumB);

  const labelA = makeLabel('Cam 1', C2_COLOR);
  const labelB = makeLabel('Cam 2', C1_COLOR);
  labelA.position.set(0, 0.45, 0);
  labelB.position.set(0, 0.45, 0);
  frustumA.add(labelA);
  frustumB.add(labelB);

  // Baseline
  const baselineGeo = new THREE.BufferGeometry();
  const baselineLine = new THREE.Line(
    baselineGeo,
    new THREE.LineBasicMaterial({ color: 0xBF616A, linewidth: 2 }),
  );
  scene.add(baselineLine);

  // Epipolar plane
  const epPlaneGeo = new THREE.BufferGeometry();
  const epPlaneMesh = new THREE.Mesh(
    epPlaneGeo,
    new THREE.MeshBasicMaterial({
      color: PLANE_COLOR, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    }),
  );
  scene.add(epPlaneMesh);

  // Rays
  const ray1Geo = new THREE.BufferGeometry();
  const ray1Line = new THREE.Line(
    ray1Geo,
    new THREE.LineDashedMaterial({ color: C1_COLOR, dashSize: 0.1, gapSize: 0.05 }),
  );
  const ray2Geo = new THREE.BufferGeometry();
  const ray2Line = new THREE.Line(
    ray2Geo,
    new THREE.LineDashedMaterial({ color: C2_COLOR, dashSize: 0.1, gapSize: 0.05 }),
  );
  scene.add(ray1Line, ray2Line);

  // ── World-space axes at grid corner ───────────────────────────────
  const axesHelper = new THREE.AxesHelper(1.0);
  axesHelper.position.copy(AXES_ORIGIN);
  scene.add(axesHelper);

  const AXIS_DEFS = [
    { label: '+X', offset: [1.15, 0,    0   ], color: '#BF616A' },
    { label: '+Y', offset: [0,    1.15, 0   ], color: '#A3BE8C' },
    { label: '+Z', offset: [0,    0,    1.15], color: '#88C0D0' },
  ];

  AXIS_DEFS.forEach(({ label, offset, color }) => {
    const div = document.createElement('div');
    div.textContent = label;
    div.style.cssText = `
      font: bold 10px/1 'JetBrains Mono', monospace;
      color: ${color};
      pointer-events: none;
    `;
    const obj = new CSS2DObject(div);
    obj.position.set(
      AXES_ORIGIN.x + offset[0],
      AXES_ORIGIN.y + offset[1],
      AXES_ORIGIN.z + offset[2],
    );
    scene.add(obj);
  });

  // ── Geometry update ───────────────────────────────────────────────
  function updateGeometry(s) {
    const [px, py, pz] = s.P;
    ptMesh.position.set(px, py, pz);

    const c1 = s.cam1.center;
    const c2 = s.cam2.center;

    const R1 = s.cam1.R || [1, 0, 0,  0, -1, 0,  0, 0, -1];
    frustumA.matrix.copy(new THREE.Matrix4().set(
      R1[0], R1[3], R1[6], c1[0],
      R1[1], R1[4], R1[7], c1[1],
      R1[2], R1[5], R1[8], c1[2],
      0,     0,     0,     1,
    ));
    frustumA.matrixAutoUpdate = false;

    const R = s.cam2.R || [1,0,0, 0,1,0, 0,0,1];
    frustumB.matrix.copy(new THREE.Matrix4().set(
      R[0], R[3], R[6], c2[0],
      R[1], R[4], R[7], c2[1],
      R[2], R[5], R[8], c2[2],
      0,    0,    0,    1,
    ));
    frustumB.matrixAutoUpdate = false;

    baselineGeo.setFromPoints([
      new THREE.Vector3(...c1),
      new THREE.Vector3(...c2),
    ]);

    const verts = new Float32Array([
      c1[0], c1[1], c1[2],
      c2[0], c2[1], c2[2],
      px,    py,    pz,
    ]);
    epPlaneGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    epPlaneGeo.setIndex([0, 1, 2]);
    epPlaneGeo.computeVertexNormals();

    ray1Geo.setFromPoints([new THREE.Vector3(...c1), new THREE.Vector3(px, py, pz)]);
    ray1Line.computeLineDistances();
    ray2Geo.setFromPoints([new THREE.Vector3(...c2), new THREE.Vector3(px, py, pz)]);
    ray2Line.computeLineDistances();
  }

  // ── Resize ────────────────────────────────────────────────────────
  function resize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  resize();

  // ── Render ────────────────────────────────────────────────────────
  function render(s) {
    updateGeometry(s);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  return { render, resize };
}
