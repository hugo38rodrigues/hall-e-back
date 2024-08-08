import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db-config.js";

const db = await connectionDb();

export const Team = db.define('Teams', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
