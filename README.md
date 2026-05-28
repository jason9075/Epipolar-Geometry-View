# Epipolar Geometry Sandbox

An interactive, browser-based visualizer for epipolar geometry — designed to build intuition around the Essential Matrix **E**, the Fundamental Matrix **F**, and the epipolar constraint.

**Live demo:** https://jason9075.github.io/Epipolar-Geometry-View/

---

## Features

- **3D Global View** — orbit-controllable Three.js scene showing both camera frustums, the baseline, and the epipolar plane
- **Dual 2D Image Planes** — real-time projected point and epipolar line for each camera
- **Interactive Controls** — drag sliders to move the scene point, reposition Camera 2 (X/Y/Z), and apply yaw/pitch/roll rotation
- **Swap Cameras** — instantly exchange Camera 1 and Camera 2 poses
- **Matrix Panel** — live display of R, t, E, F and the epipolar constraint value `p₂ᵀ F p₁`
- **Presets** — Standard Stereo, Forward Motion, Pure Rotation
- **Trail Mode** — trace the epipolar line pencil as the scene point moves
- **Math Modal** — 💡 button opens a KaTeX-rendered explanation of the underlying math, with Eng/中文 language toggle

---

## Math Overview

Given two calibrated cameras with rotation **R** and translation **t**:

```
E = [t]× R          (Essential Matrix)
F = K₂⁻ᵀ E K₁⁻¹   (Fundamental Matrix)
```

The epipolar constraint guarantees that for any true correspondence (p₁, p₂):

```
p₂ᵀ F p₁ = 0
```

The epipolar line in Camera 2's image for a point p₁ observed in Camera 1 is:

```
l₂ = F p₁
```

---

## Controls

| Control | Description |
|---|---|
| **Scene Point P** (X/Y/Z) | Move the 3D point |
| **Camera 2 Pose** (X/Y/Z) | Translate Camera 2 in world space |
| **Camera 2 Rotation** (Yaw/Pitch/Roll) | Rotate Camera 2 |
| **Focal Length** | Adjust shared focal length (px) |
| **⇄ Swap Cam 1 / Cam 2** | Exchange the two camera poses |
| **Presets** | Load a preconfigured scenario |
| **Show Pencil Trail** | Trace epipolar lines as P moves |
| **💡** | Open math explanation modal |

---

## Tech Stack

- [Three.js](https://threejs.org/) — 3D rendering and orbit controls
- [KaTeX](https://katex.org/) — math formula rendering
- [Prism.js](https://prismjs.com/) — syntax highlighting (Nord theme)
- [Vite](https://vitejs.dev/) — dev server and bundler

---

## Local Development

Requires [Nix](https://nixos.org/) with flakes enabled (or Node.js 22+).

```sh
# Enter dev shell (NixOS / nix develop)
nix develop

# Install dependencies
just install

# Start dev server at http://localhost:8080
just dev

# Production build → dist/
just build
```

---

## License

MIT
