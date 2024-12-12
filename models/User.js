// models/User.js
const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Determine which database instance to use
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  role: {
    type: DataTypes.ENUM('User', 'Coach', 'Admin'),
    defaultValue: 'User',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
 
}, {
  timestamps: true,
  tableName: 'Users', 
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const cipher = crypto.createCipheriv(
          'aes-256-cbc',
          Buffer.from(process.env.AES_SECRET_KEY, 'hex'),
          Buffer.from(process.env.AES_IV, 'hex')
        );
        let encrypted = cipher.update(user.password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        user.password = encrypted;
      }
    }
  }
});

User.prototype.decryptPassword = function (password) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.AES_SECRET_KEY, 'hex'),
    Buffer.from(process.env.AES_IV, 'hex')
  );
  let decrypted = decipher.update(this.password, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted === password;
};

module.exports = { User };

