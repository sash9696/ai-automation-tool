import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3003;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? ['https://ai-automation-frontend.onrender.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LinkedIn Scheduler Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Mock scheduling endpoints
app.post('/api/schedule-post', (req, res) => {
  const { postId, scheduledTime, platform = 'linkedin' } = req.body;
  
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      postId,
      scheduledTime,
      platform,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
    message: 'Post scheduled successfully'
  });
});

app.get('/api/scheduled-posts', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        postId: 'post-1',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        platform: 'linkedin',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      }
    ]
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⏰ LinkedIn Scheduler Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app; 