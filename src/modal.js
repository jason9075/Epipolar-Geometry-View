import renderMathInElement from 'katex/dist/contrib/auto-render.js';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';

const CONTENT = {
  en: `
<p>Epipolar geometry describes the geometric relationship between two cameras observing the same 3D scene.
Given a point $p_1$ in Camera 1's image, the corresponding point $p_2$ in Camera 2 is constrained
to lie on the <strong>epipolar line</strong> $l_2$.</p>

<h3>Essential Matrix</h3>
<p>The Essential Matrix $E$ encodes the relative rotation $R$ and translation $t$ between two calibrated cameras:</p>
<p>$$E = [t]_{\\times} R$$</p>
<p>where $[t]_{\\times}$ is the skew-symmetric matrix of $t$:
$$[t]_{\\times} = \\begin{bmatrix} 0 & -t_z & t_y \\\\ t_z & 0 & -t_x \\\\ -t_y & t_x & 0 \\end{bmatrix}$$</p>

<h3>Fundamental Matrix</h3>
<p>For uncalibrated cameras with intrinsic matrix $K$, the Fundamental Matrix $F$ is:</p>
<p>$$F = K_2^{-T} E K_1^{-1}$$</p>

<h3>Epipolar Constraint</h3>
<p>The core algebraic constraint — any correct correspondence must satisfy:</p>
<p>$$p_2^T F p_1 = 0$$</p>
<p>This is verified live in the right panel. Small floating-point errors give values near $10^{-14}$.</p>

<h3>Epipolar Line</h3>
<p>Given $p_1$ in homogeneous image coordinates, the corresponding epipolar line in Camera 2 is:</p>
<p>$$l_2 = F p_1, \\quad \\text{where } l_2 = [a, b, c]^T \\text{ defines } au + bv + c = 0$$</p>

<pre><code class="language-js">// Compute epipolar line from fundamental matrix
function epipolarLine(F, p1) {
  return [
    F[0]*p1[0] + F[1]*p1[1] + F[2],
    F[3]*p1[0] + F[4]*p1[1] + F[5],
    F[6]*p1[0] + F[7]*p1[1] + F[8],
  ];
}

// Constraint check: should be ~0
function check(F, p1, p2) {
  const l = epipolarLine(F, p1);
  return l[0]*p2[0] + l[1]*p2[1] + l[2];
}</code></pre>

<h3>Degenerate Case: Pure Rotation</h3>
<p>When $t = 0$ (no translation), $E = [0]_{\\times} R = 0$, so the Essential Matrix is zero and
epipolar geometry is undefined — there is no unique epipolar plane.</p>
`,
  zhTW: `
<p>對極幾何描述兩台相機觀測同一 3D 場景時的幾何關係。
給定相機 1 中的點 $p_1$，相機 2 中對應的點 $p_2$ 必然落在<strong>對極線</strong> $l_2$ 上。</p>

<h3>本質矩陣（Essential Matrix）</h3>
<p>本質矩陣 $E$ 編碼了兩台已校準相機之間的相對旋轉 $R$ 與平移 $t$：</p>
<p>$$E = [t]_{\\times} R$$</p>
<p>其中 $[t]_{\\times}$ 是 $t$ 的反對稱矩陣（skew-symmetric matrix）：
$$[t]_{\\times} = \\begin{bmatrix} 0 & -t_z & t_y \\\\ t_z & 0 & -t_x \\\\ -t_y & t_x & 0 \\end{bmatrix}$$</p>

<h3>基礎矩陣（Fundamental Matrix）</h3>
<p>對於未校準相機（含內參矩陣 $K$），基礎矩陣 $F$ 定義為：</p>
<p>$$F = K_2^{-T} E K_1^{-1}$$</p>

<h3>對極約束</h3>
<p>核心代數約束——任何正確的對應點對必須滿足：</p>
<p>$$p_2^T F p_1 = 0$$</p>
<p>右欄即時驗證此約束。浮點誤差下，正確對應點的計算值會趨近 $10^{-14}$。</p>

<h3>對極線</h3>
<p>給定以齊次座標表示的 $p_1$，在相機 2 中對應的對極線為：</p>
<p>$$l_2 = F p_1, \\quad \\text{其中 } l_2 = [a, b, c]^T \\text{ 定義直線 } au + bv + c = 0$$</p>

<pre><code class="language-js">// 從基礎矩陣計算對極線
function epipolarLine(F, p1) {
  return [
    F[0]*p1[0] + F[1]*p1[1] + F[2],
    F[3]*p1[0] + F[4]*p1[1] + F[5],
    F[6]*p1[0] + F[7]*p1[1] + F[8],
  ];
}

// 約束驗證：應趨近 0
function check(F, p1, p2) {
  const l = epipolarLine(F, p1);
  return l[0]*p2[0] + l[1]*p2[1] + l[2];
}</code></pre>

<h3>退化情形：純旋轉</h3>
<p>當 $t = 0$（無平移）時，$E = [0]_{\\times} R = 0$，本質矩陣為零矩陣，
對極幾何因此無法定義——不存在唯一的對極平面。</p>
`,
};

export function initModal() {
  const modal = document.getElementById('math-modal');
  const content = document.getElementById('math-content');
  const openBtn = document.getElementById('open-math');
  const closeBtn = document.getElementById('close-math');
  const langBtn = document.getElementById('language-toggle');
  let lang = 'en';

  function renderContent() {
    content.innerHTML = CONTENT[lang];
    renderMathInElement(content, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
    Prism.highlightAllUnder(content);
  }

  openBtn.addEventListener('click', () => {
    renderContent();
    modal.hidden = false;
  });

  closeBtn.addEventListener('click', () => { modal.hidden = true; });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  langBtn.addEventListener('click', () => {
    lang = lang === 'en' ? 'zhTW' : 'en';
    renderContent();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.hidden = true;
  });
}
