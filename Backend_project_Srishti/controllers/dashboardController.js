const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get dashboard summary (total income, expense, net balance)
// @route   GET /api/dashboard/summary
// @access  Private (Viewer, Analyst, Admin)
const getSummary = asyncHandler(async (req, res) => {
  // Build date filter if provided
  const dateFilter = {};
  if (req.query.startDate || req.query.endDate) {
    dateFilter.date = {};
    if (req.query.startDate) {
      dateFilter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      dateFilter.date.$lte = new Date(req.query.endDate);
    }
  }

  // Aggregate summary data
  const summary = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
        },
        incomeCount: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] }
        },
        expenseCount: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] }
        },
        avgIncome: {
          $avg: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', null] }
        },
        avgExpense: {
          $avg: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', null] }
        }
      }
    }
  ]);

  const result = summary[0] || {
    totalIncome: 0,
    totalExpense: 0,
    incomeCount: 0,
    expenseCount: 0,
    avgIncome: 0,
    avgExpense: 0
  };

  const netBalance = result.totalIncome - result.totalExpense;

  res.status(200).json({
    success: true,
    data: {
      totalIncome: result.totalIncome,
      totalExpense: result.totalExpense,
      netBalance,
      incomeCount: result.incomeCount,
      expenseCount: result.expenseCount,
      avgIncome: result.avgIncome || 0,
      avgExpense: result.avgExpense || 0
    }
  });
});

// @desc    Get category-wise summary
// @route   GET /api/dashboard/category-summary
// @access  Private (Viewer, Analyst, Admin)
const getCategorySummary = asyncHandler(async (req, res) => {
  // Build date filter if provided
  const matchFilter = {};
  if (req.query.startDate || req.query.endDate) {
    matchFilter.date = {};
    if (req.query.startDate) {
      matchFilter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      matchFilter.date.$lte = new Date(req.query.endDate);
    }
  }

  // Aggregate by category and type
  const categorySummary = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          category: '$category',
          type: '$type'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        categories: {
          $push: {
            type: '$_id.type',
            totalAmount: '$totalAmount',
            count: '$count',
            avgAmount: '$avgAmount'
          }
        },
        totalAmount: { $sum: '$totalAmount' },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Format the response
  const formattedSummary = categorySummary.map(cat => {
    const income = cat.categories.find(c => c.type === 'income') || { totalAmount: 0, count: 0, avgAmount: 0 };
    const expense = cat.categories.find(c => c.type === 'expense') || { totalAmount: 0, count: 0, avgAmount: 0 };
    
    return {
      category: cat._id,
      income: {
        totalAmount: income.totalAmount,
        count: income.count,
        avgAmount: income.avgAmount
      },
      expense: {
        totalAmount: expense.totalAmount,
        count: expense.count,
        avgAmount: expense.avgAmount
      },
      netAmount: income.totalAmount - expense.totalAmount,
      totalAmount: cat.totalAmount,
      totalCount: cat.totalCount
    };
  });

  res.status(200).json({
    success: true,
    data: {
      categories: formattedSummary
    }
  });
});

// @desc    Get recent transactions (last 5)
// @route   GET /api/dashboard/recent
// @access  Private (Viewer, Analyst, Admin)
const getRecentTransactions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const transactions = await Transaction.find()
    .populate('createdBy', 'name email')
    .sort({ date: -1, createdAt: -1 })
    .limit(limit);

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
        createdAt: transaction.createdAt
      }))
    }
  });
});

// @desc    Get monthly trends (income vs expense by month)
// @route   GET /api/dashboard/monthly-trends
// @access  Private (Viewer, Analyst, Admin)
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12; // Default to last 12 months

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1); // Start from first day of the month
  startDate.setHours(0, 0, 0, 0);

  const monthlyTrends = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
        },
        incomeCount: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] }
        },
        expenseCount: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalIncome: 1,
        totalExpense: 1,
        netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
        incomeCount: 1,
        expenseCount: 1,
        totalTransactions: { $add: ['$incomeCount', '$expenseCount'] }
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);

  // Format month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const formattedTrends = monthlyTrends.map(trend => ({
    ...trend,
    monthName: monthNames[trend.month - 1],
    monthYear: `${monthNames[trend.month - 1]} ${trend.year}`
  }));

  res.status(200).json({
    success: true,
    data: {
      trends: formattedTrends,
      period: {
        startDate,
        endDate,
        months
      }
    }
  });
});

// @desc    Get user statistics (for admin dashboard)
// @route   GET /api/dashboard/user-stats
// @access  Private (Analyst, Admin)
const getUserStats = asyncHandler(async (req, res) => {
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
        }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: userStats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.count,
          active: stat.active,
          inactive: stat.inactive
        };
        return acc;
      }, {})
    }
  });
});

// @desc    Get top categories by amount
// @route   GET /api/dashboard/top-categories
// @access  Private (Viewer, Analyst, Admin)
const getTopCategories = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type; // 'income', 'expense', or undefined for both

  // Build match filter
  const matchFilter = {};
  if (req.query.startDate || req.query.endDate) {
    matchFilter.date = {};
    if (req.query.startDate) {
      matchFilter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      matchFilter.date.$lte = new Date(req.query.endDate);
    }
  }
  if (type) {
    matchFilter.type = type;
  }

  const topCategories = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit }
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories: topCategories.map(cat => ({
        category: cat._id,
        totalAmount: cat.totalAmount,
        count: cat.count,
        avgAmount: cat.avgAmount
      }))
    }
  });
});

module.exports = {
  getSummary,
  getCategorySummary,
  getRecentTransactions,
  getMonthlyTrends,
  getUserStats,
  getTopCategories
};
