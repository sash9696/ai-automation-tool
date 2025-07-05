import OpenAI from 'openai';
import type { GeneratePostRequest } from '../types';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

// Mock post templates for testing
const mockPosts = {
  fullstack: '🔥 Full Stack Development Tip: Always use environment variables for configuration! I just saved myself from a major security breach by moving API keys to .env files. Remember: never commit secrets to your repo! #FullStack #Security #WebDev',
  dsa: '🧮 DSA Challenge: Can you solve this in O(n) time? Given an array, find the first non-repeating element. This is a classic interview question that tests your understanding of hash maps! #DSA #Algorithms #InterviewPrep',
  interview: '🎯 Interview Tip: Always start with the brute force solution! I used to jump straight to optimization, but interviewers want to see your problem-solving process. Here\'s how I approach coding questions... #InterviewPrep #Coding #Career',
  placement: '🎓 Placement Success Story: Just landed my dream job at a top tech company! The key was consistent practice and building real projects. Here are the 3 things that made the difference... #Placement #Career #Success'
};

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

export const generateAIPost = async (request: GeneratePostRequest): Promise<string> => {
  try {
    // For testing, always use mock data instead of OpenAI API
    console.log('🤖 Using mock AI post generation for testing');
    
    // Get mock post for the topic, or generate a generic one
    const mockPost = mockPosts[request.topic] || `🚀 ${request.topic}: Exploring the latest trends and insights in ${request.topic}. 
    The landscape is evolving rapidly, and staying ahead requires continuous learning and adaptation. 
    What are your thoughts on the future of ${request.topic}? #${request.topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
    
    return mockPost;
    
    // Original OpenAI code (commented out for testing)
    /*
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
    */
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI post');
  }
};

export const analyzePostPerformance = async (content: string): Promise<{
  viralScore: number;
  suggestions: string[];
}> => {
  try {
    // For testing, return mock analysis instead of OpenAI API call
    console.log('🤖 Using mock post analysis for testing');
    
    return {
      viralScore: Math.floor(Math.random() * 5) + 6,
      suggestions: [
        'Add more specific examples',
        'Include a personal story',
        'Ask a thought-provoking question',
      ],
    };
    
    // Original OpenAI code (commented out for testing)
    /*
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
    
    // Mock response for now - in production, parse the AI response
    return {
      viralScore: Math.floor(Math.random() * 5) + 6,
      suggestions: [
        'Add more specific examples',
        'Include a personal story',
        'Ask a thought-provoking question',
      ],
    };
    */
  } catch (error) {
    console.error('Post Analysis Error:', error);
    return {
      viralScore: 5,
      suggestions: ['Unable to analyze post'],
    };
  }
}; 