const express = require('express');
const router = express.Router();
const {
  createFacilityBooking,
  getAllFacilityBookings,
  getFacilityBookingById,
  getFacilityBookingsByUserId,
  getAvailableTimeSlots,
  downloadQrCode,
  getAvailableFacilities,
  getFutureFacilityBookingsByUserId,
  deleteFutureFacilityBookingsByUserId
} = require('../controllers/facilityBookingController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Route to create a new facility booking and upload receipt
router.post('/', auth, createFacilityBooking);

// Route to get all facility bookings
router.get('/', auth, admin, getAllFacilityBookings);

// Route to get a specific facility booking by ID
router.get('/:id', auth, getFacilityBookingById);

// Route to get all facility bookings for a specific user
router.get('/user/:userId', auth, getFacilityBookingsByUserId);

// Route to get available time slots for booking
router.post('/available-slots', auth, getAvailableTimeSlots);

// Route to download QR code for a specific booking by ID
router.get('/download-qr/:id', auth, downloadQrCode);

// Route to find available facilities with all details based on sport, date, and time slot
router.post('/available-facilities', auth, getAvailableFacilities);


router.get('/user/:userId/future', auth, getFutureFacilityBookingsByUserId);


router.delete('/user/:userId/future', auth, deleteFutureFacilityBookingsByUserId);


module.exports = router;
