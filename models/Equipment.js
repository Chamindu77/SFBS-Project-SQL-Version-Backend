const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

// Choose the correct Sequelize instance based on the DB_TYPE environment variable
const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const Equipment = sequelize.define('Equipment', {
  equipmentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipmentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sportName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rentPrice: {
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
    allowNull: true 
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
  tableName: 'Equipments'
});

module.exports = Equipment;
