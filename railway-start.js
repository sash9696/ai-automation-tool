const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AI Automation Tool on Railway...');

// Start backend service
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 3001 }
});

// Start AI service
const aiService = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'ai-service'),
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.AI_SERVICE_PORT || 3002 }
});

// Start scheduler service
const scheduler = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'scheduler'),
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.SCHEDULER_PORT || 3003 }
});

// Start frontend (serve built files)
const frontend = spawn('npx', ['serve', '-s', 'frontend/dist', '-l', process.env.FRONTEND_PORT || 3000], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down services...');
  backend.kill();
  aiService.kill();
  scheduler.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down services...');
  backend.kill();
  aiService.kill();
  scheduler.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ All services started successfully!');
console.log(`🌐 Frontend: http://localhost:${process.env.FRONTEND_PORT || 3000}`);
console.log(`🔧 Backend: http://localhost:${process.env.PORT || 3001}`);
console.log(`🤖 AI Service: http://localhost:${process.env.AI_SERVICE_PORT || 3002}`);
console.log(`⏰ Scheduler: http://localhost:${process.env.SCHEDULER_PORT || 3003}`); 