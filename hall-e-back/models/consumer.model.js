import { DataTypes } from 'sequelize';
import { DB } from '../config/db-config.js';
const db = new DB()

export const Consumer = db.connexion.define(
  'Consumer',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(1234),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'consumer',
      allowNull: false
    }
  },
);