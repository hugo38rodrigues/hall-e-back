import { UserMysqlService } from '../services/user/user.mysql.service.js'

export const userInstance = (bddTarget) => {
    switch (bddTarget) {
        case 'mysql':{
            return new UserMysqlService()
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


// export const barInstance = (bddTarget) => {
//     switch (bddTarget){
//         case 'mysql':
//             return new BarMysqlService()
//         case 'mangodb':
//             return new BarMangoService()
//         case 'dynamodb':
//             return new BarDynamoService()
//     }
// }

// export const consumerInstance = (bddTarget) => {
//     switch (bddTarget){
//         case 'mysql':
//             return new ConsumerMysqlService()
//         case 'mangodb':
//             return new ConsumerMangoService()
//         case 'dynamodb':
//             return new ConsumerDynamoService()
//     }
// }
