import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/db.config.js";

const db = new MysqlDB()
const connection = db.connectionBdd

export const Game = connection.define(
    'Game', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    })
