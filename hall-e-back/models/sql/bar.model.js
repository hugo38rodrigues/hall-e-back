import {DataTypes} from 'sequelize'
import {MysqlDB} from "../../config/sql/mysql.config.js";

const db = new MysqlDB()
const connection = db.connection

export const Bar = connection.define(
    'Bars',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
        },
        description: {
            type: DataTypes.STRING,
        },
        photo: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING(1234),
            allowNull: false
        },
        like_consumer: {
            type: DataTypes.INTEGER
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
