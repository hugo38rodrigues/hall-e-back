import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initClientModel(sequelize: Sequelize) {
	return sequelize.define(
		'Client',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			first_name: { type: DataTypes.TEXT, allowNull: false },
			last_name: { type: DataTypes.TEXT, allowNull: false },
			password: { type: DataTypes.TEXT, allowNull: false }, // hash
			email: { type: DataTypes.TEXT, allowNull: false, unique: true, validate: { isEmail: true } },
			role: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'client' },
		},
		{
			tableName: 'clients',
			underscored: true,
			timestamps: true,
			indexes: [{ unique: true, fields: ['email'] }],
		},
	)
}
