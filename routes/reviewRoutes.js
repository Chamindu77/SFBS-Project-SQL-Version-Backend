const express = require('express');
const router = express.Router();
const { addReview, getReviewsByCoach } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');
// getReviewsByCoach
// Route to add a review
router.post('/', auth, addReview);

// Route to get all reviews for a coach
router.get('/:coachProfileId', getReviewsByCoach);

module.exports = router;
