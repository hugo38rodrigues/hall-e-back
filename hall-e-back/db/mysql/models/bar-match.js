export const barMatchScheduleModel = (sequelize, DataTypes) => {
  return sequelize.define('BarMatchSchedules', {
    barId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Bars',
        key: 'id',
      },
    },
    matchId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Matches',
        key: 'id',
      },
    }
  })
}