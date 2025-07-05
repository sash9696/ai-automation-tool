import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import postsRoutes from './routes/posts.js';
import linkedInRoutes from './routes/linkedin.js';
import settingsRoutes from './routes/settings.js';
import premiumRoutes from './routes/premium.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './utils/logger.js';

// Import background worker
import backgroundWorker from './services/backgroundWorker.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://ai-automation-tool-2.onrender.com',
    'https://ai-automation-tool.onrender.com'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/posts', postsRoutes);
app.use('/api/linkedin', linkedInRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/premium', premiumRoutes);

// Mock endpoints for development
if (process.env.NODE_ENV === 'development') {
  // Mock post generation endpoint
  app.post('/api/mock/generate', (req, res) => {
    const { topic, tone = 'professional' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const mockContent = `🎯 ${topic}: Here's an insightful perspective on ${topic.toLowerCase()}. The key is to focus on practical applications and real-world impact. #${topic.replace(/\s+/g, '')} #Innovation #Leadership`;
    
    const mockPost = {
      id: Date.now().toString(),
      content: mockContent,
      topic,
      tone,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: mockPost,
      message: 'Mock post generated successfully'
    });
  });

  // Mock post publishing endpoint
  app.post('/api/mock/publish/:id', (req, res) => {
    const { id } = req.params;
    
    res.json({
      success: true,
      data: {
        id,
        status: 'published',
        publishedAt: new Date(),
        message: 'Mock post published successfully'
      }
    });
  });
}

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 LinkedIn AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  // Start background worker for scheduled posts
  backgroundWorker.start();
  console.log('🔄 Background worker started for scheduled posts');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  backgroundWorker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  backgroundWorker.stop();
  process.exit(0);
});

export default app; 