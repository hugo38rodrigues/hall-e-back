import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db.config.js";

export const Game = connectionDb.define(
    'Game', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
