import { Mysql } from "./classes/mysql-config.js";

const BDD_TARGET = process.env.BDD_TARGET

switch(BDD_TARGET){
    case 'mysql':
        console.log("############ START PROCESS FOR TABLES CREATION ############")
        const mysql = new Mysql()
        await mysql.synchronizationDb()
        console.log("############ END PROCESS FOR TABLES CREATION ############")
        process.exit()
        break
    case 'dynamodb':
        // console.log("############ START PROCESS FOR TABLES CREATION ############")
        // const dynamodbTable = new DynamoDbTables()
        // await dynamodbTable.createdTables()
        // console.log("############ END PROCESS FOR TABLES CREATION ############")
        break
    case 'mangodb':
        // console.log("############ START PROCESS FOR TABLES CREATION ############")
        // console.log("In progress ...")
        // console.log("############ END PROCESS FOR TABLES CREATION ############")
        break
    default:
        console.log(`############ ${BDD_TARGET} IS NOT FOUND ############`)
}

