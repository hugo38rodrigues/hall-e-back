export const likeModel = (sequelize, DataTypes) => {
	return sequelize.define(
		'Likes',
		{
			clientId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Consumers',
					key: 'id',
				},
			},
			barId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Bars',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		}
	)
}
