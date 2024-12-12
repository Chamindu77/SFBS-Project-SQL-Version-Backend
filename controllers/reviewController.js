// controllers/reviewController.js
const Review = require('../models/Review');
const CoachProfile = require('../models/CoachProfile');
const User = require('../models/User');

exports.addReview = async (req, res) => {
  const { coachProfileId, rating, comment } = req.body;

  try {
    const userId = req.user.id;
    const userName = req.user.name; // Save the user name here
    

    // Check if the coach profile exists
    const coachProfile = await CoachProfile.findOne({ where: { coachProfileId } });
    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    // Create new review with user name
    const review = await Review.create({
      userId,
      userName, // Save the user name here
      coachProfileId,
      rating,
      comment
    });

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// const Review = require('../models/Review');
// const CoachProfile = require('../models/CoachProfile');

exports.getReviewsByCoach = async (req, res) => {
  const { coachProfileId } = req.params;

  try {
    // Check if the coach profile exists
    const coachProfile = await CoachProfile.findOne({ where: { coachProfileId } });
    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    // Get all reviews for the specified coach
    const reviews = await Review.findAll({
      where: { coachProfileId },
      attributes: ['reviewId', 'userId', 'userName', 'coachProfileId', 'rating', 'comment', 'createdAt']
    });

    if (reviews.length === 0) {
      return res.status(404).json({ msg: 'No reviews found for this coach' });
    }

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(2);

    // Format the response
    const response = {
      avgRating,
      reviews: reviews.map(review => ({
        _id: review.reviewId,
        userId: review.userId,
        name: review.userName,
        coachProfileId: review.coachProfileId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }))
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
