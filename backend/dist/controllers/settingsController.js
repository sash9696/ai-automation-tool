"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
let userSettings = {
    defaultPostTime: '09:00',
    preferredTopics: ['fullstack'],
    linkedInConnected: false,
    autoSchedule: false,
};
const getSettings = async (_req, res, next) => {
    try {
        res.json({
            success: true,
            data: userSettings,
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to fetch settings', 500));
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    try {
        const updates = req.body;
        if (updates.defaultPostTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.defaultPostTime)) {
            return next((0, errorHandler_1.createError)('Invalid time format. Use HH:MM format', 400));
        }
        if (updates.preferredTopics && (!Array.isArray(updates.preferredTopics) || updates.preferredTopics.length === 0)) {
            return next((0, errorHandler_1.createError)('Preferred topics must be a non-empty array', 400));
        }
        userSettings = {
            ...userSettings,
            ...updates,
        };
        res.json({
            success: true,
            data: userSettings,
            message: 'Settings updated successfully',
        });
    }
    catch (error) {
        next((0, errorHandler_1.createError)('Failed to update settings', 500));
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=settingsController.js.map