"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostAnalytics = exports.publishPost = exports.schedulePost = exports.deletePost = exports.updatePost = exports.getPostById = exports.getAllPosts = exports.generatePost = void 0;
const aiService_1 = require("../services/aiService");
const schedulerService_1 = require("../services/schedulerService");
const linkedInService_1 = require("../services/linkedInService");
const errorHandler_1 = require("../middleware/errorHandler");
const posts = [];
const generatePost = async (req, res, next) => {
    try {
        const request = req.body;
        const content = await (0, aiService_1.generateAIPost)(request);
        const post = {
            id: Date.now().toString(),
            content,
            topic: request.topic,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        posts.push(post);
        res.json({
            success: true,
            data: post,
            message: 'Post generated successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to generate post', 500));
    }
};
exports.generatePost = generatePost;
const getAllPosts = async (_req, res, next) => {
    try {
        res.json({
            success: true,
            data: posts,
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to fetch posts', 500));
    }
};
exports.getAllPosts = getAllPosts;
const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = posts.find(p => p.id === id);
        if (!post) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        res.json({
            success: true,
            data: post,
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to fetch post', 500));
    }
};
exports.getPostById = getPostById;
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        posts[postIndex] = {
            ...posts[postIndex],
            ...updates,
            updatedAt: new Date(),
        };
        res.json({
            success: true,
            data: posts[postIndex],
            message: 'Post updated successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to update post', 500));
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        posts.splice(postIndex, 1);
        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to delete post', 500));
    }
};
exports.deletePost = deletePost;
const schedulePost = async (req, res, next) => {
    try {
        const request = req.body;
        const post = posts.find(p => p.id === request.postId);
        if (!post) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        await (0, schedulerService_1.schedulePostJob)(post, request.scheduledTime);
        post.status = 'scheduled';
        post.scheduledTime = request.scheduledTime;
        post.updatedAt = new Date();
        res.json({
            success: true,
            data: post,
            message: 'Post scheduled successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to schedule post', 500));
    }
};
exports.schedulePost = schedulePost;
const publishPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = posts.find(p => p.id === id);
        if (!post) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        await (0, linkedInService_1.publishToLinkedIn)(post.content);
        post.status = 'published';
        post.publishedAt = new Date();
        post.updatedAt = new Date();
        res.json({
            success: true,
            data: post,
            message: 'Post published successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to publish post', 500));
    }
};
exports.publishPost = publishPost;
const getPostAnalytics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = posts.find(p => p.id === id);
        if (!post) {
            return next((0, errorHandler_1.createError)('Post not found', 404));
        }
        const analytics = {
            views: Math.floor(Math.random() * 1000) + 100,
            likes: Math.floor(Math.random() * 100) + 10,
            comments: Math.floor(Math.random() * 20) + 2,
            shares: Math.floor(Math.random() * 10) + 1,
            engagementRate: Math.random() * 5 + 1,
        };
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to fetch analytics', 500));
    }
};
exports.getPostAnalytics = getPostAnalytics;
//# sourceMappingURL=postsController.js.map