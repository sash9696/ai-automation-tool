import { logger } from '../utils/logger.js';

// Content domains and their trending topics
const DOMAIN_CONTENT = {
  technology: [
    {
      title: "The Future of Web Development",
      topic: "Web Development Trends",
      viralScore: 95,
      resources: [
        { name: "State of JS 2024", url: "https://stateofjs.com" },
        { name: "Web.dev", url: "https://web.dev" }
      ],
      hashtags: ["#WebDev", "#TechTrends", "#FutureOfWeb", "#JavaScript", "#React", "#Vue"]
    },
    {
      title: "Why TypeScript is Taking Over",
      topic: "TypeScript Adoption",
      viralScore: 92,
      resources: [
        { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs" },
        { name: "TypeScript Playground", url: "https://www.typescriptlang.org/play" }
      ],
      hashtags: ["#TypeScript", "#JavaScript", "#Programming", "#WebDev", "#CodeQuality"]
    },
    {
      title: "Microservices vs Monoliths",
      topic: "Architecture Patterns",
      viralScore: 88,
      resources: [
        { name: "Martin Fowler on Microservices", url: "https://martinfowler.com/articles/microservices.html" },
        { name: "AWS Microservices", url: "https://aws.amazon.com/microservices" }
      ],
      hashtags: ["#Microservices", "#Architecture", "#SoftwareDesign", "#Backend", "#Scalability"]
    }
  ],
  frontend: [
    {
      title: "React 19: What's New and Exciting",
      topic: "React Updates",
      viralScore: 96,
      resources: [
        { name: "React Blog", url: "https://react.dev/blog" },
        { name: "React Documentation", url: "https://react.dev" }
      ],
      hashtags: ["#React", "#Frontend", "#JavaScript", "#WebDev", "#React19", "#UI"]
    },
    {
      title: "CSS Grid vs Flexbox: When to Use What",
      topic: "CSS Layout",
      viralScore: 89,
      resources: [
        { name: "CSS Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid" },
        { name: "Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox" }
      ],
      hashtags: ["#CSS", "#Frontend", "#WebDesign", "#CSSGrid", "#Flexbox", "#Layout"]
    },
    {
      title: "Performance Optimization Secrets",
      topic: "Frontend Performance",
      viralScore: 91,
      resources: [
        { name: "Web Performance", url: "https://web.dev/performance" },
        { name: "Lighthouse", url: "https://developers.google.com/web/tools/lighthouse" }
      ],
      hashtags: ["#Performance", "#Frontend", "#WebDev", "#Optimization", "#Speed", "#UX"]
    }
  ],
  ai: [
    {
      title: "AI in Software Development: The Revolution",
      topic: "AI Development",
      viralScore: 98,
      resources: [
        { name: "OpenAI API", url: "https://platform.openai.com" },
        { name: "GitHub Copilot", url: "https://github.com/features/copilot" }
      ],
      hashtags: ["#AI", "#SoftwareDev", "#MachineLearning", "#Coding", "#Innovation", "#Future"]
    },
    {
      title: "Prompt Engineering: The New Programming",
      topic: "Prompt Engineering",
      viralScore: 94,
      resources: [
        { name: "OpenAI Prompt Engineering", url: "https://platform.openai.com/docs/guides/prompt-engineering" },
        { name: "Prompt Engineering Guide", url: "https://www.promptingguide.ai" }
      ],
      hashtags: ["#PromptEngineering", "#AI", "#Programming", "#LLM", "#ChatGPT", "#Innovation"]
    },
    {
      title: "Building AI-Powered Applications",
      topic: "AI Applications",
      viralScore: 90,
      resources: [
        { name: "LangChain", url: "https://langchain.com" },
        { name: "Hugging Face", url: "https://huggingface.co" }
      ],
      hashtags: ["#AI", "#Applications", "#MachineLearning", "#Development", "#Innovation", "#Tech"]
    }
  ]
};

// Curated resources for each domain
const CURATED_RESOURCES = {
  technology: [
    { name: "TechCrunch", url: "https://techcrunch.com", category: "News" },
    { name: "Hacker News", url: "https://news.ycombinator.com", category: "Community" },
    { name: "Stack Overflow", url: "https://stackoverflow.com", category: "Q&A" },
    { name: "Dev.to", url: "https://dev.to", category: "Blogging" }
  ],
  frontend: [
    { name: "CSS-Tricks", url: "https://css-tricks.com", category: "CSS" },
    { name: "Smashing Magazine", url: "https://www.smashingmagazine.com", category: "Design" },
    { name: "Frontend Masters", url: "https://frontendmasters.com", category: "Learning" },
    { name: "Codrops", url: "https://tympanus.net/codrops", category: "Inspiration" }
  ],
  ai: [
    { name: "Papers With Code", url: "https://paperswithcode.com", category: "Research" },
    { name: "AI News", url: "https://artificialintelligence-news.com", category: "News" },
    { name: "Deep Learning AI", url: "https://www.deeplearning.ai", category: "Learning" },
    { name: "AI Alignment Forum", url: "https://www.alignmentforum.org", category: "Discussion" }
  ]
};

export class TrendingContentFactory {
  constructor() {
    this.contentCache = new Map();
    this.lastFetchTime = new Map();
    this.cacheDuration = 1000 * 60 * 60; // 1 hour cache
  }

  async createContent(domain) {
    try {
      // Check cache first
      if (this.isCacheValid(domain)) {
        logger.info(`📦 Using cached content for domain: ${domain}`);
        return this.contentCache.get(domain);
      }

      logger.info(`🔄 Fetching fresh content for domain: ${domain}`);
      
      // In production, this would fetch from real APIs
      // For now, use our curated content with some randomization
      const baseContent = DOMAIN_CONTENT[domain] || [];
      const curatedResources = CURATED_RESOURCES[domain] || [];
      
      // Add some randomization to make content feel fresh
      const randomizedContent = this.randomizeContent(baseContent);
      
      // Enhance with AI-generated insights
      const enhancedContent = await this.enhanceWithAI(randomizedContent, domain);
      
      // Cache the results
      this.contentCache.set(domain, enhancedContent);
      this.lastFetchTime.set(domain, Date.now());
      
      logger.info(`✅ Generated ${enhancedContent.length} trending posts for ${domain}`);
      
      return enhancedContent;
      
    } catch (error) {
      logger.error(`Failed to create content for domain ${domain}:`, error);
      
      // Fallback to static content
      return DOMAIN_CONTENT[domain] || [];
    }
  }

  isCacheValid(domain) {
    const lastFetch = this.lastFetchTime.get(domain);
    if (!lastFetch) return false;
    
    return (Date.now() - lastFetch) < this.cacheDuration;
  }

  randomizeContent(content) {
    return content.map(item => ({
      ...item,
      viralScore: item.viralScore + Math.floor(Math.random() * 10) - 5, // ±5 points
      title: this.addVariation(item.title),
      resources: this.shuffleArray([...item.resources]),
      hashtags: this.shuffleArray([...item.hashtags]).slice(0, 6)
    }));
  }

  addVariation(title) {
    const variations = [
      title,
      `${title} 🚀`,
      `${title} 💡`,
      `${title} - What You Need to Know`,
      `${title} in 2024`,
      `${title}: A Complete Guide`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async enhanceWithAI(content, domain) {
    // In production, this would call OpenAI to enhance content
    // For now, add some AI-generated insights
    return content.map(item => ({
      ...item,
      aiInsights: this.generateAIInsights(item, domain),
      engagementPrediction: this.predictEngagement(item),
      bestPostingTime: this.calculateOptimalTime(item)
    }));
  }

  generateAIInsights(item, domain) {
    const insights = {
      technology: [
        "This topic is trending due to recent industry shifts",
        "High engagement expected from developer community",
        "Perfect timing for this discussion"
      ],
      frontend: [
        "Frontend developers are actively discussing this",
        "Great for building thought leadership",
        "Timely content for current market demands"
      ],
      ai: [
        "AI community is highly engaged with this topic",
        "Perfect for establishing expertise in AI",
        "High viral potential in tech circles"
      ]
    };
    
    return insights[domain]?.[Math.floor(Math.random() * insights[domain].length)] || 
           "This content has high viral potential";
  }

  predictEngagement(item) {
    const baseEngagement = item.viralScore * 10;
    const variation = Math.floor(Math.random() * 200) - 100;
    return Math.max(100, baseEngagement + variation);
  }

  calculateOptimalTime(item) {
    // Simple algorithm: higher viral score = earlier in the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = Math.floor((100 - item.viralScore) / 15);
    return {
      day: days[dayIndex % 7],
      time: '09:00',
      timezone: 'UTC'
    };
  }

  getCuratedResources(domain) {
    return CURATED_RESOURCES[domain] || [];
  }

  getSupportedDomains() {
    return Object.keys(DOMAIN_CONTENT);
  }
} 