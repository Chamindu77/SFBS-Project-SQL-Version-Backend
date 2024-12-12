const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getAllProfiles,
  toggleActiveStatus,
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');


// Get the authenticated user's profile
router.get('/', auth, getProfile);

// Update the authenticated user's profile
router.put('/', auth, updateProfile);

// Get all user profiles (admin only)
router.get('/all', auth, admin, getAllProfiles);

// Toggle the active status of a user (admin only)
router.put('/toggle/:userId', auth, admin, toggleActiveStatus);

module.exports = router;
