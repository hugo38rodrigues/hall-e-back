// models/Game.model.js
import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initGameModel(sequelize: Sequelize) {
	return sequelize.define(
		'Game',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			name: { type: DataTypes.TEXT, allowNull: false },
		},
		{
			tableName: 'games',
			underscored: true,
			timestamps: true,
			indexes: [{ fields: ['name'] }],
		},
	)
}
