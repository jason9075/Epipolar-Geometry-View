import { epipolarConstraint } from './math.js';

const FMT = (v) => (v === null || v === undefined ? '—' : v.toFixed(4));

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function renderMat3(el, M) {
  if (!M) { el.innerHTML = '<span class="na">N/A</span>'; return; }
  const rows = [0, 1, 2].map((r) =>
    `<tr>${[0,1,2].map((c) => `<td>${FMT(M[r*3+c])}</td>`).join('')}</tr>`
  );
  el.innerHTML = `<table class="mat3"><tbody>${rows.join('')}</tbody></table>`;
  flash(el);
}

function renderVec3(el, v) {
  if (!v) { el.innerHTML = '<span class="na">N/A</span>'; return; }
  el.innerHTML = `<table class="mat3"><tbody>${v.map((x) => `<tr><td>${FMT(x)}</td></tr>`).join('')}</tbody></table>`;
  flash(el);
}

export function initMatrixPanel() {
  const elR = document.getElementById('matrix-R');
  const elT = document.getElementById('vec-t');
  const elE = document.getElementById('matrix-E');
  const elF = document.getElementById('matrix-F');
  const elConstraint = document.getElementById('constraint-val');
  const elWarn = document.getElementById('degenerate-warn');

  function update(s) {
    renderMat3(elR, s.R);
    renderVec3(elT, s.t);
    renderMat3(elE, s.E);
    renderMat3(elF, s.F);

    if (s.degenerate) {
      elWarn.hidden = false;
      elConstraint.textContent = '—';
    } else {
      elWarn.hidden = true;
      if (s.F && s.p1 && s.p2) {
        const val = epipolarConstraint(s.F, s.p1, s.p2);
        elConstraint.textContent = val.toExponential(3);
        flash(elConstraint);
      } else {
        elConstraint.textContent = '—';
      }
    }
  }

  return { update };
}
