import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';
import type { AppSettings } from '../types';

// Mock settings storage - in production, use database
let userSettings: AppSettings = {
  defaultPostTime: '09:00',
  preferredTopics: ['fullstack'],
  linkedInConnected: false,
  autoSchedule: false,
};

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: userSettings,
    });
  } catch (error) {
    next(createError('Failed to fetch settings', 500));
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates: Partial<AppSettings> = req.body;
    
    // Validate updates
    if (updates.defaultPostTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.defaultPostTime)) {
      return next(createError('Invalid time format. Use HH:MM format', 400));
    }
    
    if (updates.preferredTopics && (!Array.isArray(updates.preferredTopics) || updates.preferredTopics.length === 0)) {
      return next(createError('Preferred topics must be a non-empty array', 400));
    }
    
    // Update settings
    userSettings = {
      ...userSettings,
      ...updates,
    };
    
    res.json({
      success: true,
      data: userSettings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(createError('Failed to update settings', 500));
  }
}; 