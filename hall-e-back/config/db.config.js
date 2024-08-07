import {Sequelize} from "sequelize";
import {UserMysqlService} from "../services/user/user.mysql.service.js";
import {UserDynamoService} from "../services/user/user.dynamo.service.js";
import {UserMangoService} from "../services/user/user.mango.service.js";

const BDD_TARGET = process.env.BDD_TARGET

export const connectionDb = async () => {
    switch (BDD_TARGET) {
        case 'mysql':
            return new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                port: process.env.DB_PORT
            })
        case 'dynamodb':
            console.log('In Progress')
            break
        case 'mangodb':
            console.log('In Progress')
            break
        default:
            console.log(`Not found ${BDD_TARGET}`)
    }
}

export const userInstance = (bddTarget) => {
    switch(bddTarget){
        case 'mysql':
            return new UserMysqlService()
        case 'mangodb':
            return new UserMangoService()
        case 'dynamodb':
            return new UserDynamoService()
    }
}

export const barInstance = (bddTarget) => {
    switch(bddTarget){
        case 'mysql':
            return new BarMysqlService()
        case 'mangodb':
            return new BarMangoService()
        case 'dynamodb':
            return new BarDynamoService()
    }
}

export const consumerInstance = (bddTarget) => {
    switch(bddTarget){
        case 'mysql':
            return new ConsumerMysqlService()
        case 'mangodb':
            return new ConsumerMangoService()
        case 'dynamodb':
            return new ConsumerDynamoService()
    }
}
