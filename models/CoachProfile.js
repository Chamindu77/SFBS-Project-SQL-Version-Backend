// models/CoachProfile.js

const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Choose the correct Sequelize instance based on the DB_TYPE environment variable
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const CoachProfile = sequelize.define('CoachProfile', {
  coachProfileId: {
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
    },
    onDelete: 'CASCADE'
  },
  coachName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coachLevel: {
    type: DataTypes.ENUM('Professional Level', 'Intermediate Level', 'Beginner Level'),
    allowNull: false
  },
  coachingSport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coachPrice: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      hasRequiredFields(value) {
        if (
          typeof value !== 'object' ||
          !value.hasOwnProperty('individualSessionPrice') ||
          !value.hasOwnProperty('groupSessionPrice')
        ) {
          throw new Error('coachPrice must include both individualSessionPrice and groupSessionPrice');
        }
      }
    }
  },
  availableTimeSlots: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isWithinNext7Days(value) {
        const today = new Date();
        const sevenDaysFromToday = new Date(today);
        sevenDaysFromToday.setDate(today.getDate() + 7);
        if (
          !Array.isArray(value) ||
          value.some(slot => {
            const slotDate = new Date(slot.date);
            return slotDate < today || slotDate > sevenDaysFromToday;
          })
        ) {
          throw new Error('Time slots must be within the next 7 days.');
        }
      }
    }
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false
  },
  offerSessions: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isValidArray(value) {
        const validOptions = ['Individual Session', 'Group Session'];
        if (!Array.isArray(value) || !value.every(item => validOptions.includes(item))) {
          throw new Error('offerSessions must contain valid session types');
        }
      }
    }
  },
  sessionDescription: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  tableName: 'CoachProfiles'
});


module.exports = CoachProfile;




