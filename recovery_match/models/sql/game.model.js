import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db-config.js";

const db = await connectionDb();

export const Game = db.define(
    'Games', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
