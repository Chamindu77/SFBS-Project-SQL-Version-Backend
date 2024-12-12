// models/Facility.js

const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Choose the correct Sequelize instance based on the DB_TYPE environment variable
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const Facility = sequelize.define('Facility', {
  facilityId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courtNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sportName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sportCategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courtPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deactivationReason: {
    type: DataTypes.STRING,
    allowNull: true // New field for the deactivation reason
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
  tableName: 'Facilities'
});

module.exports = Facility;

