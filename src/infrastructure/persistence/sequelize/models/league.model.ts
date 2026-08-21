// models/League.model.js
import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initLeagueModel(sequelize:Sequelize) {
	return sequelize.define(
		'League',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			name: { type: DataTypes.TEXT, allowNull: false },
		},
		{
			tableName: 'leagues',
			underscored: true,
			timestamps: true,
			indexes: [{ fields: ['name'] }],
		},
	)
}
