import { DataTypes } from 'sequelize';

export const Team = (sequelize) => {
    return sequelize.define('TeamsName', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
}