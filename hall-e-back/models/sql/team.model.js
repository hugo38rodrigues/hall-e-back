import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db.config.js";

export const Team = connectionDb.define('TeamsName', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
