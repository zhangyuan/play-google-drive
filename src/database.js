const path = require('path');
const { Sequelize } = require('sequelize');

let storage = path.resolve(__dirname,  'database.sqlite3');

const config = {
  dialect: "sqlite",
  storage: storage,
  logging: false
};

const sequelize = new Sequelize(config);

module.exports = {
  sequelize
};