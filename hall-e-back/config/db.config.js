import { CommunMysqlService } from '../services/commun/commun.mysql.service.js'
import { ConsumerMysqlService } from '../services/consumer/consumer.mysql.service.js'
import { BarMysqlService } from '../services/bar/bar.mysql.service.js'

export const communInstance = (bddTarget) => {
    switch (bddTarget) {
        case 'mysql':{
            return new CommunMysqlService()
        }
        // case 'mangodb':
        //     return new UserMangoService()
        // case 'dynamodb':
            // return new UserDynamoService()
        default: {
         console.log(`${bddTarget} is not supported`)   
        }
    }
}


export const barInstance = (bddTarget) => {
    switch (bddTarget){
        case 'mysql':
            return new BarMysqlService()
        // case 'mangodb':
        //     return new BarMangoService()
        // case 'dynamodb':
        //     return new BarDynamoService()
        default:
            console.log(`${bddTarget} is not supported`)
    }
}

export const consumerInstance = (bddTarget) => {
    switch (bddTarget){
        case 'mysql':
            return new ConsumerMysqlService()
        // case 'mangodb':
            // return new ConsumerMangoService()
        // case 'dynamodb':
            // return new ConsumerDynamoService()
        default: 
        console.log(`${bddTarget} is not supported`)
    }
}
