import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db.config.js";

export const League = connectionDb.define('League', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
