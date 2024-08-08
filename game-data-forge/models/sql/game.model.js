import { DataTypes } from 'sequelize';

export const Game = (sequelize) => {
    return sequelize.define('Games', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });
};
