#!/usr/bin/env node
/**
 * Set mobile-app/.env for the running platform (Mac or PC).
 * Prompts for platform and writes the appropriate VITE_API_URL.
 * Run from project root: node scripts/set-mobile-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MOBILE_DIR = path.join(PROJECT_ROOT, 'mobile-app');
const ENV_FILE = path.join(MOBILE_DIR, '.env');
const ENV_EXAMPLE = path.join(MOBILE_DIR, '.env.example');

const DEFAULTS = {
  mac: 'http://localhost:3000',
  pc: 'http://10.0.2.2:3000',
};

function ensureMobileApp() {
  const pkg = path.join(MOBILE_DIR, 'package.json');
  if (!fs.existsSync(pkg)) {
    console.error('Error: mobile-app not found. Run from project root.');
    process.exit(1);
  }
}

function ensureEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    if (fs.existsSync(ENV_EXAMPLE)) {
      fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
      console.log('Created mobile-app/.env from .env.example');
    } else {
      fs.writeFileSync(ENV_FILE, `# Backend API URL\nVITE_API_URL=${DEFAULTS.mac}\n`, 'utf8');
      console.log('Created mobile-app/.env');
    }
  }
}

function readEnvContent() {
  return fs.readFileSync(ENV_FILE, 'utf8');
}

function writeEnvWithViteApiUrl(url) {
  let content = readEnvContent();
  const line = `VITE_API_URL=${url}`;
  if (/^VITE_API_URL=/m.test(content)) {
    content = content.replace(/^VITE_API_URL=.*/m, line);
  } else {
    content = content.trimEnd() + (content.endsWith('\n') ? '' : '\n') + line + '\n';
  }
  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

function ask(rl, question, defaultAnswer) {
  const suffix = defaultAnswer ? ` [${defaultAnswer}]` : '';
  return new Promise((resolve) => {
    rl.question(question + suffix + ': ', (answer) => {
      resolve(typeof answer === 'string' && answer.trim() !== '' ? answer.trim() : defaultAnswer);
    });
  });
}

async function main() {
  console.log('');
  console.log('  ========================================');
  console.log('   Set mobile-app/.env for platform');
  console.log('  ========================================');
  console.log('');

  ensureMobileApp();
  ensureEnvFile();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('  Where is the mobile app running?');
  console.log('    1) Mac  (iOS Simulator)  → VITE_API_URL = http://localhost:3000');
  console.log('    2) PC   (Android emulator) → VITE_API_URL = http://10.0.2.2:3000');
  console.log('');

  const choice = await ask(rl, '  Enter 1 or 2', '1');

  let url;
  if (choice === '2') {
    url = DEFAULTS.pc;
    console.log('');
    console.log('  Using PC (Android): backend on this machine → 10.0.2.2:3000');
  } else {
    url = DEFAULTS.mac;
    console.log('');
    console.log('  Using Mac (iOS): backend on same Mac → localhost:3000');
  }

  const custom = await ask(
    rl,
    '  Backend on another machine? Enter URL (e.g. http://192.168.1.50:3000) or press Enter to keep above',
    ''
  );

  rl.close();

  if (custom) {
    url = custom.startsWith('http') ? custom : `http://${custom}`;
    if (!url.includes('://')) url = 'http://' + url;
    console.log('  Using custom URL:', url);
  }

  writeEnvWithViteApiUrl(url);
  console.log('');
  console.log('  Updated mobile-app/.env with:');
  console.log('    VITE_API_URL=' + url);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
