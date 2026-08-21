import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initFavorisModel(sequelize: Sequelize) {
	return sequelize.define(
		'Favoris',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			client_id: { type: DataTypes.UUID, allowNull: true },
			bar_id: { type: DataTypes.UUID, allowNull: true },
		},
		{
			tableName: 'favoris',
			underscored: true,
			timestamps: true,
			validate: {
				ownerXor() {
					if (!!this.client_id === !!this.bar_id) {
						throw new Error('Favoris must belong to either a client OR a bar (exclusive).')
					}
				},
			},
		},
	)
}
