const express = require('express');
const router = express.Router();

const {
  createCoachProfile,
  updateCoachProfile,
  getAllCoachProfiles,
  getCoachProfileByUserId,
  toggleCoachProfileStatus,
  uploadCoachProfileImage,
  updateCoachProfileImage,
  getCoachProfileByCoachProfileId
} = require('../controllers/coachProfileController'); // Ensure this path and functions are correct

const auth = require('../middleware/authMiddleware');
const coach = require('../middleware/coachMiddleware');
const admin = require('../middleware/adminMiddleware');

router.post('/', auth, coach, createCoachProfile);
router.put('/:id', auth, coach, updateCoachProfile);

router.get('/all', auth, getAllCoachProfiles);
router.get('/:id', auth, getCoachProfileByCoachProfileId);
router.get('/coach/:userId', auth, getCoachProfileByUserId);
router.put('/toggle/:id', auth, admin, toggleCoachProfileStatus);

// // Routes for image upload and update
router.post('/upload-image', auth, coach, uploadCoachProfileImage);
router.put('/update-image/:id', auth, coach, updateCoachProfileImage);

module.exports = router;
