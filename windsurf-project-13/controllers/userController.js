const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, status } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    role: role || 'viewer',
    status: status || 'active'
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
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

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Sorting
  const sort = {};
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const users = await User.find(filter)
    .select('-__v')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only, or user accessing own profile)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Update user (role and status only)
// @route   PATCH /api/users/:id
// @access  Private (Admin only)
const updateUser = asyncHandler(async (req, res) => {
  const { role, status } = req.body;

  // Build update object
  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (status !== undefined) updateData.status = status;

  // Find and update user
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-__v');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};
