import {DataTypes} from 'sequelize';

export const team = (sequelize) => {
    return sequelize.define('TeamsName', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
}