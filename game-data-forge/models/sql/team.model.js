import { DataTypes } from 'sequelize';

export const Team = (sequelize) => {
    return sequelize.define('Teams', {
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