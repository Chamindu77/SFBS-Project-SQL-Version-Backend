const express = require('express');
const router = express.Router();
const {
  createEquipmentBooking,
  getAllEquipmentBookings,
  getUserEquipmentBookings,
  getEquipmentBookingById,
  downloadEquipmentQrCode,
  getFutureEquipmentBookingsByUserId,
  deleteFutureEquipmentBookingsByUserId
} = require('../controllers/equipmentBookingController');

const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Route to create a new equipment booking (accessible by any authenticated user)
router.post('/', auth, createEquipmentBooking);

// Route to get all equipment bookings (admin only)
router.get('/', auth, admin, getAllEquipmentBookings);

// Route to get all equipment bookings for a specific user (authenticated user only)
router.get('/user/:userId', getUserEquipmentBookings);

// Route to get a specific equipment booking by ID (accessible by the booking owner)
router.get('/:id', auth, getEquipmentBookingById);

// Route to download the QR code for a specific booking
router.get('/download-qr/:id', downloadEquipmentQrCode);

router.get('/user/:userId/future', auth, getFutureEquipmentBookingsByUserId);

router.delete('/user/:userId/future', auth, deleteFutureEquipmentBookingsByUserId);


module.exports = router;

