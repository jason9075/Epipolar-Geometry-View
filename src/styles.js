export function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
:root {
  --n0:#2E3440; --n1:#3B4252; --n2:#434C5E; --n3:#4C566A;
  --n4:#D8DEE9; --n5:#E5E9F0; --n6:#ECEFF4;
  --n7:#8FBCBB; --n8:#88C0D0; --n9:#81A1C1; --n10:#5E81AC;
  --n11:#BF616A; --n12:#D08770; --n13:#EBCB8B;
  --n14:#A3BE8C; --n15:#B48EAD;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;overflow:hidden;}
body{
  background:var(--n0);color:var(--n4);
  font-family:'JetBrains Mono',ui-monospace,monospace;
  font-size:13px;display:flex;flex-direction:column;
}
input[type=range]{accent-color:var(--n8);width:100%;}
button{
  border:1px solid var(--n3);border-radius:6px;
  background:var(--n2);color:var(--n6);
  padding:0.35rem 0.75rem;cursor:pointer;font:inherit;
}
button:hover{background:var(--n3);}

/* ── Header ── */
#app-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:0.5rem 1rem;border-bottom:1px solid var(--n3);
  background:var(--n1);z-index:10;flex-shrink:0;
}
#app-title{color:var(--n8);font-weight:700;letter-spacing:.03em;}
.icon-button{font-size:1.2rem;border:none;background:none;padding:0.25rem;}

/* ── Main layout ── */
#app-layout{
  display:grid;
  grid-template-columns:220px 1fr 240px;
  flex:1;min-height:0;overflow:hidden;
}

/* ── Sidebars ── */
#control-panel,#math-panel{
  background:var(--n1);overflow-y:auto;padding:0.75rem;
  display:flex;flex-direction:column;gap:0.5rem;
  border-right:1px solid var(--n3);
}
#math-panel{border-right:none;border-left:1px solid var(--n3);}

.panel-section{
  background:var(--n2);border-radius:8px;padding:0.6rem 0.75rem;
  display:flex;flex-direction:column;gap:0.35rem;
}
.panel-section h3{
  color:var(--n8);font-size:0.72rem;text-transform:uppercase;
  letter-spacing:.08em;margin-bottom:0.15rem;
}
.panel-section label{
  display:flex;flex-direction:column;gap:0.15rem;color:var(--n5);
  font-size:0.78rem;
}
.val-display{color:var(--n13);font-size:0.78rem;}

.preset-btn{width:100%;margin-top:0.2rem;font-size:0.78rem;text-align:left;}
.checkbox-label{display:flex;flex-direction:row!important;align-items:center;gap:0.5rem;}

/* ── Centre viz ── */
#viz-center{
  display:flex;flex-direction:column;min-height:0;background:var(--n0);
}
#view3d-wrap{
  flex:1;min-height:0;position:relative;
}
#view3d-wrap canvas{width:100%;height:100%;display:block;}

#views2d{
  display:grid;grid-template-columns:1fr 1fr;
  height:220px;border-top:1px solid var(--n3);
}
.view2d-wrap{position:relative;min-width:0;}
.view2d-wrap canvas{width:100%;height:100%;display:block;cursor:crosshair;}
.view2d-wrap+.view2d-wrap{border-left:1px solid var(--n3);}

.view-label{
  position:absolute;top:6px;left:8px;
  font-size:0.72rem;color:var(--n4);
  background:rgba(46,52,64,.7);padding:1px 6px;border-radius:4px;
  pointer-events:none;z-index:2;
}
.cam1-color{color:var(--n8);}
.cam2-color{color:var(--n9);}

/* ── Matrix display ── */
.matrix-display{overflow-x:auto;}
table.mat3{border-collapse:collapse;width:100%;font-size:0.72rem;}
table.mat3 td{
  padding:2px 4px;text-align:right;color:var(--n5);
  border:1px solid var(--n3);font-variant-numeric:tabular-nums;
}
.na{color:var(--n3);font-style:italic;}

/* Flash animation for updated values */
@keyframes flash-bg{0%{background:rgba(235,203,139,.25);}100%{background:transparent;}}
.flash{animation:flash-bg 0.6s ease-out;}

/* Constraint box */
.constraint-box{
  font-size:0.82rem;color:var(--n13);padding:0.4rem;
  background:var(--n1);border-radius:6px;
  font-variant-numeric:tabular-nums;
}
.warn-box{
  font-size:0.78rem;color:var(--n11);background:rgba(191,97,106,.15);
  border:1px solid var(--n11);border-radius:6px;padding:0.4rem;
}

/* ── Modal ── */
#math-modal[hidden]{display:none;}
#math-modal{
  position:fixed;inset:0;display:grid;place-items:center;
  background:rgba(46,52,64,.82);z-index:50;
}
.modal-panel{
  width:min(760px,calc(100vw - 2rem));max-height:calc(100vh - 2rem);
  overflow:auto;background:var(--n1);
  border:1px solid var(--n3);border-radius:16px;
  box-shadow:0 24px 64px rgba(0,0,0,.4);padding:1.25rem;
}
.modal-header{
  display:flex;justify-content:space-between;align-items:center;
  gap:1rem;margin-bottom:1rem;
}
.modal-header h2{font-size:1rem;color:var(--n8);}
.modal-actions{display:flex;gap:0.5rem;}
.modal-toggle{border-radius:999px;padding:0.3rem 0.85rem;}

.modal-body{display:grid;gap:0.9rem;line-height:1.75;color:var(--n5);}
.modal-body h3{color:var(--n8);font-size:0.85rem;margin-top:0.25rem;}
.modal-body p{font-size:0.84rem;}
.modal-body pre[class*="language-"]{
  border-radius:8px;overflow-x:auto;font-size:0.78rem;margin:0;
}

/* KaTeX overrides for dark theme */
.katex{color:var(--n6);}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--n1);}
::-webkit-scrollbar-thumb{background:var(--n3);border-radius:3px;}
`;
  document.head.appendChild(style);
}
