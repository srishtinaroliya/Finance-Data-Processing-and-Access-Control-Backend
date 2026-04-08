const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, canAccessOwnResource } = require('../middleware/roleMiddleware');
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Admin-only routes
router.post('/', isAdmin, createUser);
router.get('/', isAdmin, getUsers);
router.get('/:id', isAdmin, getUser);
router.patch('/:id', isAdmin, updateUser);
router.delete('/:id', isAdmin, deleteUser);

// User can access their own profile (additional route for non-admins)
router.get('/profile/me', canAccessOwnResource, getUser);

module.exports = router;
