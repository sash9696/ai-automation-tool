"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3003;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['NODE_ENV'] === 'production'
        ? ['https://ai-automation-frontend.onrender.com']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'LinkedIn Scheduler Service is running',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
    });
});
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
    console.log(`⏰ LinkedIn Scheduler Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map