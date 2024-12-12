// const mongoose = require('mongoose');

// const ReviewSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   coachProfileId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'CoachProfile',
//     required: true
//   },
//   rating: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 5
//   },
//   comment: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Review', ReviewSchema);


//models/Review.js

// const { DataTypes } = require('sequelize');
// const { mysqlSequelize, postgresSequelize } = require('../config/db');

// // Choose the correct Sequelize instance based on the DB_TYPE environment variable
// const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

// const Review = sequelize.define('Review', {
//   reviewId: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//     allowNull: false,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'Users', // Make sure this matches the table name in User model
//       key: 'userId',
//     },
//     onDelete: 'CASCADE'
//   },
//   coachProfileId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'CoachProfiles', // Make sure this matches the table name in CoachProfile model
//       key: 'coachProfileId',
//     },
//     onDelete: 'CASCADE'
//   },
//   rating: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//     validate: {
//       min: 0,
//       max: 5
//     }
//   },
//   comment: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   createdAt: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   }
// }, {
//   timestamps: false, // Disables Sequelize's automatic timestamps
//   tableName: 'Reviews' // Explicitly set table name
// });



// module.exports = Review;


// models/Review.js

const { DataTypes } = require('sequelize');
const { mysqlSequelize, postgresSequelize } = require('../config/db');

const sequelize = process.env.DB_TYPE === 'mysql' ? mysqlSequelize : postgresSequelize;

const Review = sequelize.define('Review', {
  reviewId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId',
    },
    onDelete: 'CASCADE'
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coachProfileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CoachProfiles',
      key: 'coachProfileId',
    },
    onDelete: 'CASCADE'
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 5
    }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'Reviews'
});

module.exports = Review;
