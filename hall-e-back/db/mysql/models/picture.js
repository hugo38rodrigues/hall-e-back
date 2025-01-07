export const pictureModel = (sequelize, DataTypes) => {
return sequelize.define('Pictures', {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	url: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
})}