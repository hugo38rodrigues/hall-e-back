import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../classes/bdd/mysql-db.js";

const db = new MysqlDB()
const connection = db.connectionBdd
export const Team = connection.define('TeamsName', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
