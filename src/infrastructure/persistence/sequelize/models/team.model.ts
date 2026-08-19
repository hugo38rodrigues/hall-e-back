import { DataTypes, Sequelize } from 'sequelize'

export function initTeamModel(sequelize: Sequelize) {
	return sequelize.define(
		'Team',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			name: { type: DataTypes.TEXT, allowNull: false, unique: true },
			acronym: { type: DataTypes.TEXT, allowNull: false },
			logo_url: { type: DataTypes.TEXT },
		},
		{
			tableName: 'teams',
			underscored: true,
			timestamps: true,
		},
	)
}
