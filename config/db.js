// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const mysqlSequelize = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USER,
  process.env.MYSQL_DB_PASSWORD,
  {
    host: process.env.MYSQL_DB_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_DB_PORT || 3306,
    logging: false,
  }
);

const postgresSequelize = new Sequelize(
  process.env.POSTGRES_DB_NAME,
  process.env.POSTGRES_DB_USER,
  process.env.POSTGRES_DB_PASSWORD,
  {
    host: process.env.POSTGRES_DB_HOST,
    dialect: 'postgres',
    port: process.env.POSTGRES_DB_PORT || 5432,
    logging: false,
  }
);

module.exports = {
  mysqlSequelize,
  postgresSequelize,
};


