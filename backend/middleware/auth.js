const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Middleware to verify JWT token (optional - allows guests)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue as guest
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      req.user = null;
      return next();
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    logger.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

// Middleware to verify JWT token (required - blocks guests)
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  optionalAuth,
  requireAuth
};
