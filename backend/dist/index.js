"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const linkedin_1 = __importDefault(require("./routes/linkedin"));
const posts_1 = __importDefault(require("./routes/posts"));
const settings_1 = __importDefault(require("./routes/settings"));
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['NODE_ENV'] === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined'));
app.use('/api/linkedin', linkedin_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/settings', settings_1.default);
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'LinkedIn AI Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
    });
});
app.get('/api/posts', (_req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: '1',
                content: '🚀 Just discovered an amazing React optimization technique! Using React.memo() can significantly improve performance by preventing unnecessary re-renders. Here\'s what I learned... #React #WebDevelopment #Performance',
                topic: 'fullstack',
                status: 'published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                analytics: {
                    views: 1250,
                    likes: 89,
                    comments: 12,
                    shares: 5,
                    engagementRate: 8.5
                }
            },
            {
                id: '2',
                content: '💡 DSA Tip: When solving tree problems, always consider both DFS and BFS approaches. DFS is great for path problems, while BFS excels at level-order traversal. What\'s your favorite tree traversal method? #DSA #Algorithms #Coding',
                topic: 'dsa',
                status: 'scheduled',
                scheduledTime: new Date(Date.now() + 86400000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ]
    });
});
app.post('/api/posts/generate', (req, res) => {
    const { topic } = req.body;
    const mockPosts = {
        fullstack: '🔥 Full Stack Development Tip: Always use environment variables for configuration! I just saved myself from a major security breach by moving API keys to .env files. Remember: never commit secrets to your repo! #FullStack #Security #WebDev',
        dsa: '🧮 DSA Challenge: Can you solve this in O(n) time? Given an array, find the first non-repeating element. This is a classic interview question that tests your understanding of hash maps! #DSA #Algorithms #InterviewPrep',
        interview: '🎯 Interview Tip: Always start with the brute force solution! I used to jump straight to optimization, but interviewers want to see your problem-solving process. Here\'s how I approach coding questions... #InterviewPrep #Coding #Career',
        placement: '🎓 Placement Success Story: Just landed my dream job at a top tech company! The key was consistent practice and building real projects. Here are the 3 things that made the difference... #Placement #Career #Success'
    };
    const content = mockPosts[topic] || mockPosts.fullstack;
    res.json({
        success: true,
        data: {
            id: Date.now().toString(),
            content,
            topic,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        message: 'Post generated successfully'
    });
});
app.get('/api/settings', (_req, res) => {
    res.json({
        success: true,
        data: {
            defaultPostTime: '09:00',
            preferredTopics: ['fullstack', 'dsa'],
            linkedInConnected: false,
            autoSchedule: false
        }
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.url}`,
    });
});
app.use((error, _req, res, _next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
    });
});
app.listen(PORT, () => {
    console.log(`🚀 LinkedIn AI Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map