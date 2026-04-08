const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { login, getMe, validateToken } = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/validate', protect, validateToken);

module.exports = router;
