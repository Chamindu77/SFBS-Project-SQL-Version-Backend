const express = require('express');
const router = express.Router();
const {
  createFacility,
  getAllFacilities,
  getAvailableFacilities,
  updateFacility,
  deleteFacility,
  getFacilityById,
  toggleFacilityStatus
} = require('../controllers/facilityController');

// Authentication and Authorization Middleware
const auth = require('../middleware/authMiddleware'); // Authenticates all routes
const admin = require('../middleware/adminMiddleware'); // Restricts access to admins

// Routes

// Create a new facility (Admin only)
router.post('/', auth, admin, createFacility);

// Retrieve all facilities (Admin only)
router.get('/', auth, admin, getAllFacilities);

// Retrieve available facilities (Accessible to Users)
router.get('/available', auth, getAvailableFacilities);

// Retrieve a specific facility by ID (Accessible to Admins and Users)
router.get('/:id', auth, getFacilityById);

// Update a facility (Admin only)
router.put('/:id', auth, admin, updateFacility);

// Delete a facility (Admin only)
router.delete('/:id', auth, admin, deleteFacility);

// Toggle a facility's active status (Admin only)
router.put('/toggle/:id', auth, admin, toggleFacilityStatus);

module.exports = router;



// const express = require('express');
// const router = express.Router();

// const {
//   createFacility,
//   getAllFacilities,
//   getAvailableFacilities,
//   updateFacility,
//   deleteFacility,
//   getFacilityById,
//   toggleFacilityStatus
// } = require('../controllers/facilityController');

// const auth = require('../middleware/authMiddleware');
// const admin = require('../middleware/adminMiddleware');

// // Create a new facility (Admin only)
// router.post('/', auth, admin, createFacility);

// // Retrieve all facilities (Admin only)
// router.get('/', auth, admin, getAllFacilities);

// // Retrieve available facilities (Users)
// router.get('/available', auth, getAvailableFacilities);

// // Update a facility (Admin only)
// router.put('/:id', auth, admin, updateFacility);

// // Delete a facility (Admin only)
// router.delete('/:id', auth, admin, deleteFacility);

// // Retrieve a specific facility by ID (Admin and Users)
// router.get('/:id', auth, getFacilityById);

// // Toggle facility's active status (Admin only)
// router.put('/toggle/:id', auth, admin, toggleFacilityStatus);

// module.exports = router;
