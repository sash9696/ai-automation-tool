import { postsApi } from './api';
import type { Post, GeneratePostRequest } from '../types';

/**
 * Simple post generator that uses the new simplified backend AI service
 */
export class PostGeneratorService {
  /**
   * Generate a post using the simplified backend AI service
   */
  async generatePost(request: GeneratePostRequest): Promise<Post> {
    try {
      // Call the backend directly with simplified request
      const post = await postsApi.generate(request);
      return post;
    } catch (error) {
      console.error('Post generation failed:', error);
      throw new Error('Failed to generate post');
    }
  }

  /**
   * Regenerate post with different content
   */
  async regeneratePost(request: GeneratePostRequest): Promise<Post> {
    try {
      // Call the backend directly with simplified request
      const post = await postsApi.generate(request);
      return post;
    } catch (error) {
      console.error('Post regeneration failed:', error);
      throw new Error('Failed to regenerate post');
    }
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
}

// Export singleton instance
export const postGenerator = new PostGeneratorService();

// Export individual functions for backward compatibility
export const generatePost = (request: GeneratePostRequest) => postGenerator.generatePost(request);
export const regeneratePost = (request: GeneratePostRequest) => postGenerator.regeneratePost(request);
export const analyzePost = (post: Post) => postGenerator.analyzePost(post); 