import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initPictureModel(sequelize: Sequelize) {
	return sequelize.define(
		'Picture',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			bar_id: { type: DataTypes.UUID, allowNull: false },
			url: { type: DataTypes.TEXT, allowNull: false },
		},
		{
			tableName: 'pictures',
			underscored: true,
			timestamps: true,
			indexes: [{ fields: ['bar_id'] }],
		},
	)
}
