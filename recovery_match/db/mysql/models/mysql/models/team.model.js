export const teamModel = (sequelize, DataTypes) => {
  return sequelize.define('Teams', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })
}