// models/Bar.model.js
import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize'

export function initBarModel(sequelize: Sequelize) {
	return sequelize.define(
		'Bar',
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			address: { type: DataTypes.TEXT, allowNull: false },
			name: { type: DataTypes.TEXT, allowNull: false },
			email: { type: DataTypes.TEXT, allowNull: false, unique: true, validate: { isEmail: true } },
			price: { type: DataTypes.TEXT },
			description: { type: DataTypes.TEXT },
			password: { type: DataTypes.TEXT, allowNull: false },
			role: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'bar' },
			latitude: {
				type: DataTypes.DECIMAL(9, 6),
				get() {
					const value = this.getDataValue('latitude')
					return value === null ? null : parseFloat(value)
				},
			},
			longitude: {
				type: DataTypes.DECIMAL(9, 6),
				get() {
					const value = this.getDataValue('longitude')
					return value === null ? null : parseFloat(value)
				},
			},
		},
		{
			tableName: 'bars',
			// schema: 'app',
			indexes: [{ fields: ['name'] }, { fields: ['address'] }],
		},
	)
}
