import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/db.config.js";

const db = new MysqlDB()
const connection = db.connectionBdd

export const Team = connection.define('TeamsName', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
