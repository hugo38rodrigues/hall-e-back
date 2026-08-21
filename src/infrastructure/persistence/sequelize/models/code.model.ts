import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initCodeModel(sequelize: Sequelize) {
	return sequelize.define(
		'Code',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			code_number: { type: DataTypes.INTEGER, allowNull: false },
			expires_in: { type: DataTypes.BIGINT, allowNull: false }, // 10^3
			client_id: { type: DataTypes.UUID, allowNull: true },
			bar_id: { type: DataTypes.UUID, allowNull: true },
		},
		{
			tableName: 'codes',
			underscored: true,
			timestamps: true,
			validate: {
				ownerXor() {
					const hasClient = !!this.client_id
					const hasBar = !!this.bar_id
					if (hasClient === hasBar) {
						throw new Error('Un code doit être lié à un client OU à un bar (exclusif).')
					}
				},
			},
		},
	)
}
