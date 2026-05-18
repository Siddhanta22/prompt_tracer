#!/usr/bin/env bash
# Build a Chrome Web Store upload ZIP (extension runtime files only).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(python3 -c "import json; print(json.load(open('$ROOT/manifest.json'))['version'])")"
OUT="$ROOT/prompt-tracer-v${VERSION}.zip"

cd "$ROOT"
rm -f "$OUT"

zip -r "$OUT" \
  manifest.json \
  background.js \
  content.js \
  popup.html \
  popup.js \
  chart.js \
  interactive-tutorial.js \
  icons/ \
  -x "*.DS_Store" "*/.*"

echo "Created: $OUT"
echo "Size: $(du -h "$OUT" | cut -f1)"
echo ""
echo "Upload this file at: https://chrome.google.com/webstore/devconsole"
