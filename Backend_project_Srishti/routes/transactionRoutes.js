const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isViewerOrAbove } = require('../middleware/roleMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
} = require('../controllers/transactionController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Viewer, Analyst, Admin can read transactions
router.get('/', isViewerOrAbove, getTransactions);
router.get('/categories', isViewerOrAbove, getCategories);
router.get('/:id', isViewerOrAbove, getTransaction);

// Admin only can create, update, delete transactions
router.post('/', isAdmin, createTransaction);
router.patch('/:id', isAdmin, updateTransaction);
router.delete('/:id', isAdmin, deleteTransaction);

module.exports = router;
