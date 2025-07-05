// World-class post templates inspired by viral LinkedIn content from Staff Engineers and tech influencers
// Organized by use case, style, and hooks for optimal engagement

export interface PostTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  style: TemplateStyle;
  hook: string;
  prompt: string;
  example: string;
  viralScore: number;
  hashtags: string[];
  useCases: string[];
}

export type TemplateCategory = 
  | 'frontend' 
  | 'ai' 
  | 'tech-career' 
  | 'cs-concepts' 
  | 'system-design' 
  | 'interview-prep';

export type TemplateStyle = 
  | 'story' 
  | 'listicle' 
  | 'rant' 
  | 'resource-dump' 
  | 'case-study' 
  | 'unpopular-opinion' 
  | 'question' 
  | 'achievement';

export type TemplateHook = 
  | 'time-based' 
  | 'achievement' 
  | 'struggle' 
  | 'surprise' 
  | 'question' 
  | 'number' 
  | 'comparison';

// Template Map for fast lookup and rotation
export const POST_TEMPLATES = new Map<string, PostTemplate>([
  
  // FRONTEND TEMPLATES
  ['frontend-story-1', {
    id: 'frontend-story-1',
    name: 'The React Refactor That Changed Everything',
    category: 'frontend',
    style: 'story',
    hook: 'time-based',
    prompt: `You are a senior frontend engineer with 10+ years of experience. Write a LinkedIn post about a React refactoring experience that taught you something important.

Requirements:
- Start with a time hook (like "Last month, I spent 3 days refactoring...")
- Include specific details about what you did
- Share what you learned and why it matters
- Use a friendly, experienced tone
- Include 3-5 relevant hashtags
- End with a question for others
- Keep it under 1300 characters
- Make it sound like real experience, not AI-generated

Topic: {topic}
Tone: {tone}`,
    example: `Last month, I spent 3 days refactoring a React component that was 800 lines long.

The original code worked, but it was a nightmare to maintain. Every bug fix felt like playing Jenga with the entire component.

Here's what I learned:

🔧 Break down large components into smaller, focused ones
🧪 Write tests BEFORE refactoring (saved me twice!)
📚 Document the "why" behind architectural decisions

The refactor reduced the component to 150 lines and made it 10x easier to debug.

But here's the real lesson: Technical debt isn't just about code quality—it's about team velocity and mental overhead.

What's the largest component you've ever refactored? What did you learn from it?

#React #Frontend #Refactoring #SoftwareEngineering #CodeQuality`,
    viralScore: 9.2,
    hashtags: ['#React', '#Frontend', '#Refactoring', '#SoftwareEngineering', '#CodeQuality'],
    useCases: ['react', 'refactoring', 'code-quality', 'team-velocity']
  }],

  ['frontend-listicle-1', {
    id: 'frontend-listicle-1',
    name: '5 Frontend Performance Secrets',
    category: 'frontend',
    style: 'listicle',
    hook: 'number',
    prompt: `You are a performance optimization expert. Write a LinkedIn post sharing 5 specific frontend performance techniques that actually work in real projects.

Requirements:
- Start with a number hook (like "After optimizing 50+ websites, here are the 5 techniques...")
- Each point should be specific and actionable
- Include real metrics or examples where possible
- Use bullet points for easy reading
- Include 3-5 relevant hashtags
- End with a call to action
- Keep it under 1300 characters
- Sound like you've actually used these techniques

Topic: {topic}
Tone: {tone}`,
    example: `After optimizing 50+ websites, here are the 5 frontend performance techniques that actually work:

🚀 Code Splitting: Reduced initial bundle size by 60% using dynamic imports
🎯 Image Optimization: Switched to WebP + lazy loading = 40% faster page loads
⚡ Memoization: React.memo + useMemo cut re-renders by 70%
📦 Tree Shaking: Removed 200KB of unused code with proper ES6 imports
🔍 Bundle Analysis: Webpack Bundle Analyzer revealed 3MB of duplicate dependencies

The result? 2.5s → 0.8s page load times.

Performance isn't just about speed—it's about user experience and conversion rates.

Which technique has given you the biggest performance boost?

#Frontend #Performance #WebOptimization #React #WebDev`,
    viralScore: 8.8,
    hashtags: ['#Frontend', '#Performance', '#WebOptimization', '#React', '#WebDev'],
    useCases: ['performance', 'optimization', 'web-development', 'user-experience']
  }],

  ['frontend-resource-dump-1', {
    id: 'frontend-resource-dump-1',
    name: 'The Frontend Resources That Made Me a Better Developer',
    category: 'frontend',
    style: 'resource-dump',
    hook: 'time-based',
    prompt: `You are a senior frontend engineer sharing valuable learning resources. Write a LinkedIn post about the best frontend resources that helped you grow as a developer.

Requirements:
- Start with a time hook (like "After 8 years in frontend development...")
- Share specific resources with brief explanations
- Include books, courses, websites, tools, or frameworks
- Explain why each resource is valuable
- Use a helpful, sharing tone
- Include 3-5 relevant hashtags
- End with a question about others' favorite resources
- Keep it under 1300 characters
- Sound like you've actually used these resources

Topic: {topic}
Tone: {tone}`,
    example: `After 8 years in frontend development, here are the resources that actually made me better:

📚 "You Don't Know JS" - Mastered JavaScript fundamentals
🎓 Frontend Masters courses - Advanced React patterns and performance
🔧 Chrome DevTools - Learned debugging and optimization techniques
📖 "CSS Grid Layout" by Rachel Andrew - Modern CSS mastery
🌐 MDN Web Docs - The definitive reference for web standards

The key insight? Understanding the fundamentals makes everything else easier.

These resources helped me go from "I can make it work" to "I can make it work well."

What frontend resources have had the biggest impact on your career?

#Frontend #WebDevelopment #JavaScript #CSS #Learning #TechEducation`,
    viralScore: 8.6,
    hashtags: ['#Frontend', '#WebDevelopment', '#JavaScript', '#CSS', '#Learning', '#TechEducation'],
    useCases: ['learning-resources', 'frontend-fundamentals', 'skill-development', 'web-standards']
  }],

  // AI TEMPLATES
  ['ai-case-study-1', {
    id: 'ai-case-study-1',
    name: 'AI Implementation That Saved $500K',
    category: 'ai',
    style: 'case-study',
    hook: 'achievement',
    prompt: `You are a senior AI engineer who just implemented a successful AI solution. Write a LinkedIn post about a specific AI project that delivered real business value.

Requirements:
- Start with an achievement hook (like "Just deployed an AI solution that...")
- Include specific metrics and business impact
- Explain the technical approach in simple terms
- Share challenges you faced and lessons learned
- Use a confident but humble tone
- Include 3-5 relevant hashtags
- End with insights about AI adoption
- Keep it under 1300 characters
- Sound like real project experience

Topic: {topic}
Tone: {tone}`,
    example: `Just deployed an AI solution that saved our company $500K annually.

The problem: Manual data entry was taking 40 hours/week and costing $200K/year in labor.

The solution: Custom NLP model + OCR pipeline that processes 10,000 documents/day with 95% accuracy.

Key learnings:
🤖 Start with clear business metrics, not just technical ones
📊 Data quality matters more than model complexity
🔄 Iterative deployment beats big-bang releases
👥 Cross-functional teams deliver better AI solutions

The real win? Our team now focuses on strategic work instead of data entry.

AI isn't about replacing humans—it's about amplifying human potential.

What's your biggest AI success story?

#AI #MachineLearning #Automation #BusinessImpact #Innovation`,
    viralScore: 9.5,
    hashtags: ['#AI', '#MachineLearning', '#Automation', '#BusinessImpact', '#Innovation'],
    useCases: ['ai-implementation', 'business-impact', 'automation', 'nlp']
  }],

  ['ai-unpopular-opinion-1', {
    id: 'ai-unpopular-opinion-1',
    name: 'Unpopular Opinion: AI Won\'t Replace Developers',
    category: 'ai',
    style: 'unpopular-opinion',
    hook: 'surprise',
    prompt: `You are a senior developer with strong opinions about AI in software development. Write a LinkedIn post sharing an unpopular opinion about AI and development.

Requirements:
- Start with "Unpopular opinion:" or similar hook
- Take a contrarian but well-reasoned stance
- Support your argument with specific examples
- Be provocative but professional
- Include 3-5 relevant hashtags
- End with a question that encourages debate
- Keep it under 1300 characters
- Sound like you've thought deeply about this

Topic: {topic}
Tone: {tone}`,
    example: `Unpopular opinion: AI won't replace developers—it will make us 10x more valuable.

Here's why:

🤖 AI is great at pattern recognition, terrible at system design
🔧 Complex architectures require human intuition and experience
🎯 Business requirements need human interpretation and negotiation
🚀 Innovation comes from understanding what's possible, not just what's efficient

The developers who embrace AI as a tool will build things we can't even imagine today.

The ones who fear it will be left behind.

AI is the calculator of our generation. It didn't replace mathematicians—it made them more powerful.

What's your take? Will AI replace developers or amplify them?

#AI #SoftwareDevelopment #FutureOfWork #Innovation #TechDebate`,
    viralScore: 9.1,
    hashtags: ['#AI', '#SoftwareDevelopment', '#FutureOfWork', '#Innovation', '#TechDebate'],
    useCases: ['ai-future', 'developer-career', 'automation-fears', 'tech-trends']
  }],

  // TECH CAREER TEMPLATES
  ['career-achievement-1', {
    id: 'career-achievement-1',
    name: 'From Junior to Staff Engineer in 5 Years',
    category: 'tech-career',
    style: 'achievement',
    hook: 'achievement',
    prompt: `You are a Staff Engineer who recently achieved a major career milestone. Write a LinkedIn post about your career progression and the key lessons learned.

Requirements:
- Start with an achievement hook (like "Just got promoted to Staff Engineer...")
- Share specific milestones and timeline
- Include actionable career advice
- Be humble and grateful
- Include 3-5 relevant hashtags
- End with encouragement for others
- Keep it under 1300 characters
- Sound authentic and inspiring

Topic: {topic}
Tone: {tone}`,
    example: `Just got promoted to Staff Engineer after 5 years in the industry.

Here's what I learned on the journey:

🎯 Technical skills get you in the door, leadership skills get you promoted
🤝 Mentoring others accelerates your own growth
📚 Continuous learning is non-negotiable
💡 Innovation comes from solving real problems, not just coding
🎪 Communication is as important as technical expertise

The biggest lesson? Your career is a marathon, not a sprint.

Focus on adding value, building relationships, and staying curious.

To everyone on their own journey: Keep pushing, keep learning, keep building.

What's your biggest career lesson so far?

#CareerGrowth #SoftwareEngineering #Leadership #Mentorship #TechCareer`,
    viralScore: 8.9,
    hashtags: ['#CareerGrowth', '#SoftwareEngineering', '#Leadership', '#Mentorship', '#TechCareer'],
    useCases: ['career-progression', 'promotion', 'leadership', 'mentorship']
  }],

  ['career-struggle-1', {
    id: 'career-struggle-1',
    name: 'The Interview Rejection That Changed My Career',
    category: 'tech-career',
    style: 'story',
    hook: 'struggle',
    prompt: `You are a senior engineer sharing a career setback that led to growth. Write a LinkedIn post about a specific failure or rejection that taught you valuable lessons.

Requirements:
- Start with a struggle hook (like "Got rejected from my dream job 3 years ago...")
- Share the specific situation and your initial reaction
- Explain what you learned and how you grew
- Be vulnerable but positive
- Include 3-5 relevant hashtags
- End with encouragement for others facing similar situations
- Keep it under 1300 characters
- Sound authentic and relatable

Topic: {topic}
Tone: {tone}`,
    example: `Got rejected from my dream job 3 years ago.

I was devastated. Spent weeks preparing, nailed the technical rounds, but failed the system design interview.

Instead of giving up, I:

📚 Studied system design for 6 months straight
🏗️ Built side projects to practice architecture
🤝 Found a mentor who guided me through the process
💪 Applied to 50+ companies to build interview confidence

Fast forward to today: I'm a Staff Engineer at a top tech company, and I've helped 100+ engineers prepare for interviews.

The rejection wasn't the end—it was the beginning of my growth.

To everyone facing rejection: Your next opportunity is just around the corner.

What rejection taught you the most?

#CareerGrowth #InterviewPrep #Resilience #SystemDesign #TechCareer`,
    viralScore: 9.3,
    hashtags: ['#CareerGrowth', '#InterviewPrep', '#Resilience', '#SystemDesign', '#TechCareer'],
    useCases: ['interview-rejection', 'career-setback', 'resilience', 'growth-mindset']
  }],

  // CS CONCEPTS TEMPLATES
  ['cs-question-1', {
    id: 'cs-question-1',
    name: 'The Algorithm Question That Stumped Me',
    category: 'cs-concepts',
    style: 'question',
    hook: 'question',
    prompt: `You are a senior engineer sharing an interesting algorithmic problem. Write a LinkedIn post about a specific CS concept or algorithm that challenged you.

Requirements:
- Start with a thought-provoking question
- Present the problem clearly but concisely
- Share your approach and solution
- Include the broader lesson or concept
- Use a curious, learning-focused tone
- Include 3-5 relevant hashtags
- End with a question for the community
- Keep it under 1300 characters
- Sound like you're genuinely curious and learning

Topic: {topic}
Tone: {tone}`,
    example: `What's the most efficient way to find the longest palindromic substring?

This question stumped me during a recent interview prep session.

The brute force approach is O(n³), but there's a beautiful O(n²) solution using dynamic programming.

Here's the insight: Instead of checking every substring, we can build palindromes from the center outward.

The key learning? Sometimes the most elegant solutions come from looking at the problem differently.

This got me thinking: What's your favorite algorithmic problem? The one that made you go "Aha!" when you finally solved it?

#Algorithms #DataStructures #InterviewPrep #ProblemSolving #ComputerScience`,
    viralScore: 8.7,
    hashtags: ['#Algorithms', '#DataStructures', '#InterviewPrep', '#ProblemSolving', '#ComputerScience'],
    useCases: ['algorithms', 'interview-prep', 'problem-solving', 'dynamic-programming']
  }],

  ['cs-resource-dump-1', {
    id: 'cs-resource-dump-1',
    name: 'The CS Resources That Made Me a Better Engineer',
    category: 'cs-concepts',
    style: 'resource-dump',
    hook: 'time-based',
    prompt: `You are a senior engineer sharing valuable learning resources. Write a LinkedIn post about the best CS resources that helped you grow as an engineer.

Requirements:
- Start with a time hook (like "After 10 years in software engineering...")
- Share specific resources with brief explanations
- Include books, courses, websites, or tools
- Explain why each resource is valuable
- Use a helpful, sharing tone
- Include 3-5 relevant hashtags
- End with a question about others' favorite resources
- Keep it under 1300 characters
- Sound like you've actually used these resources

Topic: {topic}
Tone: {tone}`,
    example: `After 10 years in software engineering, here are the CS resources that actually made me better:

📚 "Designing Data-Intensive Applications" - Changed how I think about system design
🎓 MIT OpenCourseWare Algorithms course - Mastered the fundamentals
🔧 LeetCode - Practice makes perfect (solved 500+ problems)
📖 "System Design Interview" by Alex Xu - Real-world architecture patterns
🌐 High Scalability blog - Learn from production systems

The key insight? Theory + Practice = Mastery.

These resources helped me go from "I can code" to "I can architect systems."

What CS resources have had the biggest impact on your career?

#ComputerScience #Learning #SystemDesign #Algorithms #TechEducation`,
    viralScore: 8.5,
    hashtags: ['#ComputerScience', '#Learning', '#SystemDesign', '#Algorithms', '#TechEducation'],
    useCases: ['learning-resources', 'cs-fundamentals', 'system-design', 'skill-development']
  }],

  // SYSTEM DESIGN TEMPLATES
  ['system-design-rant-1', {
    id: 'system-design-rant-1',
    name: 'Why Most System Design Interviews Are Broken',
    category: 'system-design',
    style: 'rant',
    hook: 'surprise',
    prompt: `You are a senior engineer with strong opinions about system design interviews. Write a LinkedIn post about what's wrong with current system design interview practices.

Requirements:
- Start with a surprising or provocative statement
- Share specific problems with current practices
- Provide constructive criticism and suggestions
- Be passionate but professional
- Include 3-5 relevant hashtags
- End with a call to action for improvement
- Keep it under 1300 characters
- Sound like you've experienced these issues firsthand

Topic: {topic}
Tone: {tone}`,
    example: `Most system design interviews are testing the wrong things.

Here's what's broken:

🎯 Interviewers expect candidates to know specific architectures by heart
⏰ 45 minutes isn't enough to design a real system
📚 Memorizing patterns ≠ understanding trade-offs
🎪 No consideration for the candidate's background or experience level

The result? We're hiring people who can recite architectures, not people who can think critically about system design.

Here's what we should be testing instead:
🤔 Problem-solving approach
⚖️ Trade-off analysis
📊 Scalability thinking
🔄 Iterative improvement

System design is about thinking, not memorizing.

How can we make system design interviews more effective?

#SystemDesign #InterviewPrep #SoftwareEngineering #Hiring #TechInterviews`,
    viralScore: 9.0,
    hashtags: ['#SystemDesign', '#InterviewPrep', '#SoftwareEngineering', '#Hiring', '#TechInterviews'],
    useCases: ['system-design', 'interview-criticism', 'hiring-practices', 'technical-interviews']
  }],

  // INTERVIEW PREP TEMPLATES
  ['interview-listicle-1', {
    id: 'interview-listicle-1',
    name: '7 Interview Mistakes That Cost Me Job Offers',
    category: 'interview-prep',
    style: 'listicle',
    hook: 'number',
    prompt: `You are a senior engineer sharing interview lessons learned. Write a LinkedIn post about specific interview mistakes you've made and how to avoid them.

Requirements:
- Start with a number hook (like "After 50+ interviews, here are the 7 mistakes...")
- Share specific mistakes with brief explanations
- Include actionable advice for each
- Be honest about your own failures
- Include 3-5 relevant hashtags
- End with encouragement for others
- Keep it under 1300 characters
- Sound like you've learned from these mistakes

Topic: {topic}
Tone: {tone}`,
    example: `After 50+ interviews, here are the 7 mistakes that cost me job offers:

🚫 Jumping straight to coding without clarifying requirements
🚫 Not asking clarifying questions about edge cases
🚫 Focusing on optimization before getting a working solution
🚫 Not explaining my thought process out loud
🚫 Forgetting to test my code with examples
🚫 Not preparing questions to ask the interviewer
🚫 Letting nerves affect my communication

The biggest lesson? Interviews are about problem-solving AND communication.

Here's what I do now:
✅ Always start with clarifying questions
✅ Think out loud, even if it feels awkward
✅ Get a working solution first, optimize later
✅ Practice explaining my code to others

What interview mistake taught you the most?

#InterviewPrep #CodingInterviews #ProblemSolving #CareerAdvice #TechInterviews`,
    viralScore: 8.6,
    hashtags: ['#InterviewPrep', '#CodingInterviews', '#ProblemSolving', '#CareerAdvice', '#TechInterviews'],
    useCases: ['interview-mistakes', 'coding-interviews', 'problem-solving', 'career-advice']
  }]
]);

// Helper functions for template management
export const getTemplatesByCategory = (category: TemplateCategory): PostTemplate[] => {
  return Array.from(POST_TEMPLATES.values()).filter(template => template.category === category);
};

export const getTemplatesByStyle = (style: TemplateStyle): PostTemplate[] => {
  return Array.from(POST_TEMPLATES.values()).filter(template => template.style === style);
};

export const getRandomTemplate = (category?: TemplateCategory, style?: TemplateStyle): PostTemplate => {
  let templates = Array.from(POST_TEMPLATES.values());
  
  if (category) {
    templates = templates.filter(t => t.category === category);
  }
  
  if (style) {
    templates = templates.filter(t => t.style === style);
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
};

export const getTopTemplates = (limit: number = 5): PostTemplate[] => {
  return Array.from(POST_TEMPLATES.values())
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, limit);
};

// Template categories for UI
export const TEMPLATE_CATEGORIES = [
  { value: 'frontend', label: 'Frontend Development', emoji: '🎨' },
  { value: 'ai', label: 'AI & Machine Learning', emoji: '🤖' },
  { value: 'tech-career', label: 'Tech Career', emoji: '🚀' },
  { value: 'cs-concepts', label: 'CS Concepts', emoji: '🧮' },
  { value: 'system-design', label: 'System Design', emoji: '🏗️' },
  { value: 'interview-prep', label: 'Interview Prep', emoji: '🎯' }
];

export const TEMPLATE_STYLES = [
  { value: 'story', label: 'Story', emoji: '📖' },
  { value: 'listicle', label: 'Listicle', emoji: '📋' },
  { value: 'rant', label: 'Rant', emoji: '😤' },
  { value: 'resource-dump', label: 'Resource Dump', emoji: '📚' },
  { value: 'case-study', label: 'Case Study', emoji: '📊' },
  { value: 'unpopular-opinion', label: 'Unpopular Opinion', emoji: '🤔' },
  { value: 'question', label: 'Question', emoji: '❓' },
  { value: 'achievement', label: 'Achievement', emoji: '🏆' }
]; 