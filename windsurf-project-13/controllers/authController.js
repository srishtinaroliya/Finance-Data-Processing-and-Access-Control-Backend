const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Mock login - email-based authentication (no password required)
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Find user by email
  const user = await User.findOne({ email }).select('-__v');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  // Check if user is active
  if (user.status !== 'active') {
    return res.status(401).json({
      success: false,
      message: 'Account is inactive. Please contact administrator.'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Validate token (for frontend checks)
// @route   GET /api/auth/validate
// @access  Private
const validateToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status
      }
    }
  });
});

module.exports = {
  login,
  getMe,
  validateToken
};
