set shell := ["sh", "-c"]

default: dev

install:
  npm install --ignore-scripts

dev:
  @[ -d node_modules ] || npm install --ignore-scripts
  @echo "\033[36m[epipolar] Starting Vite dev server...\033[0m"
  node --require ./scripts/fix-noexec.cjs ./node_modules/vite/bin/vite.js --port 8080

build:
  @[ -d node_modules ] || npm install --ignore-scripts
  node --require ./scripts/fix-noexec.cjs ./node_modules/vite/bin/vite.js build

preview: build
  node --require ./scripts/fix-noexec.cjs ./node_modules/vite/bin/vite.js preview --port 8080

clean:
  rm -rf dist node_modules
