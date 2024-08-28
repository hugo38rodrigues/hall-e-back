
export const commentModel = (sequelize, DataTypes) => {
 return sequelize.define(
  'Comments', {
  
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
})
}