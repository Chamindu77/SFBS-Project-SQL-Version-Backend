const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to authorize coach access.
 */

module.exports = (req, res, next) => {
    if (req.user && req.user.role === 'Coach') {
      return next();
    } else {
      return res.status(403).json({ msg: 'Access denied. Only coaches can access this resource.' });
    }
  };
  