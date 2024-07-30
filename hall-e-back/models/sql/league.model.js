import {DataTypes} from 'sequelize';

export const league = (sequelize) => {
    return sequelize.define('League', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
}