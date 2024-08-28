export const leagueModel = (sequelize, DataTypes) => {
  return sequelize.define('Leagues', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  })
}