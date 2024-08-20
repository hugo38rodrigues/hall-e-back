import { DataTypes } from 'sequelize'
import { connectionDb } from '../../config/db-config.js'

const db = await connectionDb()

export const Match = db.define(
  'Matches',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    id_match: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE
    },
  })
