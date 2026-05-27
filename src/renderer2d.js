/**
 * 2D camera image plane renderer using Canvas 2D API.
 * Draws projected point, epipole, and epipolar line.
 */

const COLORS = {
  bg: '#2E3440',
  cam1: '#88C0D0',
  cam2: '#81A1C1',
  point: '#EBCB8B',
  epipole: '#D08770',
  grid: '#3B4252',
  trail1: 'rgba(136,192,208,0.45)',
  trail2: 'rgba(129,161,193,0.45)',
};

/** Draw epipolar line from coefficients [a,b,c]: ax+by+c=0 (image coords) */
function drawEpipolarLine(ctx, line, halfW, halfH, color, thick = false) {
  if (!line) return;
  const [a, b, c] = line;
  ctx.strokeStyle = color;
  ctx.lineWidth = thick ? 3 : 1.5;
  ctx.setLineDash([]);

  ctx.beginPath();
  if (Math.abs(b) > Math.abs(a)) {
    // solve for x at y edges
    const y0 = -halfH, y1 = halfH;
    const x0 = (-c - b * y0) / a;
    const x1 = (-c - b * y1) / a;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  } else {
    const x0 = -halfW, x1 = halfW;
    const y0 = (-c - a * x0) / b;
    const y1 = (-c - a * x1) / b;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPoint(ctx, u, v, color, radius = 6) {
  ctx.beginPath();
  ctx.arc(u, v, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ECEFF4';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGrid(ctx, halfW, halfH, step = 50) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.5;
  for (let x = -halfW; x <= halfW; x += step) {
    ctx.beginPath(); ctx.moveTo(x, -halfH); ctx.lineTo(x, halfH); ctx.stroke();
  }
  for (let y = -halfH; y <= halfH; y += step) {
    ctx.beginPath(); ctx.moveTo(-halfW, y); ctx.lineTo(halfW, y); ctx.stroke();
  }
  // axes
  ctx.strokeStyle = '#4C566A';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-halfW, 0); ctx.lineTo(halfW, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -halfH); ctx.lineTo(0, halfH); ctx.stroke();
}

function drawEpipole(ctx, halfW, halfH, F, color, isCam1) {
  // Epipole: null space of F (or F^T for cam1)
  // Approximate: e = centre of intersection lines — skipped for now.
  // Instead, compute e from baseline projection — handled by caller via state.
}

export function init2DRenderers(canvas1, canvas2, stateRef) {
  const canvases = [canvas1, canvas2];
  let hoverActiveCam = null; // null | 1 | 2

  function resize() {
    canvases.forEach((c) => {
      const wrap = c.parentElement;
      if (!wrap) return;
      c.width = wrap.clientWidth;
      c.height = wrap.clientHeight;
    });
  }

  window.addEventListener('resize', resize);
  resize();

  function render(s) {
    renderCam(canvas1, s, 1);
    renderCam(canvas2, s, 2);
  }

  function renderCam(canvas, s, camIdx) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const hw = W / 2;
    const hh = H / 2;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(hw, hh);
    // No Y-flip needed: cam1.R = Rx180 already negates camera-Y relative to world-Y,
    // so v < 0 naturally means above-center in canvas coords (y increases downward).

    drawGrid(ctx, hw, hh, 50);

    const isHoverOpposite = (camIdx === 1 && hoverActiveCam === 2) ||
                             (camIdx === 2 && hoverActiveCam === 1);

    // Draw trail
    if (s.trailEnabled && s.trail.length > 0) {
      const trailColor = camIdx === 1 ? COLORS.trail1 : COLORS.trail2;
      ctx.fillStyle = trailColor;
      s.trail.forEach((pt) => {
        const p = camIdx === 1 ? pt.p1 : pt.p2;
        if (!p) return;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw epipolar line
    const line = camIdx === 1 ? s.l1 : s.l2;
    const lineColor = camIdx === 1 ? COLORS.cam1 : COLORS.cam2;
    if (line && !s.degenerate) {
      drawEpipolarLine(ctx, line, hw, hh, lineColor, isHoverOpposite);
    }

    // Draw projected point
    const p = camIdx === 1 ? s.p1 : s.p2;
    if (p) {
      drawPoint(ctx, p[0], p[1], COLORS.point);
    }

    ctx.restore();

    // Labels (outside transform)
    ctx.fillStyle = camIdx === 1 ? COLORS.cam1 : COLORS.cam2;
    ctx.font = '11px monospace';
    if (p) {
      ctx.fillText(`p${camIdx} = (${p[0].toFixed(1)}, ${p[1].toFixed(1)})`, 8, H - 8);
    }
  }

  // Hover synchronization: hovering on cam1 highlights epipolar line on cam2 and vice versa
  function setupHover(canvas, camIdx) {
    canvas.addEventListener('mouseenter', () => {
      hoverActiveCam = camIdx;
    });
    canvas.addEventListener('mouseleave', () => {
      hoverActiveCam = null;
    });
  }

  setupHover(canvas1, 1);
  setupHover(canvas2, 2);

  return { render, resize };
}
