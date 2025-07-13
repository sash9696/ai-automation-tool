import authService from '../services/authService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, and password are required'
      });
    }

    const result = await authService.registerUser({
      email,
      name,
      password
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.loginUser(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

// Quick login (for development/demo)
export const quickLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    const result = await authService.quickLogin(email, name);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      },
      message: 'Quick login successful'
    });
  } catch (error) {
    console.error('Quick login error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await authService.logoutAllDevices(userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current user'
    });
  }
};

// Check authentication status
export const checkAuth = async (req, res) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        data: {
          authenticated: true,
          user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          authenticated: false,
          user: null
        }
      });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication status'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 