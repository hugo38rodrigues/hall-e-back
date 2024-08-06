import { DataTypes } from 'sequelize'

export const Comment = (sequelize) => {
  return sequelize.define(
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
})}