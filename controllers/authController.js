const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const sendUserRegistrationEmail = require('../utils/userEmailService');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('User', 'Coach', 'Admin').default('User')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  //role: Joi.string().valid('User', 'Coach', 'Admin').required() 
});

exports.register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = await User.create({ name, email, password, role });

    const payload = {
      id: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
      if (err) throw err;

      await sendUserRegistrationEmail(email, name);
      res.json({ token });
    });
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // if (user.role !== role) {
    //   return res.status(400).json({ msg: 'Role mismatch' });
    // }

    if (!user.isActive) {
      return res.status(400).json({ msg: 'Account is deactivated' });
    }

    const isMatch = user.decryptPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Password' });
    }

    const payload = {
      id: user.userId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).send('Server error');
  }
};


