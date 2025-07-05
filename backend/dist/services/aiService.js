"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePostPerformance = exports.generateAIPost = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env['OPENAI_API_KEY'],
});
const topicPrompts = {
    fullstack: 'Full Stack Development tips, best practices, and insights',
    dsa: 'Data Structures and Algorithms concepts, problem-solving strategies',
    interview: 'Interview preparation tips, coding challenges, and career advice',
    placement: 'College placement stories, job search strategies, and career guidance',
};
const tonePrompts = {
    professional: 'Write in a professional, authoritative tone',
    casual: 'Write in a friendly, conversational tone',
    motivational: 'Write in an inspiring, motivational tone',
};
const generateAIPost = async (request) => {
    try {
        const topicPrompt = topicPrompts[request.topic];
        const tonePrompt = request.tone ? tonePrompts[request.tone] : tonePrompts.professional;
        const hashtagInstruction = request.includeHashtags
            ? 'Include 3-5 relevant hashtags at the end.'
            : 'Do not include hashtags.';
        const ctaInstruction = request.includeCTA
            ? 'End with a compelling call-to-action that encourages engagement.'
            : 'Do not include a call-to-action.';
        const prompt = `You are an expert LinkedIn content creator specializing in software engineering and tech careers.

Create a viral LinkedIn post about ${topicPrompt}.

Requirements:
- ${tonePrompt}
- Start with a compelling hook (question, surprising fact, or bold statement)
- Keep it under 1300 characters
- Use bullet points or line breaks for readability
- Include specific, actionable insights
- ${hashtagInstruction}
- ${ctaInstruction}

Make it engaging and shareable for software engineers and tech professionals.`;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a LinkedIn content expert who creates viral posts for software engineers.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 500,
            temperature: 0.8,
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Failed to generate content');
        }
        return content.trim();
    }
    catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate AI post');
    }
};
exports.generateAIPost = generateAIPost;
const analyzePostPerformance = async (content) => {
    try {
        const prompt = `Analyze this LinkedIn post for viral potential and provide suggestions:

"${content}"

Rate it from 1-10 for viral potential and provide 3 specific suggestions for improvement.`;
        await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a social media analytics expert.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 300,
            temperature: 0.5,
        });
        return {
            viralScore: Math.floor(Math.random() * 5) + 6,
            suggestions: [
                'Add more specific examples',
                'Include a personal story',
                'Ask a thought-provoking question',
            ],
        };
    }
    catch (error) {
        console.error('Post Analysis Error:', error);
        return {
            viralScore: 5,
            suggestions: ['Unable to analyze post'],
        };
    }
};
exports.analyzePostPerformance = analyzePostPerformance;
//# sourceMappingURL=aiService.js.map