import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/db.config.js";

const db = new MysqlDB()
const connection = db.connection

export const Favorite = connection.define(
    'Favorites',
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
