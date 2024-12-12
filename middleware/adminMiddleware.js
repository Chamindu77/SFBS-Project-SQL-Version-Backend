const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to authorize admin access.
 */
module.exports = function (req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
};
