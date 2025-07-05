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

export const generateAIPost = async ({ topic, tone = 'professional', vibe = 'Story', originalPost = null }) => {
  try {
    // For testing, always use mock data instead of OpenAI API
    console.log('🤖 Using mock AI post generation for testing');
    
    // Get mock post for the topic, or generate a generic one
    let mockPost;
    
    if (originalPost) {
      // Use LinkedIn optimization for existing posts
      mockPost = `🚀 ${topic}: I've been thinking about this topic a lot lately.

${originalPost}

The key insight here is that we need to approach this differently. 

What's your take on this? How do you see this evolving in the next few years?

#${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
    } else {
      mockPost = mockPosts[topic] || `🚀 ${topic}: Exploring the latest trends and insights in ${topic.toLowerCase()}. 
    The landscape is evolving rapidly, and staying ahead requires continuous learning and adaptation. 
    What are your thoughts on the future of ${topic.toLowerCase()}? #${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork`;
    }
    
    return mockPost;
    
    // Original OpenAI code (commented out for testing)
    /*
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock content if no API key
      return `🎯 ${topic}: Here's an insightful perspective on ${topic.toLowerCase()}. The key is to focus on practical applications and real-world impact. #${topic.replace(/\s+/g, '')} #Innovation #Leadership`;
    }

    const prompt = `Generate a professional LinkedIn post about "${topic}" with a ${tone} tone. 
    The post should be engaging, informative, and include relevant hashtags. 
    Keep it between 100-200 words and make it suitable for a business audience.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content creator specializing in LinkedIn posts for business and technology topics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
    */
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