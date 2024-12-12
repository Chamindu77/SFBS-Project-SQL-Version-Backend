const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const SessionBooking = sequelize.define('SessionBooking', {
  sessionBookingId: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'SessionRequests', 
      key: 'sessionRequestId',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'userId',
    },
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  userPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sportName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sessionType: {
    type: DataTypes.ENUM('Individual Session', 'Group Session'),
    allowNull: false,
  },
  bookedTimeSlots: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  coachId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'userId',
    },
  },
  coachName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coachEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  coachLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sessionFee: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courtNo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  receipt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qrCodeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'SessionBookings', 
});

module.exports = SessionBooking;
