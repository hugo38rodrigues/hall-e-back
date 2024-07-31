import { DataTypes } from 'sequelize'

export const League = (sequelize) => {
    return sequelize.define('League', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
}