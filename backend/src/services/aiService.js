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

export const generateAIPost = async ({ topic, tone = 'professional', vibe = 'Story', originalPost = null, prompt, useCustomPrompt, includeHashtags, includeCTA, selectedCategory, selectedStyle }) => {
  try {
    console.log('🔍 [AI SERVICE DEBUG] Received parameters:', {
      topic,
      tone,
      vibe,
      originalPost: originalPost ? 'Present' : 'Not present',
      prompt: prompt ? `${prompt.substring(0, 100)}...` : 'No prompt',
      useCustomPrompt,
      includeHashtags,
      includeCTA,
      selectedCategory,
      selectedStyle
    });

    // Check if we have a custom prompt from the frontend
    if (useCustomPrompt && prompt) {
      console.log('🟢 [AI SERVICE DEBUG] Using custom prompt!');
      console.log('📝 [AI SERVICE DEBUG] Custom prompt (first 300 chars):', prompt.slice(0, 300));
      
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
      console.log('🟢 [AI SERVICE DEBUG] OpenAI response received:', content ? `${content.substring(0, 200)}...` : '[No content]');
      
      if (!content) {
        throw new Error('Failed to generate content with custom prompt');
      }
      return content.trim();
    }

    // Fallback to mock data for testing
    console.log('🟡 [AI SERVICE DEBUG] Using fallback mock generation');
    console.log('🟡 [AI SERVICE DEBUG] Configuration for mock generation:', {
      topic,
      tone,
      vibe,
      includeHashtags,
      includeCTA,
      selectedCategory,
      selectedStyle
    });
    
    // Check if we have OpenAI API key for real generation
    if (!process.env.OPENAI_API_KEY) {
      console.log('🔴 [AI SERVICE DEBUG] No OpenAI API key - using static mock content');
      const mockPost = mockPosts[topic] || `🚀 ${topic}: Exploring the latest trends and insights in ${topic}. 
    The landscape is evolving rapidly, and staying ahead requires continuous learning and adaptation. 
    What are your thoughts on the future of ${topic}? #${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
      
      console.log('🔴 [AI SERVICE DEBUG] Mock post generated:', mockPost.substring(0, 200) + '...');
      return mockPost;
    }

    // Build prompt based on configuration
    console.log('🟢 [AI SERVICE DEBUG] Building prompt with OpenAI API key available');
    
    let defaultPrompt;
    if (originalPost) {
      console.log('🔄 [AI SERVICE DEBUG] Optimizing existing post');
      // Optimize existing post
      defaultPrompt = `You are a professional LinkedIn content creator. Please optimize this post for better engagement while maintaining the core message:

Original post: "${originalPost}"

Topic: ${topic}
Tone: ${tone}
Vibe: ${vibe}
Selected Category: ${selectedCategory || 'Not specified'}
Selected Style: ${selectedStyle || 'Not specified'}

Please create an engaging LinkedIn post that:
1. Maintains the original message but makes it more compelling
2. Uses a ${tone} tone
3. ${includeHashtags ? 'Includes relevant hashtags' : 'Does not include hashtags'}
4. ${includeCTA ? 'Encourages engagement and discussion' : 'Does not include call-to-action'}
5. Is optimized for LinkedIn's algorithm
6. Keeps it between 100-200 words

Make it sound natural and conversational, not like AI-generated content.`;
    } else {
      console.log('�� [AI SERVICE DEBUG] Creating new post');
      // Generate new post
      defaultPrompt = `You are a professional LinkedIn content creator specializing in ${topic.toLowerCase()} content.

Please create an engaging LinkedIn post about "${topic}" with the following requirements:
- Topic: ${topic}
- Tone: ${tone}
- Style: ${vibe}
- Selected Category: ${selectedCategory || 'Not specified'}
- Selected Style: ${selectedStyle || 'Not specified'}
- ${includeHashtags ? 'Include relevant hashtags' : 'Do not include hashtags'}
- ${includeCTA ? 'Encourage engagement and discussion' : 'Do not include call-to-action'}
- Optimized for LinkedIn's algorithm
- Length: 100-200 words
- Make it sound natural and conversational, not like AI-generated content

The post should be informative, engaging, and provide value to the audience.`;
    }

    console.log('🔍 [AI SERVICE DEBUG] Final prompt built (first 400 chars):', defaultPrompt.substring(0, 400) + '...');

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
    console.log('🟢 [AI SERVICE DEBUG] OpenAI generated content:', generatedContent ? generatedContent.substring(0, 200) + '...' : 'No content generated');
    
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