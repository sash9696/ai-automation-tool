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

export const generateAIPost = async ({ topic, tone = 'professional', vibe = 'Story', originalPost = null, prompt, useCustomPrompt, includeHashtags, includeCTA, selectedTemplate }) => {
  try {
    // Check if we have a selected template
    if (selectedTemplate) {
      console.log('🟢 [AIService] Using viral template:', selectedTemplate);
      
      // Get template details and create a viral prompt
      const templatePrompt = createViralTemplatePrompt(selectedTemplate, topic, tone, includeHashtags, includeCTA);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer with 10+ years of experience creating viral LinkedIn content. Write authentic, engaging posts that follow proven viral templates. You must follow the template structure exactly while making it sound like real experience.',
          },
          {
            role: 'user',
            content: templatePrompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content;
      console.log('🟢 [AIService] Template-based response:', content ? content.substring(0, 200) + '...' : '[No content]');
      
      if (!content) {
        throw new Error('Failed to generate content with template');
      }
      return content.trim();
    }

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
      console.log('🟢 [AIService] Raw OpenAI response:', content ? content.substring(0, 200) + '...' : '[No content]');
      
      if (!content) {
        throw new Error('Failed to generate content with custom prompt');
      }
      return content.trim();
    }

    // Check if we have OpenAI API key for real generation
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
3. ${includeHashtags ? 'Includes relevant hashtags' : 'Does not include hashtags'}
4. ${includeCTA ? 'Encourages engagement and discussion' : 'Does not include call-to-action'}
5. Is optimized for LinkedIn's algorithm
6. Keeps it between 100-200 words

Make it sound natural and conversational, not like AI-generated content.`;
    } else {
      // Generate new post
      defaultPrompt = `You are a professional LinkedIn content creator specializing in ${topic.toLowerCase()} content.

Please create an engaging LinkedIn post about "${topic}" with the following requirements:
- Topic: ${topic}
- Tone: ${tone}
- Style: ${vibe}
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

// Template-based prompt creation
const createViralTemplatePrompt = (templateId, topic, tone, includeHashtags, includeCTA) => {
  // Template definitions based on the user's top-performing posts
  const templates = {
    'resource-curation': {
      name: 'Resource Curation Masterpiece',
      structure: 'intro + categorization + specific recommendations + links',
      viralElements: ['personal recommendation', 'categorized content', 'actionable resources'],
      example: `I would personally recommend these YouTube channels if you want to take your JavaScript, React, and project development abilities to the next level.

These channels offer a goldmine of valuable content, ranging from in-depth tutorials to hands-on project walkthroughs. 

For Concepts and Problem Solving:
[Specific channels with brief descriptions]

For Creating Awesome Projects:
[Specific channels with brief descriptions]`,
      prompt: `Create a viral LinkedIn post following the "Resource Curation" template structure. This template is proven to get high engagement because it provides genuine value through curated resources.

Template Structure:
- Start with a personal recommendation statement
- Explain the value these resources provide
- Categorize resources by purpose/type
- Provide specific recommendations with brief descriptions
- Use a helpful, authoritative tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it sound like you've personally used and benefited from these resources. Be specific and authentic.`
    },
    'interview-prep': {
      name: 'Interview Preparation Goldmine',
      structure: 'attention-grabbing title + categorized content + bonus tips',
      viralElements: ['comprehensive coverage', 'practical examples', 'bonus tips'],
      example: `Important Frontend Interview Questions & Problem-Solving Challenges 🚀

Core JavaScript
[Specific questions with brief descriptions]

Arrays
[Specific array problems]

Strings
[String manipulation challenges]

Bonus Tips for Interview Success:
[Actionable advice]`,
      prompt: `Create a viral LinkedIn post following the "Interview Preparation" template structure. This template gets high engagement because it provides comprehensive, actionable content.

Template Structure:
- Start with an attention-grabbing title with emoji
- Organize content into clear categories
- Provide specific examples or questions
- End with bonus tips or actionable advice
- Use educational, encouraging tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it comprehensive and genuinely helpful for the target audience.`
    },
    'framework-philosophy': {
      name: 'Framework Philosophy Insight',
      structure: 'observation + empathy + insight + question + conclusion',
      viralElements: ['personal observation', 'relatable struggle', 'counter-intuitive insight'],
      example: `Lately, I've noticed an interesting pattern while talking to frontend developers:

[Observation about framework pressure]

And honestly, I get it.
There's always this pressure to keep up — to jump to the next tool or framework.

But what I've come to realize (and remind myself too) is this:
It's not about the framework. It's about the fundamentals.

So before jumping into the next shiny thing, it's worth asking:
Do I really understand the basics well enough?

That's what gives long-term confidence — not just chasing trends.`,
      prompt: `Create a viral LinkedIn post following the "Framework Philosophy" template structure. This template gets high engagement because it's relatable and thought-provoking.

Template Structure:
- Start with a personal observation about the industry/community
- Show empathy for the common struggle
- Present a counter-intuitive insight
- Ask a thought-provoking question
- End with a philosophical conclusion
- Use reflective, philosophical tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it sound like genuine reflection based on real experience.`
    },
    'humor-remote-work': {
      name: 'Remote Work Humor',
      structure: 'clickbait title + numbered list + punchline',
      viralElements: ['relatable humor', 'industry-specific jokes', 'punchline ending'],
      example: `How to Look Busy as a Remote Developer (Even When You're Not)

1. Keep typing in Slack during calls.
Doesn't matter what you write. Even "asdf;lkj" works.

2. Schedule a "deep work" block on Google Calendar.
Then go deeply nap.

[More humorous tips]

Dinner never ends. Neither do you.`,
      prompt: `Create a viral LinkedIn post following the "Remote Work Humor" template structure. This template gets high engagement because it's relatable and humorous.

Template Structure:
- Start with a clickbait title
- Use numbered list format
- Include industry-specific humor
- End with a punchline
- Use satirical, humorous tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it genuinely funny and relatable to the target audience.`
    },
    'dsa-practical': {
      name: 'DSA in Real Projects',
      structure: 'hook + explanation + examples + call-to-action',
      viralElements: ['practical connection', 'specific examples', 'engagement question'],
      example: `Many frontend developers often wonder how Data Structures and Algorithms (DSA) relate to everyday React development. While DSA may seem abstract, they power many core features of modern applications. 

Let's explore some DSA concepts you can leverage in your React app to boost efficiency and user experience:

1. Arrays: Essential for State Management
[Practical explanation]

2. Objects & Hash Maps: Efficient Data Storage
[Real-world application]

💬 How have you used Data Structures in your React projects? Share your experiences or drop your thoughts in the comments! 👇`,
      prompt: `Create a viral LinkedIn post following the "DSA in Real Projects" template structure. This template gets high engagement because it connects theory to practice.

Template Structure:
- Start with a relatable hook/question
- Explain the connection between theory and practice
- Provide specific examples with explanations
- End with an engagement question
- Use educational, engaging tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it genuinely educational and show real-world applications.`
    },
    'fundamentals-guide': {
      name: 'Fundamentals Mastery Guide',
      structure: 'attention-grabbing title + numbered list + motivational conclusion',
      viralElements: ['numbered format', 'emoji usage', 'motivational language'],
      example: `🚀 Want to Become a TOP Front-End Developer? Start with the FUNDAMENTALS! 🔑

1️⃣ Master CSS Basics:
[Specific details]

2️⃣ JavaScript Fundamentals:
[Core concepts]

💡 Pro Tip: Master these fundamentals, and frameworks will be tools that make your job easier. The foundation you build today will set you up for success tomorrow! 🔥`,
      prompt: `Create a viral LinkedIn post following the "Fundamentals Mastery Guide" template structure. This template gets high engagement because it provides a clear learning path.

Template Structure:
- Start with an attention-grabbing title with emojis
- Use numbered list with emoji numbers
- Provide specific, actionable tips
- End with motivational conclusion
- Use motivational, educational tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it genuinely motivating and provide clear, actionable steps.`
    },
    'fullstack-blueprint': {
      name: 'Full Stack Blueprint',
      structure: 'title + numbered steps + conclusion',
      viralElements: ['step-by-step format', 'specific technologies', 'practical advice'],
      example: `How to Build a Full Stack Product from Scratch

1. Start with Node.js and Express.
Lay a solid foundation.

2. Implement secure user access.
Use JWT for authentication and authorization.

[Continue with numbered steps]

Adapt these steps to your project's unique needs.`,
      prompt: `Create a viral LinkedIn post following the "Full Stack Blueprint" template structure. This template gets high engagement because it provides a complete roadmap.

Template Structure:
- Start with a clear title
- Use numbered steps format
- Include specific technologies/tools
- End with adaptable conclusion
- Use practical, authoritative tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it practical and provide a complete, actionable roadmap.`
    },
    'code-quality': {
      name: 'Code Quality Advocacy',
      structure: 'problem + solution + benefits + question',
      viralElements: ['problem identification', 'specific solutions', 'community question'],
      example: `#frontend
I've worked on codebases with over 2,000 lines of code in a single file, and it's a nightmare for new developers to navigate. It's frustrating, time-consuming, and leads to errors. 
That's why enforcing coding standards with tools like ESLint and adopting guidelines like the Airbnb Style Guide is crucial. Here's why:

[Problem statement + solution explanation]

[Benefits with specific examples]

Do you follow coding standards like Airbnb's in your projects? How has it helped your team?`,
      prompt: `Create a viral LinkedIn post following the "Code Quality Advocacy" template structure. This template gets high engagement because it addresses common pain points.

Template Structure:
- Start with a relatable problem statement
- Present a specific solution
- Explain the benefits with examples
- End with a community question
- Use advocacy, problem-solving tone

Topic: ${topic}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags' : 'No hashtags'}
${includeCTA ? 'End with an engagement question' : 'No call-to-action'}

Make it relatable and show clear benefits of the solution.`
    }
  };

  const template = templates[templateId];
  if (!template) {
    console.log('⚠️ [AIService] Template not found, using default generation');
    return null;
  }

  return template.prompt;
}; 