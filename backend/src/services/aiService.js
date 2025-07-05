import OpenAI from 'openai';
import { getLinkedInOptimizationPrompt } from './linkedInAlgorithm.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock post templates for testing
const mockPosts = {
  'Full Stack Development': '🔥 Full Stack Development Tip: Always use environment variables for configuration! I just saved myself from a major security breach by moving API keys to .env files. Remember: never commit secrets to your repo! #FullStack #Security #WebDev',
  'DSA': '🧮 DSA Challenge: Can you solve this in O(n) time? Given an array, find the first non-repeating element. This is a classic interview question that tests your understanding of hash maps! #DSA #Algorithms #InterviewPrep',
  'Interview Preparation': '🎯 Interview Tip: Always start with the brute force solution! I used to jump straight to optimization, but interviewers want to see your problem-solving process. Here\'s how I approach coding questions... #InterviewPrep #Coding #Career',
  'Placement': '🎓 Placement Success Story: Just landed my dream job at a top tech company! The key was consistent practice and building real projects. Here are the 3 things that made the difference... #Placement #Career #Success',
  'AI/ML': '🤖 AI/ML Insights: The future of technology is here! Just implemented a machine learning model that improved our prediction accuracy by 40%. The key was proper data preprocessing and feature engineering. #AI #MachineLearning #Innovation',
  'Web Development': '🌐 Web Development: Building responsive, accessible websites is more than just code. It\'s about creating experiences that work for everyone. Here\'s how I approach modern web development... #WebDev #Accessibility #UX',
  'Mobile Development': '📱 Mobile Development: The mobile-first approach isn\'t just a trend, it\'s a necessity. Just launched an app that works seamlessly across all devices. The secret? Progressive enhancement and responsive design. #MobileDev #AppDevelopment #Tech'
};

export const generateAIPost = async ({ topic, tone = 'professional', vibe = 'Story', originalPost = null, prompt, useCustomPrompt, includeHashtags, includeCTA }) => {
  try {
    // Check if we have a custom prompt from the frontend
    if (useCustomPrompt && prompt) {
      console.log('🟢 [AIService] Using custom prompt!');
      console.log('📝 [AIService] Prompt sent to OpenAI:', prompt.slice(0, 300));
      
      // Use the custom prompt with OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer with 10+ years of experience creating viral LinkedIn content. Write authentic, engaging posts that sound like real experience. You must follow the user\'s instructions exactly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content;
      console.log('🟢 [AIService] Raw OpenAI response:', content ? content.slice(0, 300) : '[No content]');
      
      if (!content) {
        throw new Error('Failed to generate content with custom prompt');
      }
      return content.trim();
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('🟡 [AIService] No OpenAI API key found, using mock AI post generation');
      
      // Fallback to mock content if no API key
      if (originalPost) {
        return `🚀 ${topic}: I've been thinking about this topic a lot lately.

${originalPost}

The key insight here is that we need to approach this differently. 

What's your take on this? How do you see this evolving in the next few years?

#${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
      } else {
        return mockPosts[topic] || `🚀 ${topic}: Exploring the latest trends and insights in ${topic.toLowerCase()}. 
    The landscape is evolving rapidly, and staying ahead requires continuous learning and adaptation. 
    What are your thoughts on the future of ${topic.toLowerCase()}? #${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
      }
    }

    console.log('🟡 [AIService] Not using custom prompt. Fallback to default generation. Request:', JSON.stringify({ topic, tone, vibe, originalPost: !!originalPost }));
    
    let defaultPrompt;
    if (originalPost) {
      // Optimize existing post
      defaultPrompt = `You are a professional LinkedIn content creator. Please optimize this post for better engagement while maintaining the core message:

Original post: "${originalPost}"

Topic: ${topic}
Tone: ${tone}
Vibe: ${vibe}

Please create an engaging LinkedIn post that:
1. Maintains the original message but makes it more compelling
2. Uses a ${tone} tone
3. Includes relevant hashtags
4. Encourages engagement and discussion
5. Is optimized for LinkedIn's algorithm
6. Keeps it between 100-200 words

Make it sound natural and conversational, not like AI-generated content.`;
    } else {
      // Generate new post
      defaultPrompt = `You are a professional LinkedIn content creator specializing in ${topic.toLowerCase()} content.

Please create an engaging LinkedIn post about "${topic}" with the following requirements:
- Tone: ${tone}
- Style: ${vibe}
- Include relevant hashtags
- Encourage engagement and discussion
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
          content: defaultPrompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    const generatedContent = completion.choices[0].message.content.trim();
    console.log('🤖 OpenAI generated content:', generatedContent);
    
    return generatedContent;
  } catch (error) {
    console.error('AI Service error:', error);
    
    // Fallback content
    return `🚀 ${topic}: Exploring the latest trends and insights in ${topic.toLowerCase()}. 
    The landscape is evolving rapidly, and staying ahead requires continuous learning and adaptation. 
    What are your thoughts on the future of ${topic.toLowerCase()}? #${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
  }
};

export const optimizeLinkedInPost = async (originalPost, vibe = 'Story') => {
  return await generateAIPost({ 
    topic: 'post optimization', 
    tone: 'professional', 
    vibe, 
    originalPost 
  });
}; 