const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const TeamDrive = sequelize.define('drives', {
  name: DataTypes.STRING,
  id: {
    primaryKey: true,
    type: DataTypes.STRING
  },
  kind: DataTypes.STRING
});

module.exports = {
  TeamDrive
};