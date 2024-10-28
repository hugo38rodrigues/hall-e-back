export const consumerModel = (sequelize, DataTypes) => {
	return sequelize.define('Consumers', {
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING(1234),
			allowNull: false,
		},
		role: {
			type: DataTypes.STRING,
			defaultValue: 'consumer',
			allowNull: false,
		},
	})
}
