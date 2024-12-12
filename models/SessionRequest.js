const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const SessionRequest = sequelize.define('SessionRequest', {
  sessionRequestId: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  coachProfileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CoachProfiles', 
      key: 'coachProfileId',
    },
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
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requestedTimeSlots: {
    type: DataTypes.JSON,
    allowNull: false, 
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Booked'),
    defaultValue: 'Pending',
  },
  receipt: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  courtNo: {
    type: DataTypes.STRING,
    defaultValue: null,
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
  tableName: 'SessionRequests', 
});



module.exports = SessionRequest;

