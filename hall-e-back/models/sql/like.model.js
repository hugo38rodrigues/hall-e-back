import { DataTypes } from 'sequelize';
import { DB } from '../../config/db-config.js';
import { Bar } from './bar.model.js';
import { Consumer } from './consumer.model.js';
const db = new DB()

export const Comment = db.connexion.define(
  'Likes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },

  consumerId: {
    type: DataTypes.INTEGER,
    references: {
      model: Consumer,
      key: 'id',
    }
  },

  barId: {
    type: DataTypes.INTEGER,
    references: {
      model: Bar,
      key: 'id',
    }
  }
})