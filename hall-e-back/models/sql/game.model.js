import {DataTypes} from 'sequelize';

export const game = (sequelize) => {
    return sequelize.define(
        'Game', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        })
}