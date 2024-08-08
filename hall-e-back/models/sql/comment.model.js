import { DataTypes } from 'sequelize'
import {connectionDb} from "../../config/db.config.js";


export const Comment = connectionDb().define(
  'Comments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
})