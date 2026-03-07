#!/usr/bin/env node
/**
 * Cross-platform starter for Stay & Book: frees ports 3000 and 5173, then runs backend + frontend.
 * Run from project root: node scripts/start.js
 * Or use start.bat (Windows) / start.sh (Mac, Linux).
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const ports = [3000, 5173];

function killPort(port) {
  try {
    if (isWindows) {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' }
      );
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
        stdio: 'ignore',
        shell: true,
      });
    }
  } catch (_) {
    // Ignore errors (e.g. no process on port)
  }
}

console.log('');
console.log('  ========================================');
console.log('   Stay & Book - Backend + Frontend');
console.log('  ========================================');
console.log('');
console.log('  Platform: ' + (isWindows ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux'));
console.log('');
console.log('  Stopping any existing backend (3000) and frontend (5173)...');
ports.forEach(killPort);
console.log('  Starting backend + frontend...');
console.log('');
console.log('  Backend:   http://localhost:3000');
console.log('  Frontend:  http://localhost:5173');
console.log('  Open in browser:  http://localhost:5173');
console.log('  Mobile app:  cd mobile-app, then npm run dev  →  http://localhost:5174');
console.log('  See docs/STARTING-THE-APPS.md for full guide.');
console.log('');
console.log('  Press Ctrl+C to stop both.');
console.log('  ========================================');
console.log('');

const child = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'start:all'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: !isWindows,
});

child.on('exit', (code) => process.exit(code != null ? code : 0));
