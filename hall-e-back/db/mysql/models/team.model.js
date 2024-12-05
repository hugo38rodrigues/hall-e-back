export const teamModel = (sequelize, DataTypes) => {
	return sequelize.define('Teams', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		acronym: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		logo_url: {
			type: DataTypes.STRING,
			unique: true,
		},
	})
}
