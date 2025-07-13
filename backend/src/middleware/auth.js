import authService from '../services/authService.js';

// Extract authentication token from request (JWT or session)
const extractAuthToken = (req) => {
  // Try Authorization header first (JWT)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { type: 'jwt', token: authHeader.substring(7) };
  }

  // Try cookie-based session (legacy support)
  if (req.cookies && req.cookies.sessionId) {
    return { type: 'session', token: req.cookies.sessionId };
  }

  return null;
};

// Middleware to authenticate user (required)
export const requireAuth = async (req, res, next) => {
  try {
    const authToken = extractAuthToken(req);
    
    if (!authToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    let user = null;

    if (authToken.type === 'jwt') {
      // Validate JWT token
      try {
        user = await authService.validateToken(authToken.token);
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: error.message
        });
      }
    } else if (authToken.type === 'session') {
      // Validate session (legacy support)
      user = authService.validateSession(authToken.token);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid or expired authentication token'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Middleware to optionally authenticate user (not required)
export const optionalAuth = async (req, res, next) => {
  try {
    const authToken = extractAuthToken(req);
    
    if (authToken) {
      let user = null;

      if (authToken.type === 'jwt') {
        try {
          user = await authService.validateToken(authToken.token);
        } catch (error) {
          // Don't fail the request for optional auth
          console.warn('Optional JWT validation failed:', error.message);
        }
      } else if (authToken.type === 'session') {
        user = authService.validateSession(authToken.token);
      }

      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Don't fail the request, just continue without user
    next();
  }
};

// Middleware to extract user info for debugging
export const debugAuth = (req, res, next) => {
  const authToken = extractAuthToken(req);
  console.log('🔍 [AUTH DEBUG] Token Type:', authToken?.type || 'None');
  console.log('🔍 [AUTH DEBUG] Token:', authToken?.token ? authToken.token.substring(0, 20) + '...' : 'None');
  console.log('🔍 [AUTH DEBUG] User:', req.user ? `${req.user.name} (${req.user.email})` : 'Not authenticated');
  next();
}; 