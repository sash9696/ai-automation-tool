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

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './utils/logger.js';

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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 LinkedIn AI Backend server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV === 'development') {
    logger.info(`🧪 Development mode enabled`);
    logger.info(`🔧 Mock endpoints available at /api/mock/*`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 