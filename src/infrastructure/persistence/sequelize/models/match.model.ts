import { DataTypes, Sequelize } from 'sequelize'

export function initMatchModel(sequelize: Sequelize) {
	return sequelize.define(
		'Match',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			id_match: { type: DataTypes.TEXT, allowNull: false },
			date: { type: DataTypes.DATE, allowNull: false },
			number_of_game: { type: DataTypes.TEXT, allowNull: false },
			hype_score: { type: DataTypes.INTEGER },
			game_id: { type: DataTypes.UUID, allowNull: true },
			league_id: { type: DataTypes.UUID, allowNull: true },
			team1_id: { type: DataTypes.UUID, allowNull: false },
			team2_id: { type: DataTypes.UUID, allowNull: false },
			stream_platform: {
				type: DataTypes.ARRAY(DataTypes.TEXT),
				allowNull: false,
				defaultValue: [],
			},
		},
		{
			tableName: 'matches',
			underscored: true,
			timestamps: true,
			indexes: [
				{ fields: ['date'] },
				{ fields: ['game_id'] },
				{ fields: ['league_id'] },
				{ fields: ['team1_id'] },
				{ fields: ['team2_id'] },
			],
		},
	)
}
