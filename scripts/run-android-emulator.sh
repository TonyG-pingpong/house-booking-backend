#!/usr/bin/env bash
# Run House Booking mobile app on Android emulator (macOS/Linux).
# Usage: ./scripts/run-android-emulator.sh
# Prereqs: Android Studio, one AVD created. Backend running. mobile-app/.env has VITE_API_URL=http://10.0.2.2:3000 for emulator.

set -e
cd "$(dirname "$0")/.."
SCRIPT_DIR="$(pwd)"

MOBILE_DIR="$SCRIPT_DIR/mobile-app"
if [[ ! -f "$MOBILE_DIR/package.json" ]]; then
  echo "Error: mobile-app not found. Run from repo root."
  exit 1
fi

# ANDROID_HOME
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
EMULATOR="$ANDROID_HOME/emulator/emulator"
ADB="$ANDROID_HOME/platform-tools/adb"

if [[ ! -x "$EMULATOR" ]]; then
  echo "Android SDK/emulator not found at $ANDROID_HOME"
  echo "Install Android Studio and create an AVD in Device Manager."
  exit 1
fi

echo ""
echo "  ========================================"
echo "   House Booking - Android Emulator"
echo "  ========================================"
echo ""

echo "  [1/5] Building mobile app..."
cd "$MOBILE_DIR"
npm run build

echo ""
echo "  [2/5] Syncing Capacitor..."
npx cap sync android

echo ""
echo "  [3/5] Checking emulator..."
if ! "$ADB" devices | grep -q "emulator-"; then
  echo "  No emulator running. Starting first AVD..."
  AVD=$("$EMULATOR" -list-avds 2>/dev/null | head -1)
  if [[ -z "$AVD" ]]; then
    echo "  No AVD found. Create one in Android Studio -> Device Manager, then run this script again."
    exit 1
  fi
  "$EMULATOR" -avd "$AVD" &
  echo "  Waiting for emulator to boot (up to 60s)..."
  "$ADB" wait-for-device
  sleep 15
else
  echo "  Emulator already running."
fi

echo ""
echo "  [4/5] Installing app on emulator..."
cd "$MOBILE_DIR/android"
./gradlew installDebug

echo ""
echo "  [5/5] Launching House Booking..."
"$ADB" shell am start -n com.getcapacitor.app/com.getcapacitor.myapp.MainActivity

cd "$SCRIPT_DIR"
echo ""
echo "  Done. App should be open on the emulator."
echo "  Backend: ensure running; mobile-app/.env: VITE_API_URL=http://10.0.2.2:3000"
echo ""
