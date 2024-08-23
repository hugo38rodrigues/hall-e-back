export const gameModel = (sequelize, DataTypes) => {
  return sequelize.define('Games', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })
}