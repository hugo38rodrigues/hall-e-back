export const matchModel = (sequelize, DataTypes) => {
	return sequelize.define('Matches', {
		id_match: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		date: {
			type: DataTypes.DATE,
		},
	})
}
