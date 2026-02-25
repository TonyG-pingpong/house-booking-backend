#!/usr/bin/env bash
# Run House Booking mobile app on iOS Simulator (macOS only).
# Usage: ./scripts/run-ios-simulator.sh [target-name]
# Example: ./scripts/run-ios-simulator.sh "iPhone 15"
# Prereqs: Xcode, CocoaPods (usually via Xcode). Backend running. mobile-app/.env has VITE_API_URL=http://localhost:3000

set -e
cd "$(dirname "$0")/.."
SCRIPT_DIR="$(pwd)"

MOBILE_DIR="$SCRIPT_DIR/mobile-app"
if [[ ! -f "$MOBILE_DIR/package.json" ]]; then
  echo "Error: mobile-app not found. Run from repo root."
  exit 1
fi

if [[ "$(uname)" != "Darwin" ]]; then
  echo "iOS Simulator runs only on macOS. Use Android emulator on Windows/Linux."
  exit 1
fi

echo ""
echo "  ========================================"
echo "   House Booking - iOS Simulator"
echo "  ========================================"
echo ""

echo "  [1/3] Building mobile app..."
cd "$MOBILE_DIR"
npm run build

echo ""
echo "  [2/3] Syncing Capacitor..."
npx cap sync ios

echo ""
echo "  [3/3] Running on iOS Simulator..."
if [[ -n "$1" ]]; then
  npx cap run ios --target "$1"
else
  npx cap run ios
fi

cd "$SCRIPT_DIR"
echo ""
echo "  Done. App should be open in the simulator."
echo "  Backend: ensure running; mobile-app/.env: VITE_API_URL=http://localhost:3000"
echo ""
