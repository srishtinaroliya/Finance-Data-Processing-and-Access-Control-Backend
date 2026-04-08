// Role-based access control middleware

// Check if user has required role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Current role: ${req.user.role}`
      });
    }

    next();
  };
};

// Specific role checkers for readability
const isAdmin = authorize('admin');
const isAnalystOrAdmin = authorize('analyst', 'admin');
const isViewerOrAbove = authorize('viewer', 'analyst', 'admin');

// Custom middleware to check if user can access their own resources
const canAccessOwnResource = (req, res, next) => {
  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // For non-admin users, check if they're accessing their own resources
  const resourceId = req.params.id;
  const userId = req.user._id.toString();

  if (resourceId === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

module.exports = {
  authorize,
  isAdmin,
  isAnalystOrAdmin,
  isViewerOrAbove,
  canAccessOwnResource
};
