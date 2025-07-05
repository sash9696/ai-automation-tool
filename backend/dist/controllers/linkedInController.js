"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToLinkedIn = exports.disconnect = exports.getStatus = exports.handleCallback = exports.getAuthUrl = void 0;
const linkedInService_1 = require("../services/linkedInService");
const errorHandler_1 = require("../middleware/errorHandler");
const getAuthUrl = async (_req, res, next) => {
    try {
        const authUrl = (0, linkedInService_1.getAuthUrl)();
        res.json({
            success: true,
            data: { url: authUrl },
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to generate auth URL', 500));
    }
};
exports.getAuthUrl = getAuthUrl;
const handleCallback = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return next((0, errorHandler_1.createError)('Authorization code is required', 400));
        }
        const authResponse = await (0, linkedInService_1.handleAuthCallback)(code);
        res.json({
            success: true,
            data: authResponse,
            message: 'LinkedIn connected successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to authenticate with LinkedIn', 500));
    }
};
exports.handleCallback = handleCallback;
const getStatus = async (_req, res, next) => {
    try {
        const status = (0, linkedInService_1.getLinkedInStatus)();
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to get LinkedIn status', 500));
    }
};
exports.getStatus = getStatus;
const disconnect = async (_req, res, next) => {
    try {
        (0, linkedInService_1.disconnectLinkedIn)();
        res.json({
            success: true,
            message: 'LinkedIn disconnected successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to disconnect LinkedIn', 500));
    }
};
exports.disconnect = disconnect;
const postToLinkedIn = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return next((0, errorHandler_1.createError)('Post content is required', 400));
        }
        const response = await (0, linkedInService_1.publishToLinkedIn)(text);
        res.json({
            success: true,
            data: response,
            message: 'Post published to LinkedIn successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to post to LinkedIn', 500));
    }
};
exports.postToLinkedIn = postToLinkedIn;
//# sourceMappingURL=linkedInController.js.map