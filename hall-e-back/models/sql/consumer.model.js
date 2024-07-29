import { DataTypes } from 'sequelize';
import { DB } from '../../config/db-config.js';
const db = new DB()

export const Consumer = db.connexion.define(
  'Consumers',
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
    favoris_match: {
      type: DataTypes.INTEGER,
    },
    like_bar: {
      type: DataTypes.INTEGER
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'consumer',
      allowNull: false
    }
  },
);