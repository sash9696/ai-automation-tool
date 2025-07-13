import { postsApi } from './api';
import { 
  POST_TEMPLATES, 
  getTemplatesByCategory, 
  getTopTemplates as getTopTemplatesFromConstants
} from '../constants/postTemplates';
import type { PostTemplate } from '../constants/postTemplates';
import type { Post, PostTopic, GeneratePostRequest } from '../types';

// Define missing types
type TemplateCategory = string;
type TemplateStyle = string;

// Queue for tracking and rotating templates to avoid repeat generation
class TemplateQueue {
  private queue: string[] = [];
  private maxSize: number;

  constructor(maxSize: number = 20) {
    this.maxSize = maxSize;
  }

  enqueue(templateId: string): void {
    this.queue.push(templateId);
    if (this.queue.length > this.maxSize) {
      this.queue.shift();
    }
  }

  hasBeenUsedRecently(templateId: string): boolean {
    return this.queue.includes(templateId);
  }

  getRecentlyUsed(): string[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }
}

// Set for avoiding duplicates in generated content
class ContentSet {
  private contentHashes: Set<string> = new Set();

  add(content: string): boolean {
    const hash = this.hashContent(content);
    if (this.contentHashes.has(hash)) {
      return false; // Duplicate
    }
    this.contentHashes.add(hash);
    return true; // New content
  }

  private hashContent(content: string): string {
    // Simple hash function for content similarity
    return content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  clear(): void {
    this.contentHashes.clear();
  }
}

// Stack for enabling undo-like editing or preview rollback
class PreviewStack {
  private stack: Post[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  push(post: Post): void {
    this.stack.push(post);
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    }
  }

  pop(): Post | undefined {
    return this.stack.pop();
  }

  peek(): Post | undefined {
    return this.stack[this.stack.length - 1];
  }

  clear(): void {
    this.stack = [];
  }

  getHistory(): Post[] {
    return [...this.stack];
  }
}

// Main Post Generator Service
export class PostGeneratorService {
  private templateQueue: TemplateQueue;
  private contentSet: ContentSet;
  private previewStack: PreviewStack;

  constructor() {
    this.templateQueue = new TemplateQueue();
    this.contentSet = new ContentSet();
    this.previewStack = new PreviewStack();
  }

  /**
   * Generate a post using intelligent template selection and OpenAI
   */
  async generatePost(request: GeneratePostRequest): Promise<Post> {
    try {
      // 1. Select the best template based on user preferences
      const template = this.selectOptimalTemplate(request);
      
      // 2. Create a world-class prompt for OpenAI
      const prompt = this.createOpenAIPrompt(template, request);
      
      // 3. Generate content using OpenAI via backend
      const generatedContent = await this.callOpenAI(prompt, request);
      
      // 4. Create the post object
      const post: Post = {
        id: Date.now().toString(),
        content: generatedContent,
        topic: request.topic,
        tone: request.tone,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 5. Track template usage and content
      this.templateQueue.enqueue(template.id);
      this.contentSet.add(generatedContent);
      this.previewStack.push(post);

      return post;
    } catch (error) {
      console.error('Post generation failed:', error);
      throw new Error('Failed to generate post');
    }
  }

  /**
   * Select the optimal template based on user preferences and usage history
   */
  private selectOptimalTemplate(request: GeneratePostRequest): PostTemplate {
    const { topic, selectedTemplate } = request;
    
    // Map frontend topics to template categories - this should take priority
    const topicToCategory: Record<PostTopic, TemplateCategory> = {
      'fullstack': 'frontend',
      'dsa': 'cs-concepts',
      'interview': 'interview-prep',
      'placement': 'tech-career'
    };
    
    // Use topic-based mapping first, then fall back to selectedTemplate if no topic mapping exists
    let category: TemplateCategory;
    if (topicToCategory[topic]) {
      category = topicToCategory[topic];
    } else {
      category = 'frontend'; // Default fallback
    }

    // If a specific template is selected, use it directly
    if (selectedTemplate) {
      const template = this.getTemplateById(selectedTemplate);
      if (template) {
        return template;
      }
    }

    let availableTemplates = getTemplatesByCategory(category);

    // Filter out recently used templates
    availableTemplates = availableTemplates.filter(
      template => !this.templateQueue.hasBeenUsedRecently(template.id)
    );

    // If all templates in category have been used recently, expand search
    if (availableTemplates.length === 0) {
      availableTemplates = Array.from(POST_TEMPLATES.values()).filter(
        template => !this.templateQueue.hasBeenUsedRecently(template.id)
      );
    }

    // If still no templates available, clear queue and use any template
    if (availableTemplates.length === 0) {
      this.templateQueue.clear();
      availableTemplates = getTemplatesByCategory(category);
    }

    // Select template with most viral elements
    const bestTemplate = availableTemplates.reduce((best, current) => {
      const bestScore = best.viralElements.length + best.engagementTriggers.length;
      const currentScore = current.viralElements.length + current.engagementTriggers.length;
      return currentScore > bestScore ? current : best;
    });

    return bestTemplate;
  }

  /**
   * Create a world-class prompt for OpenAI based on template and user preferences
   */
  private createOpenAIPrompt(template: PostTemplate, request: GeneratePostRequest): string {
    const { topic, tone, includeHashtags, includeCTA } = request;
    
    // Create base prompt from template content and structure
    let prompt = `You are a senior software engineer creating viral LinkedIn content. Write a post based on this template:

Template: ${template.name}
Style: ${template.style}
Category: ${template.category}
Structure: ${template.structure}
Viral Elements: ${template.viralElements.join(', ')}
Target Audience: ${template.targetAudience}

Content Example:
${template.content}

Topic: ${this.getTopicDisplayName(topic)}
Tone: ${tone || 'professional'}`;
    
    // Add additional instructions based on user preferences
    const additionalInstructions: string[] = [];
    
    if (includeHashtags) {
      additionalInstructions.push('- Include 3-5 relevant hashtags at the end');
    }
    
    if (includeCTA) {
      additionalInstructions.push('- End with a compelling call-to-action that encourages engagement');
    }
    
    if (additionalInstructions.length > 0) {
      prompt += '\n\nAdditional Requirements:\n' + additionalInstructions.join('\n');
    }
    
    // Add quality assurance instructions
    prompt += `

Quality Requirements:
- Sound like a real senior engineer with 10+ years of experience
- Use specific, actionable insights
- Include real technical details when relevant
- Write in a conversational, authentic tone
- Avoid generic or overly formal language
- Make it engaging and shareable for the tech community

Remember: This should read like a post from someone who has actually lived these experiences.`;

    return prompt;
  }

  /**
   * Call OpenAI via backend API
   */
  private async callOpenAI(prompt: string, request: GeneratePostRequest): Promise<string> {
    try {
      // Use the existing backend API with enhanced request
      const enhancedRequest = {
        ...request,
        prompt, // Include our custom prompt
        useCustomPrompt: true, // Flag to indicate we're using a custom prompt
      };
      
      const post = await postsApi.generate(enhancedRequest);
      
      return post.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error('Failed to generate content with AI');
    }
  }

  /**
   * Regenerate post with different template
   */
  async regeneratePost(request: GeneratePostRequest): Promise<Post> {
    // Force different template selection by temporarily marking all as used
    const currentTemplates = this.templateQueue.getRecentlyUsed();
    
    // Clear queue to allow template reuse
    this.templateQueue.clear();
    
    // Generate new post
    const newPost = await this.generatePost(request);
    
    // Restore queue state
    currentTemplates.forEach(templateId => {
      this.templateQueue.enqueue(templateId);
    });
    
    return newPost;
  }

  /**
   * Get post history for undo functionality
   */
  getPostHistory(): Post[] {
    return this.previewStack.getHistory();
  }

  /**
   * Undo last generation (rollback to previous post)
   */
  undoLastGeneration(): Post | undefined {
    return this.previewStack.pop();
  }

  /**
   * Get available templates for UI
   */
  getAvailableTemplates(category?: TemplateCategory, style?: TemplateStyle): PostTemplate[] {
    let templates = POST_TEMPLATES;
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    if (style) {
      templates = templates.filter(t => t.style === style);
    }
    
    return templates;
  }

  /**
   * Get top performing templates
   */
  getTopTemplates(limit: number = 5): PostTemplate[] {
    return getTopTemplatesFromConstants(limit);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): PostTemplate | undefined {
    return POST_TEMPLATES.find(template => template.id === id);
  }

  /**
   * Analyze post readability and engagement potential
   */
  analyzePost(post: Post): {
    readabilityScore: number;
    engagementPotential: number;
    suggestions: string[];
  } {
    const content = post.content;
    
    // Simple readability analysis
    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Engagement indicators
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
    const hasQuestions = /\?/.test(content);
    const hasHashtags = /#\w+/.test(content);
    const hasNumbers = /\d+/.test(content);
    
    // Calculate scores
    const readabilityScore = Math.min(10, Math.max(1, 10 - Math.abs(avgWordsPerSentence - 15) / 2));
    const engagementScore = [hasEmojis, hasQuestions, hasHashtags, hasNumbers].filter(Boolean).length * 2.5;
    
    // Generate suggestions
    const suggestions: string[] = [];
    if (avgWordsPerSentence > 25) suggestions.push('Consider shorter sentences for better readability');
    if (!hasEmojis) suggestions.push('Add relevant emojis to increase engagement');
    if (!hasQuestions) suggestions.push('Include a question to encourage comments');
    if (!hasHashtags) suggestions.push('Add relevant hashtags for discoverability');
    
    return {
      readabilityScore: Math.round(readabilityScore * 10) / 10,
      engagementPotential: Math.min(10, engagementScore),
      suggestions
    };
  }

  /**
   * Get topic display name
   */
  private getTopicDisplayName(topic: PostTopic): string {
    const topicNames = {
      'fullstack': 'Full Stack Development',
      'dsa': 'Data Structures and Algorithms',
      'interview': 'Interview Preparation',
      'placement': 'College Placements and Career Growth'
    };
    return topicNames[topic];
  }

  /**
   * Clear all tracking data
   */
  clearHistory(): void {
    this.templateQueue.clear();
    this.contentSet.clear();
    this.previewStack.clear();
  }
}

// Export singleton instance
export const postGenerator = new PostGeneratorService();

// Export individual functions for backward compatibility
export const generatePost = (request: GeneratePostRequest) => postGenerator.generatePost(request);
export const regeneratePost = (request: GeneratePostRequest) => postGenerator.regeneratePost(request);
export const getAvailableTemplates = (category?: TemplateCategory, style?: TemplateStyle) => 
  postGenerator.getAvailableTemplates(category, style);
export const getTopTemplates = (limit?: number) => postGenerator.getTopTemplates(limit);
export const analyzePost = (post: Post) => postGenerator.analyzePost(post); 