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

const DriveFile = sequelize.define('files', {
  id: {
    primaryKey: true,
    type: DataTypes.STRING
  },
  kind: DataTypes.STRING,
  title: DataTypes.STRING,
  teamDriveId: DataTypes.STRING,
  createdDate: DataTypes.DATE,
  modifiedDate: DataTypes.DATE,
});

module.exports = {
  TeamDrive,
  DriveFile
};