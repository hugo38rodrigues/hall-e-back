import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initCommentModel(sequelize: Sequelize) {
	return sequelize.define(
		'Comment',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			author_id: { type: DataTypes.UUID, allowNull: true },
			bar_id: { type: DataTypes.UUID, allowNull: true },
			content: { type: DataTypes.TEXT, allowNull: false },
		},
		{
			tableName: 'comments',
			underscored: true,
			timestamps: true,
			indexes: [{ fields: ['bar_id'] }],
		},
	)
}
