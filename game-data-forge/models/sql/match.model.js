import { DataTypes } from 'sequelize';

export const Match = (sequelize) => {
    return sequelize.define('Matches', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        id_match: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE
        },
    });
};