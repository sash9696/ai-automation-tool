import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import databaseService from './databaseService.js';

class AuthService {
  constructor() {
    this.sessionExpiryHours = 24 * 7; // 7 days
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h'; // 1 hour
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days
  }

  // Generate secure random ID
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Hash password with bcrypt
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password with bcrypt
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT access token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: this.jwtExpiresIn,
      issuer: 'linkedin-ai-tool',
      audience: 'linkedin-ai-users'
    });
  }

  // Generate JWT refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.jwtRefreshSecret, { 
      expiresIn: this.jwtRefreshExpiresIn,
      issuer: 'linkedin-ai-tool',
      audience: 'linkedin-ai-users'
    });
  }

  // Verify JWT access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'linkedin-ai-tool',
        audience: 'linkedin-ai-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  // Verify JWT refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.jwtRefreshSecret, {
        issuer: 'linkedin-ai-tool',
        audience: 'linkedin-ai-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }
    
    return { valid: true };
  }

  // Register new user with JWT
  async registerUser(userData) {
    try {
      const { email, name, password } = userData;

      // Validate input
      if (!email || !name || !password) {
        throw new Error('Email, name, and password are required');
      }

      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Check if user already exists
      const existingUser = databaseService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const userId = this.generateId();
      const user = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password_hash: passwordHash
      };

      databaseService.createUser(user);

      // Generate JWT tokens
      const tokenPayload = {
        userId: userId,
        email: user.email,
        name: user.name
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken({ userId: userId });

      // Store refresh token in database
      const refreshTokenId = this.generateId();
      databaseService.createRefreshToken({
        id: refreshTokenId,
        userId: userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      });

      return {
        success: true,
        user: {
          id: userId,
          email: user.email,
          name: user.name
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user with JWT
  async loginUser(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = databaseService.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken({ userId: user.id });

      // Store refresh token in database
      const refreshTokenId = this.generateId();
      databaseService.createRefreshToken({
        id: refreshTokenId,
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Refresh JWT tokens
  async refreshTokens(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in database
      const storedToken = databaseService.getRefreshToken(refreshToken);
      if (!storedToken || storedToken.user_id !== decoded.userId) {
        throw new Error('Invalid refresh token');
      }

      // Get user details
      const user = databaseService.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken({ userId: user.id });

      // Update refresh token in database
      databaseService.updateRefreshToken(storedToken.id, {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Quick login (for development/demo - no password required)
  async quickLogin(email, name) {
    try {
      let user = databaseService.getUserByEmail(email);
      
      if (!user) {
        // Create user if doesn't exist
        const userId = this.generateId();
        const userData = {
          id: userId,
          email: email,
          name: name,
          passwordHash: null
        };
        
        databaseService.createUser(userData);
        user = userData;
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken({ userId: user.id });

      // Store refresh token in database
      const refreshTokenId = this.generateId();
      databaseService.createRefreshToken({
        id: refreshTokenId,
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Quick login error:', error);
      throw error;
    }
  }

  // Validate JWT token and return user
  async validateToken(token) {
    try {
      const decoded = this.verifyAccessToken(token);
      
      // Get user from database to ensure they still exist
      const user = databaseService.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tokenData: decoded
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate session (legacy support)
  validateSession(sessionId) {
    try {
      const session = databaseService.getUserSession(sessionId);
      if (!session) {
        return null;
      }

      return {
        id: session.user_id,
        email: session.email,
        name: session.name,
        sessionId: session.id
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Logout user (invalidate refresh token)
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        databaseService.deleteRefreshToken(refreshToken);
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Logout from all devices (invalidate all refresh tokens for user)
  async logoutAllDevices(userId) {
    try {
      databaseService.deleteAllRefreshTokens(userId);
      return { success: true };
    } catch (error) {
      console.error('Logout all devices error:', error);
      throw error;
    }
  }

  // Clean up expired refresh tokens
  cleanupExpiredTokens() {
    try {
      databaseService.deleteExpiredRefreshTokens();
      databaseService.deleteExpiredSessions();
    } catch (error) {
      console.error('Token cleanup error:', error);
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      if (user.password_hash) {
        const isValidPassword = await this.verifyPassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password in database
      databaseService.updateUserPassword(userId, newPasswordHash);

      // Logout from all devices for security
      await this.logoutAllDevices(userId);

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new AuthService(); 