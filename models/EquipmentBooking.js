// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const EquipmentBookingSchema = new mongoose.Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   userName: {
//     type: String,
//     required: true
//   },
//   userEmail: {
//     type: String,
//     required: true
//   },
//   userPhoneNumber: {
//     type: String,
//     required: true
//   },
//   dateTime: {
//     type: Date,
//     required: true,
//   },
//   equipmentName: {
//     type: String,
//     required: true
//   },
//   sportName: {
//     type: String,
//     required: true
//   },
//   equipmentPrice: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true
//   },
//   totalPrice: {
//     type: Number,
//     required: true
//   },
//   receipt: {
//     type: String, 
//   },
//   qrCode: {
//     type: String 
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('EquipmentBooking', EquipmentBookingSchema);


const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Determine which Sequelize instance to use
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const EquipmentBooking = sequelize.define('EquipmentBooking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Assuming your User table is named 'Users'
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
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  equipmentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sportName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  equipmentPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  quantity: {
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
  tableName: 'EquipmentBookings'
});

module.exports = EquipmentBooking;
