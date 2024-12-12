const { User } = require('../models/User');

/**
 * Retrieves the profile of the authenticated user.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Updates the profile of the authenticated user.
 */
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Retrieves all user profiles (admin only).
 */
exports.getAllProfiles = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    console.error('Error fetching profiles:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Toggles the active status of a user (admin only).
 */
exports.toggleActiveStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isActive = !user.isActive;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error toggling active status:', err.message);
    res.status(500).send('Server error');
  }
};


// /**
//  * Toggles the active status of a user (admin only) with a deactivation reason.
//  */
// exports.toggleActiveStatus = async (req, res) => {
//   const { userId } = req.params;
//   const { reason } = req.body; // Fetch deactivation reason from request body

//   try {
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     if (!user.isActive && !reason) {
//       return res.status(400).json({ msg: 'Deactivation reason is required' });
//     }

//     user.isActive = !user.isActive;
//     user.deactivationReason = user.isActive ? null : reason; // Clear reason if activating

//     await user.save();
//     res.json(user);
//   } catch (err) {
//     console.error('Error toggling active status:', err.message);
//     res.status(500).send('Server error');
//   }
// };