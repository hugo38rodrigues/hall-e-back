import { DataTypes } from 'sequelize'
import {MysqlDB} from "../../config/db.config.js";
const db = new MysqlDB()
const connection = db.connection

export const Comment = connection.define(
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