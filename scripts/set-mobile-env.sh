#!/usr/bin/env bash
# Set mobile-app/.env for platform (Mac or PC). Run from project root.
cd "$(dirname "$0")/.."
node scripts/set-mobile-env.js
