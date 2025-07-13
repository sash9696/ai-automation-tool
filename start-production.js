#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting LinkedIn AI Automation Tool in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the backend service
const backendProcess = spawn('node', ['src/index.js'], {
  cwd: join(__dirname, 'backend'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3001
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Backend process error:', error);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  console.log(`🛑 Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  backendProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  backendProcess.kill('SIGINT');
}); 