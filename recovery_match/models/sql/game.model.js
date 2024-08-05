import { DataTypes } from 'sequelize'

export const Game = (sequelize) => {
    return sequelize.define(
        'Game', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        })
}