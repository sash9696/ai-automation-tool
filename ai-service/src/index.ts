import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? ['https://yourdomain.com'] 
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
    message: 'LinkedIn AI Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Mock AI post generation endpoint
app.post('/api/generate-post', (req, res) => {
  const { topic, tone = 'professional', includeHashtags = true, includeCTA = true } = req.body;
  
  // Mock AI generation
  const mockPosts = {
    fullstack: '🔥 Full Stack Development Tip: Always use environment variables for configuration! I just saved myself from a major security breach by moving API keys to .env files. Remember: never commit secrets to your repo! #FullStack #Security #WebDev',
    dsa: '🧮 DSA Challenge: Can you solve this in O(n) time? Given an array, find the first non-repeating element. This is a classic interview question that tests your understanding of hash maps! #DSA #Algorithms #InterviewPrep',
    interview: '🎯 Interview Tip: Always start with the brute force solution! I used to jump straight to optimization, but interviewers want to see your problem-solving process. Here\'s how I approach coding questions... #InterviewPrep #Coding #Career',
    placement: '🎓 Placement Success Story: Just landed my dream job at a top tech company! The key was consistent practice and building real projects. Here are the 3 things that made the difference... #Placement #Career #Success'
  };
  
  const content = mockPosts[topic as keyof typeof mockPosts] || mockPosts.fullstack;
  
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      content,
      topic,
      tone,
      includeHashtags,
      includeCTA,
      createdAt: new Date().toISOString(),
    },
    message: 'Post generated successfully'
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
  console.log(`🤖 LinkedIn AI Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app; 