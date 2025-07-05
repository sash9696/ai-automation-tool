import { Request, Response, NextFunction } from 'express';
import { getAuthUrl as getLinkedInAuthUrl, handleAuthCallback, getLinkedInStatus, disconnectLinkedIn, publishToLinkedIn, setLinkedInToken } from '../services/linkedInService';
import { createError } from '../middleware/errorHandler';

export const getAuthUrl = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const authUrl = getLinkedInAuthUrl();
    
    res.json({
      success: true,
      data: { url: authUrl },
    });
  } catch (error) {
    next(createError('Failed to generate auth URL', 500));
  }
};

export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return next(createError('Authorization code is required', 400));
    }
    
    const authResponse = await handleAuthCallback(code);
    
    res.json({
      success: true,
      data: authResponse,
      message: 'LinkedIn connected successfully',
    });
  } catch (error) {
    next(createError('Failed to authenticate with LinkedIn', 500));
  }
};

export const getStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = getLinkedInStatus();
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(createError('Failed to get LinkedIn status', 500));
  }
};

export const disconnect = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    disconnectLinkedIn();
    
    res.json({
      success: true,
      message: 'LinkedIn disconnected successfully',
    });
  } catch (error) {
    next(createError('Failed to disconnect LinkedIn', 500));
  }
};

export const postToLinkedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return next(createError('Post content is required', 400));
    }
    
    const response = await publishToLinkedIn(text);
    
    res.json({
      success: true,
      data: response,
      message: 'Post published to LinkedIn successfully',
    });
  } catch (error) {
    next(createError('Failed to post to LinkedIn', 500));
  }
};

export const setToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return next(createError('LinkedIn access token is required', 400));
    }
    
    const response = setLinkedInToken(token);
    
    res.json({
      success: true,
      data: response,
      message: 'LinkedIn token set successfully',
    });
  } catch (error) {
    next(createError('Failed to set LinkedIn token', 500));
  }
}; 