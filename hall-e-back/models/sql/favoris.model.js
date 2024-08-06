import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/sql/mysql.config.js";

const db = new MysqlDB()
const connection = db.connection

export const Favori = connection.define(
    'Favoris',
    {
        favoriteable_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        favoriteable_type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
