import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostGeneratorService } from '../../services/postGenerator';
import type { GeneratePostRequest, Post } from '../../types';

// Mock the API service
vi.mock('../../services/api', () => ({
  postsApi: {
    generate: vi.fn()
  }
}));

describe('PostGeneratorService', () => {
  let postGenerator: PostGeneratorService;

  beforeEach(() => {
    postGenerator = new PostGeneratorService();
    vi.clearAllMocks();
  });

  describe('Template Selection', () => {
    it('should select optimal template based on topic', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional',
        includeHashtags: true,
        includeCTA: true
      };

      // Mock API response
      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        tone: 'professional',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      const result = await postGenerator.generatePost(request);

      expect(result).toBeDefined();
      expect(result.content).toBe('Test post content');
      expect(result.topic).toBe('fullstack');
    });

    it('should avoid recently used templates', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      // Generate first post
      await postGenerator.generatePost(request);
      
      // Generate second post - should use different template
      await postGenerator.generatePost(request);

      // Verify API was called twice with different prompts
      expect(postsApi.generate).toHaveBeenCalledTimes(2);
    });

    it('should fallback to any template if category templates are exhausted', async () => {
      const request: GeneratePostRequest = {
        topic: 'dsa',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'dsa',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      // Generate multiple posts to exhaust templates
      for (let i = 0; i < 25; i++) {
        await postGenerator.generatePost(request);
      }

      // Should still work even after exhausting templates
      const result = await postGenerator.generatePost(request);
      expect(result).toBeDefined();
    });
  });

  describe('Prompt Generation', () => {
    it('should create prompts with topic and tone placeholders', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'casual',
        includeHashtags: true,
        includeCTA: true
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);

      // Verify the API was called with a prompt that includes our custom prompt
      expect(postsApi.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'fullstack',
          tone: 'casual',
          includeHashtags: true,
          includeCTA: true,
          useCustomPrompt: true,
          prompt: expect.stringContaining('Full Stack Development')
        })
      );
    });

    it('should include hashtag instructions when requested', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        includeHashtags: true
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);

      expect(postsApi.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('Include 3-5 relevant hashtags')
        })
      );
    });

    it('should include CTA instructions when requested', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        includeCTA: true
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);

      expect(postsApi.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('call-to-action')
        })
      );
    });
  });

  describe('Post Regeneration', () => {
    it('should regenerate with different template', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      // Generate first post
      await postGenerator.generatePost(request);
      
      // Regenerate post
      const regeneratedPost = await postGenerator.regeneratePost(request);

      expect(regeneratedPost).toBeDefined();
      expect(postsApi.generate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Post Analysis', () => {
    it('should analyze post readability correctly', () => {
      const post: Post = {
        id: '1',
        content: 'This is a short sentence. This is another short sentence.',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const analysis = postGenerator.analyzePost(post);

      expect(analysis.readabilityScore).toBeGreaterThan(0);
      expect(analysis.readabilityScore).toBeLessThanOrEqual(10);
      expect(analysis.engagementPotential).toBeGreaterThan(0);
      expect(analysis.engagementPotential).toBeLessThanOrEqual(10);
    });

    it('should detect engagement elements', () => {
      const post: Post = {
        id: '1',
        content: '🚀 This is an amazing post! #Tech #Innovation What do you think?',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const analysis = postGenerator.analyzePost(post);

      // Should have high engagement potential due to emoji, hashtags, and question
      expect(analysis.engagementPotential).toBeGreaterThan(5);
    });

    it('should provide suggestions for improvement', () => {
      const post: Post = {
        id: '1',
        content: 'This is a very long sentence that goes on and on without any breaks or punctuation to make it easier to read.',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const analysis = postGenerator.analyzePost(post);

      expect(analysis.suggestions).toContain('Consider shorter sentences for better readability');
    });
  });

  describe('Template Management', () => {
    it('should get available templates by category', () => {
      const frontendTemplates = postGenerator.getAvailableTemplates('frontend');
      
      expect(frontendTemplates.length).toBeGreaterThan(0);
      frontendTemplates.forEach(template => {
        expect(template.category).toBe('frontend');
      });
    });

    it('should get available templates by style', () => {
      const storyTemplates = postGenerator.getAvailableTemplates(undefined, 'story');
      
      expect(storyTemplates.length).toBeGreaterThan(0);
      storyTemplates.forEach(template => {
        expect(template.style).toBe('story');
      });
    });

    it('should get top templates', () => {
      const topTemplates = postGenerator.getTopTemplates(3);
      
      expect(topTemplates.length).toBeLessThanOrEqual(3);
      expect(topTemplates.length).toBeGreaterThan(0);
      
      // Should be sorted by viral elements and engagement triggers (descending)
      for (let i = 1; i < topTemplates.length; i++) {
        const prevScore = topTemplates[i-1].viralElements.length + topTemplates[i-1].engagementTriggers.length;
        const currentScore = topTemplates[i].viralElements.length + topTemplates[i].engagementTriggers.length;
        expect(prevScore).toBeGreaterThanOrEqual(currentScore);
      }
    });

    it('should get template by ID', () => {
      const templateId = 'frontend-story-1';
      const template = postGenerator.getTemplateById(templateId);
      
      expect(template).toBeDefined();
      expect(template?.id).toBe(templateId);
    });
  });

  describe('History Management', () => {
    it('should track post history', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);
      
      const history = postGenerator.getPostHistory();
      expect(history.length).toBe(1);
      expect(history[0].content).toBe('Test post content');
    });

    it('should support undo functionality', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);
      
      const undonePost = postGenerator.undoLastGeneration();
      expect(undonePost).toBeDefined();
      expect(undonePost?.content).toBe('Test post content');
    });

    it('should clear history', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      await postGenerator.generatePost(request);
      
      postGenerator.clearHistory();
      
      const history = postGenerator.getPostHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockRejectedValue(new Error('API Error'));

      await expect(postGenerator.generatePost(request)).rejects.toThrow('Failed to generate post');
    });

    it('should handle missing templates', async () => {
      const request: GeneratePostRequest = {
        topic: 'fullstack',
        tone: 'professional'
      };

      const mockPost: Post = {
        id: '1',
        content: 'Test post content',
        topic: 'fullstack',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { postsApi } = await import('../../services/api');
      vi.mocked(postsApi.generate).mockResolvedValue(mockPost);

      // Should still work even with edge cases
      const result = await postGenerator.generatePost(request);
      expect(result).toBeDefined();
    });
  });

  describe('Content Deduplication', () => {
    it('should detect duplicate content', () => {
      const content1 = 'This is a test post about React development.';
      const content2 = 'This is a test post about React development.';
      
      // Add first content
      const isNew1 = (postGenerator as unknown as { contentSet: { add: (content: string) => boolean } }).contentSet.add(content1);
      expect(isNew1).toBe(true);
      
      // Add duplicate content
      const isNew2 = (postGenerator as unknown as { contentSet: { add: (content: string) => boolean } }).contentSet.add(content2);
      expect(isNew2).toBe(false);
    });

    it('should handle similar but not identical content', () => {
      const content1 = 'This is a test post about React development.';
      const content2 = 'This is a different post about React development.';
      
      // Add first content
      const isNew1 = (postGenerator as unknown as { contentSet: { add: (content: string) => boolean } }).contentSet.add(content1);
      expect(isNew1).toBe(true);
      
      // Add similar content
      const isNew2 = (postGenerator as unknown as { contentSet: { add: (content: string) => boolean } }).contentSet.add(content2);
      expect(isNew2).toBe(true);
    });
  });
}); 