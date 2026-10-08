#!/usr/bin/env bash
# RUNTAINER one-line installer — safe for complete beginners.
# Usage: ./install.sh
set -euo pipefail

echo ""
echo "  RUNTAINER installer"
echo "  ==================="

# 1) Node.js check
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Node.js 20+ is required but was not found."
  echo "  Install it from https://nodejs.org/ (LTS) or via your package manager:"
  echo "    Ubuntu/Debian:  sudo apt install nodejs npm"
  echo "    Fedora:         sudo dnf install nodejs"
  exit 1
fi
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "  Node.js 20+ required (found $(node -v)). Please upgrade: https://nodejs.org/"
  exit 1
fi
echo "  [ok] Node.js $(node -v)"

# 2) Docker check (optional — demo mode without it)
if command -v docker >/dev/null 2>&1 && [ -S /var/run/docker.sock ]; then
  echo "  [ok] Docker found — RUNTAINER will manage live containers"
else
  echo "  [!!] Docker not found — RUNTAINER will start in demo mode."
  echo "       Install Docker later (https://docs.docker.com/get-docker/) and restart to go live."
fi

# 3) Install dependencies
echo ""
echo "  Installing dependencies (first run may take a minute)..."
npm install --no-audit --no-fund

# 4) Build the UI
echo "  Building the interface..."
npm run build

# 5) Launch
echo ""
echo "  Done! Starting RUNTAINER on http://localhost:${PORT:-3000}"
echo "  (Ctrl+C to stop — next time just run: npm start)"
echo ""
npm start
