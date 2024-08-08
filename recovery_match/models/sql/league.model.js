import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db-config.js";


const db = await connectionDb();

export const League = db.define('Leagues', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
