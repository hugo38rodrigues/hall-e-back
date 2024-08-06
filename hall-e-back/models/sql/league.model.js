import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/sql/mysql.config.js";

const db = new MysqlDB()
const connection = db.connectionBdd

export const League = connection.define('League', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
