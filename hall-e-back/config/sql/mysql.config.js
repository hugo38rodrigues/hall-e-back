import { Storage } from '../../interface/storage.js'
import { Sequelize } from "sequelize";

export class MysqlDB extends Storage {
    constructor() {
        super();
        this.connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            port: process.env.DB_PORT
        })
    }
}