import { DataTypes } from 'sequelize'

export const League = (sequelize) => {
  return sequelize.define('Leagues', {
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
}
