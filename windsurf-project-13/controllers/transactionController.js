const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private (Admin only)
const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  // Create transaction
  const transaction = await Transaction.create({
    amount,
    type,
    category,
    date: date || new Date(),
    notes,
    createdBy: req.user._id
  });

  // Populate user details
  await transaction.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: {
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
        formattedAmount: transaction.formattedAmount,
        createdBy: {
          id: transaction.createdBy._id,
          name: transaction.createdBy.name,
          email: transaction.createdBy.email
        },
        createdAt: transaction.createdAt
      }
    }
  });
});

// @desc    Get all transactions with filtering, pagination, and search
// @route   GET /api/transactions
// @access  Private (Viewer, Analyst, Admin)
const getTransactions = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by category
  if (req.query.category) {
    filter.category = { $regex: req.query.category, $options: 'i' };
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) {
      filter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.date.$lte = new Date(req.query.endDate);
    }
  }

  // Search by notes or category
  if (req.query.search) {
    filter.$or = [
      { category: { $regex: req.query.search, $options: 'i' } },
      { notes: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by amount range
  if (req.query.minAmount || req.query.maxAmount) {
    filter.amount = {};
    if (req.query.minAmount) {
      filter.amount.$gte = parseFloat(req.query.minAmount);
    }
    if (req.query.maxAmount) {
      filter.amount.$lte = parseFloat(req.query.maxAmount);
    }
  }

  // Sorting
  const sort = {};
  const sortBy = req.query.sortBy || 'date';
  const sortOrder = req.query.sortOrder || 'desc';
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const transactions = await Transaction.find(filter)
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Transaction.countDocuments(filter);

  // Calculate summary statistics
  const summary = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = summary[0] || { totalIncome: 0, totalExpense: 0, count: 0 };

  res.status(200).json({
    success: true,
    data: {
      transactions: transactions.map(transaction => ({
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
        formattedAmount: transaction.formattedAmount,
        createdBy: {
          id: transaction.createdBy._id,
          name: transaction.createdBy.name,
          email: transaction.createdBy.email
        },
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalIncome: stats.totalIncome,
        totalExpense: stats.totalExpense,
        netBalance: stats.totalIncome - stats.totalExpense,
        count: stats.count
      }
    }
  });
});

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private (Viewer, Analyst, Admin)
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
        formattedAmount: transaction.formattedAmount,
        createdBy: {
          id: transaction.createdBy._id,
          name: transaction.createdBy.name,
          email: transaction.createdBy.email
        },
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    }
  });
});

// @desc    Update transaction
// @route   PATCH /api/transactions/:id
// @access  Private (Admin only)
const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  // Build update object
  const updateData = {};
  if (amount !== undefined) updateData.amount = amount;
  if (type !== undefined) updateData.type = type;
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;
  if (notes !== undefined) updateData.notes = notes;

  // Find and update transaction
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Transaction updated successfully',
    data: {
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
        formattedAmount: transaction.formattedAmount,
        createdBy: {
          id: transaction.createdBy._id,
          name: transaction.createdBy.name,
          email: transaction.createdBy.email
        },
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    }
  });
});

// @desc    Delete transaction (soft delete)
// @route   DELETE /api/transactions/:id
// @access  Private (Admin only)
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Get transaction categories
// @route   GET /api/transactions/categories
// @access  Private (Viewer, Analyst, Admin)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Transaction.distinct('category');

  res.status(200).json({
    success: true,
    data: {
      categories: categories.sort()
    }
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
