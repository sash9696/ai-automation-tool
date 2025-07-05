"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3002;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['NODE_ENV'] === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'LinkedIn AI Service is running',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
    });
});
app.post('/api/generate-post', async (req, res) => {
    try {
        const { topic, tone = 'professional', includeHashtags = true, includeCTA = true, originalPost = null } = req.body;
        if (!process.env.OPENAI_API_KEY) {
            console.log('🤖 No OpenAI API key found, using mock AI post generation');
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
                    tone,
                    includeHashtags,
                    includeCTA,
                    createdAt: new Date().toISOString(),
                },
                message: 'Post generated successfully (mock)'
            });
            return;
        }
        console.log('🤖 Using OpenAI for post generation');
        let prompt;
        if (originalPost) {
            prompt = `You are a professional LinkedIn content creator. Please optimize this post for better engagement while maintaining the core message:

Original post: "${originalPost}"

Topic: ${topic}
Tone: ${tone}
Include hashtags: ${includeHashtags}
Include CTA: ${includeCTA}

Please create an engaging LinkedIn post that:
1. Maintains the original message but makes it more compelling
2. Uses a ${tone} tone
3. ${includeHashtags ? 'Includes relevant hashtags' : 'Does not include hashtags'}
4. ${includeCTA ? 'Encourages engagement and discussion' : 'Does not include call-to-action'}
5. Is optimized for LinkedIn's algorithm
6. Keeps it between 100-200 words

Make it sound natural and conversational, not like AI-generated content.`;
        }
        else {
            prompt = `You are a professional LinkedIn content creator specializing in ${topic.toLowerCase()} content.

Please create an engaging LinkedIn post about "${topic}" with the following requirements:
- Tone: ${tone}
- ${includeHashtags ? 'Include relevant hashtags' : 'Do not include hashtags'}
- ${includeCTA ? 'Encourage engagement and discussion' : 'Do not include call-to-action'}
- Optimized for LinkedIn's algorithm
- Length: 100-200 words
- Make it sound natural and conversational, not like AI-generated content

The post should be informative, engaging, and provide value to the audience.`;
        }
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional content creator specializing in LinkedIn posts for business and technology topics. Always create engaging, authentic content that encourages discussion."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 400,
            temperature: 0.8,
        });
        const generatedContent = completion.choices[0]?.message?.content?.trim() || 'Failed to generate content';
        console.log('🤖 OpenAI generated content:', generatedContent);
        res.json({
            success: true,
            data: {
                id: Date.now().toString(),
                content: generatedContent,
                topic,
                tone,
                includeHashtags,
                includeCTA,
                createdAt: new Date().toISOString(),
            },
            message: 'Post generated successfully with OpenAI'
        });
    }
    catch (error) {
        console.error('AI Service error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate post',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
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
    console.log(`🤖 LinkedIn AI Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map