export const barMatchScheduleModel = (sequelize, DataTypes) => {
  return sequelize.define('BarMatchSchedule', {
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
    },
    scheduled: {
      type: DataTypes.BOOLEAN
    },
  })
}