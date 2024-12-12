const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Determine which Sequelize instance to use
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const FacilityBooking = sequelize.define('FacilityBooking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'userId'
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  userPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sportName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courtNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courtPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlots: {
    type: DataTypes.JSON, 
    allowNull: false
  },
  totalHours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  receipt: {
    type: DataTypes.STRING
  },
  qrCode: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'FacilityBookings'
});

module.exports = FacilityBooking;
