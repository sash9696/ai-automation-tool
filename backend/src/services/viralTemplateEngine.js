import { logger } from '../utils/logger.js';

// Viral templates with proven engagement patterns
const VIRAL_TEMPLATES = {
  viral: {
    name: "Viral Hook Template",
    pattern: "hook + story + insight + cta",
    engagementScore: 95,
    apply: (content) => {
      const hooks = [
        `🚀 ${content.title}`,
        `💡 The ${content.topic} secret nobody talks about`,
        `🔥 Why ${content.topic} is changing everything`,
        `⚡ ${content.title} - This will blow your mind`,
        `🎯 The ${content.topic} revolution is here`
      ];
      
      const hook = hooks[Math.floor(Math.random() * hooks.length)];
      
      return {
        ...content,
        formattedContent: `${hook}

${content.aiInsights || "This is game-changing content that every developer should know about."}

🔗 Key Resources:
${content.resources.map(r => `• ${r.name}: ${r.url}`).join('\n')}

💭 What's your take on this? Drop your thoughts below! 👇

${content.hashtags.join(' ')}`,
        template: 'viral',
        estimatedEngagement: content.engagementPrediction || 850,
        viralPotential: content.viralScore
      };
    }
  },
  
  story: {
    name: "Story-Driven Template",
    pattern: "personal story + lesson + application",
    engagementScore: 88,
    apply: (content) => {
      const stories = {
        technology: "I remember when I first discovered this technology. It completely changed how I approach development.",
        frontend: "After struggling with this for months, I finally found the solution that transformed my workflow.",
        ai: "When I started exploring AI in development, I never expected it to revolutionize my entire process."
      };
      
      const story = stories[content.topic.toLowerCase()] || "This discovery completely changed my perspective on development.";
      
      return {
        ...content,
        formattedContent: `${content.title}

${story}

Here's what I learned:
• The key insight that made all the difference
• How this applies to real-world projects
• Why this matters for your career

📚 Deep Dive Resources:
${content.resources.map(r => `• ${r.name}: ${r.url}`).join('\n')}

What's your experience with ${content.topic.toLowerCase()}? Share your story! 💬

${content.hashtags.join(' ')}`,
        template: 'story',
        estimatedEngagement: content.engagementPrediction || 720,
        viralPotential: content.viralScore
      };
    }
  },
  
  educational: {
    name: "Educational Value Template",
    pattern: "problem + solution + resources + discussion",
    engagementScore: 92,
    apply: (content) => {
      return {
        ...content,
        formattedContent: `📚 ${content.title}

The Problem:
Many developers struggle with ${content.topic.toLowerCase()} because they don't have the right resources or approach.

The Solution:
Here's a comprehensive approach that has worked for me and countless others:

✅ Step-by-step methodology
✅ Proven best practices
✅ Real-world applications

🎯 Essential Resources:
${content.resources.map(r => `• ${r.name}: ${r.url}`).join('\n')}

💡 Pro Tip: ${content.aiInsights || "Focus on practical application over theory."}

What challenges have you faced with ${content.topic.toLowerCase()}? Let's discuss solutions! 🤔

${content.hashtags.join(' ')}`,
        template: 'educational',
        estimatedEngagement: content.engagementPrediction || 780,
        viralPotential: content.viralScore
      };
    }
  },
  
  controversy: {
    name: "Controversial Take Template",
    pattern: "controversial statement + reasoning + discussion",
    engagementScore: 98,
    apply: (content) => {
      const controversialTakes = {
        technology: "Most developers are doing this wrong, and here's why.",
        frontend: "The frontend community is missing a crucial point about this.",
        ai: "The AI revolution is happening faster than most developers realize."
      };
      
      const take = controversialTakes[content.topic.toLowerCase()] || "The industry is approaching this all wrong.";
      
      return {
        ...content,
        formattedContent: `🔥 HOT TAKE: ${content.title}

${take}

Here's my reasoning:
• Why the current approach is flawed
• What we should be doing instead
• The evidence that supports this

📖 Supporting Resources:
${content.resources.map(r => `• ${r.name}: ${r.url}`).join('\n')}

💭 I know this might be controversial, but I'd love to hear your thoughts. What do you think? 

${content.hashtags.join(' ')}`,
        template: 'controversy',
        estimatedEngagement: content.engagementPrediction || 950,
        viralPotential: content.viralScore
      };
    }
  },
  
  listicle: {
    name: "Listicle Template",
    pattern: "numbered list + explanations + resources",
    engagementScore: 85,
    apply: (content) => {
      const listItems = [
        "The fundamental concept you need to understand",
        "Common mistakes and how to avoid them",
        "Advanced techniques for power users",
        "Tools and resources to accelerate your learning",
        "Real-world applications and case studies"
      ];
      
      return {
        ...content,
        formattedContent: `📋 ${content.title}: 5 Things You Need to Know

${listItems.map((item, index) => `${index + 1}. ${item}`).join('\n\n')}

🔗 Essential Resources:
${content.resources.map(r => `• ${r.name}: ${r.url}`).join('\n')}

💡 ${content.aiInsights || "Master these fundamentals and you'll be ahead of 90% of developers."}

Which of these resonates most with you? Share your experience! 👇

${content.hashtags.join(' ')}`,
        template: 'listicle',
        estimatedEngagement: content.engagementPrediction || 680,
        viralPotential: content.viralScore
      };
    }
  }
};

export class ViralTemplateEngine {
  constructor() {
    this.templates = VIRAL_TEMPLATES;
    this.templateStats = new Map();
  }

  applyTemplate(content, templateType = 'viral') {
    try {
      const template = this.templates[templateType];
      
      if (!template) {
        logger.warn(`Template ${templateType} not found, using viral template`);
        return this.templates.viral.apply(content);
      }
      
      logger.info(`🎨 Applying ${template.name} to content: ${content.title}`);
      
      const result = template.apply(content);
      
      // Track template usage for analytics
      this.trackTemplateUsage(templateType, result.estimatedEngagement);
      
      return result;
      
    } catch (error) {
      logger.error('Template application failed:', error);
      
      // Fallback to basic formatting
      return {
        ...content,
        formattedContent: `${content.title}\n\n${content.aiInsights || ''}\n\n${content.hashtags.join(' ')}`,
        template: 'fallback',
        estimatedEngagement: 500,
        viralPotential: content.viralScore
      };
    }
  }

  applyBestTemplate(content) {
    // Analyze content and select the best template
    const templateScores = Object.entries(this.templates).map(([type, template]) => ({
      type,
      score: this.calculateTemplateScore(content, template)
    }));
    
    const bestTemplate = templateScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return this.applyTemplate(content, bestTemplate.type);
  }

  calculateTemplateScore(content, template) {
    let score = template.engagementScore;
    
    // Adjust based on content characteristics
    if (content.viralScore > 90) score += 10;
    if (content.resources.length > 2) score += 5;
    if (content.hashtags.length > 4) score += 3;
    
    // Domain-specific adjustments
    const domainMultipliers = {
      technology: 1.0,
      frontend: 1.05,
      ai: 1.1
    };
    
    score *= domainMultipliers[content.topic.toLowerCase()] || 1.0;
    
    return score;
  }

  trackTemplateUsage(templateType, engagement) {
    if (!this.templateStats.has(templateType)) {
      this.templateStats.set(templateType, {
        usageCount: 0,
        totalEngagement: 0,
        averageEngagement: 0
      });
    }
    
    const stats = this.templateStats.get(templateType);
    stats.usageCount++;
    stats.totalEngagement += engagement;
    stats.averageEngagement = stats.totalEngagement / stats.usageCount;
  }

  getTemplateAnalytics() {
    const analytics = {};
    
    for (const [templateType, stats] of this.templateStats) {
      analytics[templateType] = {
        ...stats,
        effectiveness: stats.averageEngagement / 1000 // Normalize to 0-1 scale
      };
    }
    
    return analytics;
  }

  getAvailableTemplates() {
    return Object.keys(this.templates).map(type => ({
      type,
      name: this.templates[type].name,
      pattern: this.templates[type].pattern,
      engagementScore: this.templates[type].engagementScore
    }));
  }

  // A/B testing for template optimization
  applyABTest(content) {
    const templates = ['viral', 'controversy', 'educational'];
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      ...this.applyTemplate(content, selectedTemplate),
      abTestGroup: selectedTemplate
    };
  }

  // Generate multiple variations for testing
  generateVariations(content, count = 3) {
    const variations = [];
    const templateTypes = Object.keys(this.templates);
    
    for (let i = 0; i < count; i++) {
      const templateType = templateTypes[i % templateTypes.length];
      variations.push(this.applyTemplate(content, templateType));
    }
    
    return variations;
  }
} 