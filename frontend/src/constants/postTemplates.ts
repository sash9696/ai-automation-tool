export interface PostTemplate {
  id: string;
  name: string;
  style: string;
  category: string;
  description: string;
  content: string;
  hashtags: string[];
  tone: string;
  structure: string;
  viralElements: string[];
  targetAudience: string;
  engagementTriggers: string[];
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "resource-curation",
    name: "Resource Curation Masterpiece",
    style: "curated-list",
    category: "learning",
    description: "Curated list of valuable resources with personal recommendations",
    content: `I would personally recommend these YouTube channels if you want to take your JavaScript, React, and project development abilities to the next level.

These channels offer a goldmine of valuable content, ranging from in-depth tutorials to hands-on project walkthroughs. 

For Concepts and Problem Solving:
[Specific channels with links]

For Creating Awesome Projects:
[Specific channels with links]`,
    hashtags: ["#javascript", "#react", "#webdevelopment", "#learning", "#resources"],
    tone: "helpful and authoritative",
    structure: "intro + categorization + specific recommendations + links",
    viralElements: ["personal recommendation", "categorized content", "actionable resources", "specific links"],
    targetAudience: "developers looking to improve skills",
    engagementTriggers: ["resource sharing", "skill development", "community building"]
  },
  {
    id: "interview-prep",
    name: "Interview Preparation Goldmine",
    style: "comprehensive-list",
    category: "career",
    description: "Comprehensive list of technical interview questions and challenges",
    content: `Important Frontend Interview Questions & Problem-Solving Challenges 🚀

Core JavaScript
[Specific questions with brief descriptions]

Arrays
[Specific array problems]

Strings
[String manipulation challenges]

Objects
[Object-oriented challenges]

Practical Applications
[Real-world scenarios]

Miscellaneous
[Advanced topics]

Bonus Tips for Interview Success:
[Actionable advice]`,
    hashtags: ["#FrontendDevelopment", "#JavaScript", "#CodingChallenges", "#InterviewPreparation", "#TechInterviews"],
    tone: "educational and encouraging",
    structure: "attention-grabbing title + categorized content + bonus tips",
    viralElements: ["comprehensive coverage", "practical examples", "bonus tips", "emoji usage"],
    targetAudience: "developers preparing for interviews",
    engagementTriggers: ["career advancement", "skill validation", "community support"]
  },
  {
    id: "framework-philosophy",
    name: "Framework Philosophy Insight",
    style: "reflective-story",
    category: "philosophy",
    description: "Deep reflection on framework choices and fundamentals",
    content: `Lately, I've noticed an interesting pattern while talking to frontend developers:

[Observation about framework pressure]

And honestly, I get it.
There's always this pressure to keep up — to jump to the next tool or framework.

But what I've come to realize (and remind myself too) is this:
It's not about the framework. It's about the fundamentals.

[Core insight about fundamentals]

So before jumping into the next shiny thing, it's worth asking:
Do I really understand the basics well enough?

That's what gives long-term confidence — not just chasing trends.`,
    hashtags: ["#Frontend", "#React", "#JavaScript", "#Angular", "#Vue", "#WebDevelopment", "#CareerAdvice"],
    tone: "reflective and philosophical",
    structure: "observation + empathy + insight + question + conclusion",
    viralElements: ["personal observation", "relatable struggle", "counter-intuitive insight", "thought-provoking question"],
    targetAudience: "developers feeling framework pressure",
    engagementTriggers: ["philosophical discussion", "career reflection", "community validation"]
  },
  {
    id: "humor-remote-work",
    name: "Remote Work Humor",
    style: "satirical-humor",
    category: "humor",
    description: "Satirical take on remote work productivity",
    content: `How to Look Busy as a Remote Developer (Even When You're Not)

1. Keep typing in Slack during calls.
Doesn't matter what you write. Even "asdf;lkj" works.

2. Schedule a "deep work" block on Google Calendar.
Then go deeply nap.

[More humorous tips]

Dinner never ends. Neither do you.`,
    hashtags: ["#remotework", "#humor", "#developerlife", "#productivity"],
    tone: "satirical and humorous",
    structure: "clickbait title + numbered list + punchline",
    viralElements: ["relatable humor", "industry-specific jokes", "punchline ending"],
    targetAudience: "remote developers",
    engagementTriggers: ["humor", "relatability", "industry culture"]
  },
  {
    id: "dsa-practical",
    name: "DSA in Real Projects",
    style: "educational-explanation",
    category: "technical",
    description: "Connecting data structures to practical React development",
    content: `Many frontend developers often wonder how Data Structures and Algorithms (DSA) relate to everyday React development. While DSA may seem abstract, they power many core features of modern applications. 

Let's explore some DSA concepts you can leverage in your React app to boost efficiency and user experience:

1. Arrays: Essential for State Management
[Practical explanation]

2. Objects & Hash Maps: Efficient Data Storage
[Real-world application]

[Continue with more examples]

💬 How have you used Data Structures in your React projects? Share your experiences or drop your thoughts in the comments! 👇`,
    hashtags: ["#DSA", "#React", "#JavaScript", "#WebDevelopment", "#Algorithms"],
    tone: "educational and engaging",
    structure: "hook + explanation + examples + call-to-action",
    viralElements: ["practical connection", "specific examples", "engagement question", "emoji usage"],
    targetAudience: "developers wanting to understand DSA applications",
    engagementTriggers: ["learning", "practical application", "community discussion"]
  },
  {
    id: "fundamentals-guide",
    name: "Fundamentals Mastery Guide",
    style: "comprehensive-guide",
    category: "learning",
    description: "Comprehensive guide to frontend fundamentals",
    content: `🚀 Want to Become a TOP Front-End Developer? Start with the FUNDAMENTALS! 🔑

1️⃣ Master CSS Basics:
[Specific details]

2️⃣ JavaScript Fundamentals:
[Core concepts]

[Continue with numbered list]

💡 Pro Tip: Master these fundamentals, and frameworks will be tools that make your job easier. The foundation you build today will set you up for success tomorrow! 🔥`,
    hashtags: ["#FrontEndDevelopment", "#WebDev", "#LearnToCode", "#JavaScript", "#CSS", "#WebDevelopment", "#DeveloperTips"],
    tone: "motivational and educational",
    structure: "attention-grabbing title + numbered list + motivational conclusion",
    viralElements: ["numbered format", "emoji usage", "motivational language", "actionable tips"],
    targetAudience: "aspiring frontend developers",
    engagementTriggers: ["skill development", "motivation", "learning path"]
  },
  {
    id: "fullstack-blueprint",
    name: "Full Stack Blueprint",
    style: "step-by-step-guide",
    category: "architecture",
    description: "Step-by-step guide to building full stack applications",
    content: `How to Build a Full Stack Product from Scratch

1. Start with Node.js and Express.
Lay a solid foundation.

2. Implement secure user access.
Use JWT for authentication and authorization.

[Continue with numbered steps]

Adapt these steps to your project's unique needs.`,
    hashtags: ["#FullStackDevelopment", "#NodeJS", "#React", "#WebDevelopment", "#Architecture"],
    tone: "practical and authoritative",
    structure: "title + numbered steps + conclusion",
    viralElements: ["step-by-step format", "specific technologies", "practical advice"],
    targetAudience: "full stack developers",
    engagementTriggers: ["skill development", "project planning", "technical discussion"]
  },
  {
    id: "code-quality",
    name: "Code Quality Advocacy",
    style: "problem-solution",
    category: "best-practices",
    description: "Advocating for coding standards and best practices",
    content: `#frontend
I've worked on codebases with over 2,000 lines of code in a single file, and it's a nightmare for new developers to navigate. It's frustrating, time-consuming, and leads to errors. 
That's why enforcing coding standards with tools like ESLint and adopting guidelines like the Airbnb Style Guide is crucial. Here's why:

[Problem statement + solution explanation]

[Benefits with specific examples]

[Call to action]

Do you follow coding standards like Airbnb's in your projects? How has it helped your team?`,
    hashtags: ["#frontend", "#codingstandards", "#eslint", "#airbnb", "#codequality"],
    tone: "advocacy and problem-solving",
    structure: "problem + solution + benefits + question",
    viralElements: ["problem identification", "specific solutions", "community question"],
    targetAudience: "developers working in teams",
    engagementTriggers: ["best practices", "team collaboration", "code quality"]
  }
];

export const getTemplateById = (id: string): PostTemplate | undefined => {
  return POST_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PostTemplate[] => {
  return POST_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateCategories = (): string[] => {
  return [...new Set(POST_TEMPLATES.map(template => template.category))];
};

export const getTopTemplates = (limit: number = 5): PostTemplate[] => {
  // Return the most viral templates based on engagement triggers and viral elements
  const topTemplates = POST_TEMPLATES
    .sort((a, b) => {
      // Sort by number of viral elements and engagement triggers
      const aScore = a.viralElements.length + a.engagementTriggers.length;
      const bScore = b.viralElements.length + b.engagementTriggers.length;
      return bScore - aScore; // Descending order
    })
    .slice(0, limit);
  
  return topTemplates;
}; 