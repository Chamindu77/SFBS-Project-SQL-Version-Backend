const express = require('express');
const router = express.Router();

const { 
    createSessionRequest,
    respondToSessionRequest,
    getUserSessionRequests, 
    getCoachSessionRequests, 
    getSessionRequestById, 
    bookSession, 
    getUserBookings, 
    getCoachBookings, 
    getAllBookings, 
    uploadReceipt,
    getQrCodeById,
    getFutureSessionBookingsByUserId,
    deleteFutureSessionBookingsByUserId 
} = require('../controllers/sessionController');

const auth = require('../middleware/authMiddleware');
const coach = require('../middleware/coachMiddleware');
const admin = require('../middleware/adminMiddleware');

router.post('/request', auth, createSessionRequest); 
router.put('/respond/:id', auth, respondToSessionRequest); 
router.get('/requests/:userId', auth, getUserSessionRequests); 
router.get('/coach/requests', auth, coach, getCoachSessionRequests); 
router.get('/request/:sessionId', auth, getSessionRequestById); 


router.post('/booking', auth, bookSession);
router.get('/booking/:userId', auth, getUserBookings);
router.get('/booking/coach/:coachId', auth, coach, getCoachBookings);
router.get('/bookings', auth, admin, getAllBookings);
router.post('/upload-receipt/:id', auth, uploadReceipt);
router.get('/download-qrcode/:id', auth, getQrCodeById);
router.get('/user/:userId/future', auth, getFutureSessionBookingsByUserId);
router.delete('/user/:userId/future', auth, deleteFutureSessionBookingsByUserId);





module.exports = router;

