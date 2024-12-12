const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');

// Register and login routes
router.post('/register', register);
router.post('/login', login);

// Initiate Google login with a role query parameter
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'User'; // Default to 'User' if no role is specified
  req.session.selectedRole = role;
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user;
    user.role = req.session.selectedRole || 'User';
    user.save(); // Save the updated role to the database

    const payload = {
      id: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10, // Token expires in 10 hours
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        console.error('Error generating JWT:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      res.redirect(`http://localhost:3000/auth/google/callback?token=${token}`);
    });
  }
);

module.exports = router;
