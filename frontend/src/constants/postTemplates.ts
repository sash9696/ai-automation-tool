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
  
  // FRONTEND TEMPLATES (Full Stack Development focused)
  ['frontend-story-1', {
    id: 'frontend-story-1',
    name: 'The React Performance Bug That Taught Me Everything',
    category: 'frontend',
    style: 'story',
    hook: 'time-based',
    prompt: `You are a senior full-stack developer sharing a specific React/frontend performance issue you solved. Write a LinkedIn post about a real performance problem and your solution.

Requirements:
- Start with a time hook (like "Last week, our React app was crashing under load...")
- Focus specifically on FULL STACK DEVELOPMENT challenges
- Mention specific technologies (React, JavaScript, CSS, bundlers, etc.)
- Include the problem symptoms and debugging process
- Explain the technical solution with specific tools/techniques
- Share performance metrics or improvements achieved
- Use frontend-specific terminology (components, hooks, bundling, etc.)
- Include 3-5 relevant hashtags (#React #Frontend #Performance #WebDev #JavaScript)
- End with a question about others' performance optimization experiences
- Keep it under 1300 characters
- Sound like you've dealt with real production issues

Topic: {topic}
Tone: {tone}

Focus on: React optimization, frontend performance, web development challenges, modern JavaScript`,
    example: `Last week, our React app was crashing under load. Users were seeing white screens, and our error monitoring was going crazy.

The culprit? A massive component re-rendering 10,000+ items on every state change.

Here's how I fixed it:

🔧 **React.memo** - Prevented unnecessary re-renders
⚡ **useMemo** - Memoized expensive calculations  
📦 **React.lazy** - Code-split heavy components
🎯 **useCallback** - Stabilized event handlers

Result: 3-second load time → 0.8 seconds ✨

The real lesson? Performance isn't just about algorithms—it's about understanding your framework's rendering behavior.

React DevTools Profiler became my best friend during this debugging session.

What's your worst React performance nightmare? How did you solve it?

#React #Frontend #Performance #WebDev #JavaScript`,
    viralScore: 9.2,
    hashtags: ['#React', '#Frontend', '#Performance', '#WebDev', '#JavaScript'],
    useCases: ['react-optimization', 'frontend-performance', 'debugging', 'production-issues', 'web-development']
  }],

  ['frontend-listicle-1', {
    id: 'frontend-listicle-1',
    name: '5 Full Stack Performance Secrets That Actually Work',
    category: 'frontend',
    style: 'listicle',
    hook: 'number',
    prompt: `You are a full-stack performance optimization expert. Write a LinkedIn post sharing 5 specific full-stack performance techniques that deliver real results.

Requirements:
- Start with a number hook (like "After optimizing 100+ full-stack applications, here are the 5 techniques...")
- Focus on FULL STACK DEVELOPMENT performance (frontend + backend)
- Each point should mention specific technologies (React, Node.js, databases, CDNs, etc.)
- Include real metrics or performance improvements
- Cover both frontend and backend optimization
- Use bullet points with emojis for readability
- Include 3-5 relevant hashtags (#FullStack #Performance #WebDev #React #NodeJS)
- End with a question about readers' biggest performance wins
- Keep it under 1300 characters
- Sound like you've optimized real production systems

Topic: {topic}
Tone: {tone}

Focus on: Full-stack performance, web optimization, React performance, backend optimization, modern web development`,
    example: `After optimizing 100+ full-stack applications, here are the 5 techniques that actually work:

🚀 **Code Splitting + Lazy Loading** - Reduced initial bundle size by 70% using React.lazy()
⚡ **Database Query Optimization** - Added proper indexing, cut API response time from 2s to 200ms
🎯 **React Memo + useMemo** - Eliminated unnecessary re-renders, improved UI responsiveness by 60%
📦 **CDN + Image Optimization** - WebP format + CloudFront = 40% faster page loads
🔄 **API Response Caching** - Redis caching reduced database load by 80%

The secret? Performance is a full-stack problem that requires full-stack solutions.

Don't just optimize the frontend—optimize the entire data flow from database to UI.

What's your biggest full-stack performance win?

#FullStack #Performance #WebDev #React #NodeJS`,
    viralScore: 8.8,
    hashtags: ['#FullStack', '#Performance', '#WebDev', '#React', '#NodeJS'],
    useCases: ['full-stack-optimization', 'performance-tuning', 'web-development', 'react-optimization', 'backend-performance']
  }],

  ['frontend-case-study-1', {
    id: 'frontend-case-study-1',
    name: 'How We Rebuilt Our Frontend Architecture',
    category: 'frontend',
    style: 'case-study',
    hook: 'achievement',
    prompt: `You are a senior full-stack developer sharing a major frontend architecture project. Write a LinkedIn post about rebuilding or modernizing a frontend application.

Requirements:
- Start with an achievement hook (like "Just finished rebuilding our entire frontend architecture...")
- Focus on FULL STACK DEVELOPMENT and modern frontend practices
- Mention specific technologies and architectural decisions
- Include the problems with the old system and benefits of the new one
- Share specific metrics or improvements achieved
- Explain the technical challenges and solutions
- Use modern frontend terminology (micro-frontends, state management, etc.)
- Include 3-5 relevant hashtags (#Frontend #Architecture #React #ModernWeb #FullStack)
- End with insights about frontend architecture decisions
- Keep it under 1300 characters
- Sound like you've led a major frontend project

Topic: {topic}
Tone: {tone}

Focus on: Frontend architecture, modern web development, React ecosystem, full-stack solutions, technical leadership`,
    example: `Just finished rebuilding our entire frontend architecture from jQuery spaghetti to a modern React ecosystem.

The old system:
❌ 500KB of jQuery plugins
❌ No state management
❌ 15-second load times
❌ Nightmare to maintain

The new architecture:
✅ **React 18** with Suspense and concurrent features
✅ **Redux Toolkit** for predictable state management
✅ **Vite** for lightning-fast builds
✅ **TypeScript** for type safety
✅ **Micro-frontend** architecture for team autonomy

Results:
- 80% faster page loads
- 90% reduction in bugs
- 3x faster development velocity
- Developer happiness through the roof

The biggest lesson? Modern frontend architecture isn't just about performance—it's about developer experience and maintainability.

What's your biggest frontend architecture win?

#Frontend #Architecture #React #ModernWeb #FullStack`,
    viralScore: 9.0,
    hashtags: ['#Frontend', '#Architecture', '#React', '#ModernWeb', '#FullStack'],
    useCases: ['frontend-architecture', 'react-migration', 'modern-web-development', 'technical-leadership', 'system-modernization']
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

  // TECH CAREER TEMPLATES (College Placements focused)
  ['career-story-1', {
    id: 'career-story-1',
    name: 'From College Rejection to Dream Job',
    category: 'tech-career',
    style: 'story',
    hook: 'struggle',
    prompt: `You are a senior engineer sharing your college placement journey and career growth story. Write a LinkedIn post about overcoming placement challenges and building a successful tech career.

Requirements:
- Start with a struggle hook (like "Got rejected from 15 companies during campus placements...")
- Focus specifically on COLLEGE PLACEMENTS and career development
- Mention specific challenges faced during placement season
- Include the journey from college to current position
- Share specific actions taken to improve and grow
- Include career milestones and progression
- Use career-focused terminology (placements, campus interviews, career growth, etc.)
- Include 3-5 relevant hashtags (#CollegePlacements #CareerGrowth #TechCareer #PlacementSeason #StudentLife)
- End with encouragement and advice for current students
- Keep it under 1300 characters
- Sound like you've been through the placement process and grown from it

Topic: {topic}
Tone: {tone}

Focus on: College placement experiences, career progression, student challenges, professional growth`,
    example: `Got rejected from 15 companies during campus placements. My confidence was shattered.

While my friends were celebrating job offers, I was questioning if I was cut out for tech.

Here's what changed everything:

📚 **Focused on fundamentals** - Spent 6 months mastering DSA instead of just memorizing solutions
🏗️ **Built real projects** - Created a full-stack app that solved an actual problem
🤝 **Found mentors** - Reached out to seniors who guided my learning path
💪 **Practiced consistently** - 2 hours daily of coding, no exceptions

Fast forward 3 years: I'm now a senior engineer at a top tech company, and I mentor students going through the same struggle.

The rejections weren't failures—they were redirections toward becoming a better engineer.

To all students facing placement challenges: Your timeline is not everyone's timeline.

What's your biggest placement season lesson?

#CollegePlacements #CareerGrowth #TechCareer #PlacementSeason #StudentLife`,
    viralScore: 9.3,
    hashtags: ['#CollegePlacements', '#CareerGrowth', '#TechCareer', '#PlacementSeason', '#StudentLife'],
    useCases: ['college-placements', 'career-journey', 'student-struggles', 'professional-growth', 'placement-advice']
  }],

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

  ['career-achievement-2', {
    id: 'career-achievement-2',
    name: 'How I Cracked My Dream Company During Placements',
    category: 'tech-career',
    style: 'achievement',
    hook: 'achievement',
    prompt: `You are a successful engineer sharing your college placement success story. Write a LinkedIn post about landing your dream job during campus placements.

Requirements:
- Start with an achievement hook (like "Just landed my dream job at [Company] during campus placements...")
- Focus specifically on COLLEGE PLACEMENTS and campus recruitment
- Share the specific preparation strategy and timeline
- Include the challenges faced and how you overcame them
- Mention specific resources, practice platforms, and preparation methods
- Share the interview process and key moments
- Use placement-focused terminology (campus recruitment, placement season, etc.)
- Include 3-5 relevant hashtags (#CollegePlacements #CampusRecruitment #PlacementSuccess #DreamJob #StudentLife)
- End with advice and encouragement for current students
- Keep it under 1300 characters
- Sound like you've recently been through the placement process

Topic: {topic}
Tone: {tone}

Focus on: Placement success, campus recruitment, student preparation, interview success, career achievement`,
    example: `Just landed my dream job at Google during campus placements! 🎉

6 months ago, I was struggling with basic DSA problems. Here's how I turned it around:

📚 **Structured Learning Path**:
- 3 months of DSA fundamentals (LeetCode Easy → Medium)
- 2 months of system design basics
- 1 month of mock interviews and company-specific prep

🎯 **Daily Routine**:
- 2 hours coding practice (morning)
- 1 hour system design study (evening)
- Weekend mock interviews with seniors

🔑 **Game Changers**:
- Consistent daily practice (no zero days)
- Focus on understanding patterns, not memorizing solutions
- Mock interviews with placement cell seniors

The Google interview had 4 rounds: 2 coding, 1 system design, 1 behavioral. The key was staying calm and thinking out loud.

To current students: Start early, stay consistent, and don't give up. Your dream company is waiting for you!

What's your placement preparation strategy?

#CollegePlacements #CampusRecruitment #PlacementSuccess #DreamJob #StudentLife`,
    viralScore: 9.2,
    hashtags: ['#CollegePlacements', '#CampusRecruitment', '#PlacementSuccess', '#DreamJob', '#StudentLife'],
    useCases: ['placement-success', 'campus-recruitment', 'google-placement', 'student-achievement', 'placement-preparation']
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

  // CS CONCEPTS TEMPLATES (DSA-focused)
  ['cs-story-1', {
    id: 'cs-story-1',
    name: 'The Algorithm That Saved My Interview',
    category: 'cs-concepts',
    style: 'story',
    hook: 'time-based',
    prompt: `You are a senior software engineer sharing a specific DSA problem-solving experience. Write a LinkedIn post about a challenging algorithm or data structure problem you encountered.

Requirements:
- Start with a time hook (like "Yesterday, I solved a problem that reminded me why I love algorithms...")
- Focus specifically on DATA STRUCTURES AND ALGORITHMS
- Mention specific algorithms (like Dynamic Programming, Graph Traversal, Binary Search, etc.)
- Include the problem statement or scenario
- Explain your approach and the key insight
- Share the time/space complexity improvement
- Use technical terms appropriately but keep it accessible
- Include 3-5 relevant hashtags (#DSA #Algorithms #DataStructures #ProblemSolving #LeetCode)
- End with a question about others' favorite algorithmic challenges
- Keep it under 1300 characters
- Sound like you genuinely enjoy solving algorithmic problems

Topic: {topic}
Tone: {tone}

Focus on: Algorithms, Data Structures, Problem Solving, Coding Interviews, Competitive Programming`,
    example: `Yesterday, I solved a problem that reminded me why I love algorithms.

The challenge: Find the shortest path in a weighted graph with negative edges.

My first instinct was Dijkstra's algorithm, but it fails with negative weights. Then I remembered Bellman-Ford!

The beauty of Bellman-Ford:
- Handles negative weights gracefully
- Detects negative cycles
- O(V*E) complexity but guaranteed correctness

Key insight: Sometimes the "slower" algorithm is actually the right choice.

This reminded me that in DSA, understanding the constraints and edge cases is as important as knowing the algorithms themselves.

What's your favorite graph algorithm? Have you ever been surprised by which algorithm worked best?

#DSA #Algorithms #DataStructures #GraphTheory #ProblemSolving`,
    viralScore: 8.8,
    hashtags: ['#DSA', '#Algorithms', '#DataStructures', '#GraphTheory', '#ProblemSolving'],
    useCases: ['algorithms', 'data-structures', 'problem-solving', 'interview-prep', 'competitive-programming']
  }],

  ['cs-question-1', {
    id: 'cs-question-1',
    name: 'The DSA Problem That Stumped Everyone',
    category: 'cs-concepts',
    style: 'question',
    hook: 'question',
    prompt: `You are a senior engineer sharing a challenging DSA problem. Write a LinkedIn post presenting a specific algorithmic challenge and your solution approach.

Requirements:
- Start with an intriguing algorithmic question
- Present a specific DSA problem (arrays, trees, graphs, dynamic programming, etc.)
- Explain the naive approach and its limitations
- Share the optimized solution with time/space complexity
- Include the key algorithmic insight or pattern
- Use proper DSA terminology (Big O, recursion, memoization, etc.)
- Include 3-5 relevant hashtags (#Algorithms #DataStructures #DSA #CodingInterview #LeetCode)
- End with a question encouraging others to share their approach
- Keep it under 1300 characters
- Sound like you're genuinely curious about different solutions

Topic: {topic}
Tone: {tone}

Focus on: Specific algorithmic problems, optimization techniques, complexity analysis, coding patterns`,
    example: `Here's a DSA problem that stumped our entire team during code review:

"Given an array of integers, find the maximum sum of non-adjacent elements."

Sounds simple, right? But the constraints were brutal: array size up to 10^6.

Naive approach: Generate all subsequences → O(2^n) 💀

The breakthrough came when I realized this is a classic DP problem:
- dp[i] = max(dp[i-1], dp[i-2] + arr[i])
- Space optimized: just track last two values

Result: O(n) time, O(1) space ✨

The pattern? Many "selection with constraints" problems are actually DP in disguise.

How would you approach this problem? What's your favorite DP optimization trick?

#Algorithms #DynamicProgramming #DSA #CodingInterview #OptimizationTechniques`,
    viralScore: 8.7,
    hashtags: ['#Algorithms', '#DynamicProgramming', '#DSA', '#CodingInterview', '#OptimizationTechniques'],
    useCases: ['algorithms', 'dynamic-programming', 'problem-solving', 'optimization', 'interview-prep']
  }],

  ['cs-listicle-1', {
    id: 'cs-listicle-1',
    name: '5 DSA Concepts Every Developer Must Master',
    category: 'cs-concepts',
    style: 'listicle',
    hook: 'number',
    prompt: `You are a senior engineer sharing essential DSA concepts. Write a LinkedIn post listing the most important data structures and algorithms every developer should know.

Requirements:
- Start with a number hook (like "After 1000+ LeetCode problems, here are the 5 DSA concepts...")
- Focus on FUNDAMENTAL data structures and algorithms
- Each point should mention specific DSA concepts (Hash Tables, Binary Trees, Graph Algorithms, etc.)
- Include practical applications and when to use each
- Mention time/space complexity where relevant
- Use bullet points with emojis for readability
- Include 3-5 relevant hashtags (#DSA #Algorithms #DataStructures #CodingInterview #TechFundamentals)
- End with a question about which concept readers find most challenging
- Keep it under 1300 characters
- Sound like you've mastered these concepts through practice

Topic: {topic}
Tone: {tone}

Focus on: Core DSA concepts, practical applications, interview preparation, foundational knowledge`,
    example: `After solving 1000+ LeetCode problems, here are the 5 DSA concepts that matter most:

🔍 **Hash Tables** - O(1) lookups, perfect for frequency counting and caching
🌳 **Binary Trees** - Master traversals (in/pre/post-order) and tree manipulation
📊 **Dynamic Programming** - Break down complex problems into overlapping subproblems
🔗 **Graph Algorithms** - BFS/DFS are your bread and butter for connectivity problems
⚡ **Two Pointers** - Optimize array/string problems from O(n²) to O(n)

The secret? These 5 patterns solve 80% of coding interview problems.

Master these fundamentals before diving into advanced topics like segment trees or suffix arrays.

Which DSA concept took you the longest to truly understand?

#DSA #Algorithms #DataStructures #CodingInterview #TechFundamentals`,
    viralScore: 9.1,
    hashtags: ['#DSA', '#Algorithms', '#DataStructures', '#CodingInterview', '#TechFundamentals'],
    useCases: ['dsa-fundamentals', 'interview-prep', 'learning-path', 'coding-patterns', 'algorithm-mastery']
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

  // INTERVIEW PREP TEMPLATES (Interview Preparation focused)
  ['interview-story-1', {
    id: 'interview-story-1',
    name: 'The Google Interview Question That Changed My Approach',
    category: 'interview-prep',
    style: 'story',
    hook: 'time-based',
    prompt: `You are a senior engineer sharing a specific technical interview experience. Write a LinkedIn post about a challenging interview question and the lessons learned.

Requirements:
- Start with a time hook (like "During my Google interview, I was asked...")
- Focus specifically on INTERVIEW PREPARATION and technical interviews
- Mention specific interview types (coding, system design, behavioral)
- Include the actual question or problem you were asked
- Explain your thought process and approach
- Share what you learned about interview strategy
- Include preparation tips and resources
- Use interview-specific terminology (whiteboarding, pair programming, etc.)
- Include 3-5 relevant hashtags (#InterviewPrep #CodingInterview #TechInterview #CareerGrowth #SoftwareEngineering)
- End with a question about others' interview experiences
- Keep it under 1300 characters
- Sound like you've been through multiple technical interviews

Topic: {topic}
Tone: {tone}

Focus on: Interview strategies, technical problem-solving, preparation techniques, interview mindset`,
    example: `During my Google interview, I was asked: "Design a system to handle 1 billion daily active users."

My first instinct was to jump into databases and load balancers. Big mistake.

The interviewer stopped me: "What questions would you ask first?"

That's when it clicked. System design interviews aren't about showing off your knowledge—they're about demonstrating your thought process.

Here's what I learned:
🤔 **Ask clarifying questions first** - What are the core features? What's the scale?
📊 **Start with requirements** - Functional and non-functional
🏗️ **Begin simple, then scale** - Don't over-engineer from the start
💬 **Think out loud** - The interviewer wants to see your reasoning

I didn't get that job, but this experience transformed how I approach technical interviews.

What's the most valuable interview lesson you've learned?

#InterviewPrep #SystemDesign #TechInterview #CareerGrowth #SoftwareEngineering`,
    viralScore: 9.0,
    hashtags: ['#InterviewPrep', '#SystemDesign', '#TechInterview', '#CareerGrowth', '#SoftwareEngineering'],
    useCases: ['interview-preparation', 'system-design', 'technical-interviews', 'career-advice', 'interview-strategy']
  }],

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
  }],

  ['interview-listicle-2', {
    id: 'interview-listicle-2',
    name: '7 Interview Red Flags That Cost Me Job Offers',
    category: 'interview-prep',
    style: 'listicle',
    hook: 'number',
    prompt: `You are a senior engineer sharing interview preparation lessons. Write a LinkedIn post about specific interview mistakes and how to avoid them.

Requirements:
- Start with a number hook (like "After 100+ technical interviews, here are the 7 red flags...")
- Focus specifically on INTERVIEW PREPARATION and common mistakes
- Each point should be a specific interview mistake with explanation
- Include actionable advice for avoiding each mistake
- Cover different types of interviews (coding, system design, behavioral)
- Use bullet points with emojis for readability
- Include 3-5 relevant hashtags (#InterviewPrep #TechInterview #CodingInterview #CareerAdvice #SoftwareEngineering)
- End with a question about readers' interview experiences
- Keep it under 1300 characters
- Sound like you've learned from these mistakes through experience

Topic: {topic}
Tone: {tone}

Focus on: Interview mistakes, preparation strategies, technical interview skills, career advice, interview mindset`,
    example: `After 100+ technical interviews, here are the 7 red flags that cost me job offers:

🚫 **Jumping to code without understanding the problem** - Always clarify requirements first
🚫 **Not testing my solution** - Walk through examples, catch edge cases
🚫 **Optimizing before getting a working solution** - Brute force first, optimize later
🚫 **Not communicating my thought process** - Think out loud, even if it feels awkward
🚫 **Forgetting to ask questions** - Show genuine interest in the role and company
🚫 **Not preparing for behavioral questions** - Have STAR method examples ready
🚫 **Giving up when stuck** - Ask for hints, show your problem-solving process

The biggest lesson? Interviews are about demonstrating your thinking process, not just getting the right answer.

Practice these fundamentals more than advanced algorithms.

What interview mistake taught you the most?

#InterviewPrep #TechInterview #CodingInterview #CareerAdvice #SoftwareEngineering`,
    viralScore: 8.9,
    hashtags: ['#InterviewPrep', '#TechInterview', '#CodingInterview', '#CareerAdvice', '#SoftwareEngineering'],
    useCases: ['interview-preparation', 'coding-interviews', 'interview-mistakes', 'career-advice', 'technical-skills']
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