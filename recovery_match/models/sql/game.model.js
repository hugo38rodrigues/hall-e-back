import { DataTypes } from 'sequelize'
import { connectionDb } from '../../config/db-config.js'

const db = await connectionDb()

export const Game = db.define( 'Game', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
    
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
    
})

