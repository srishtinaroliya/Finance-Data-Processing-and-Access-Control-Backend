const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { isViewerOrAbove, isAnalystOrAdmin } = require('../middleware/roleMiddleware');
const {
  getSummary,
  getCategorySummary,
  getRecentTransactions,
  getMonthlyTrends,
  getUserStats,
  getTopCategories
} = require('../controllers/dashboardController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Viewer, Analyst, Admin can access basic dashboard data
router.get('/summary', isViewerOrAbove, getSummary);
router.get('/category-summary', isViewerOrAbove, getCategorySummary);
router.get('/recent', isViewerOrAbove, getRecentTransactions);
router.get('/monthly-trends', isViewerOrAbove, getMonthlyTrends);
router.get('/top-categories', isViewerOrAbove, getTopCategories);

// Analyst and Admin can access user statistics
router.get('/user-stats', isAnalystOrAdmin, getUserStats);

module.exports = router;
