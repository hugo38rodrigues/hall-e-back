import { DynamoDB } from './bdd/dynamo-db.js';
import { BDD_NAME, TABLES_NAME } from "../utils/saving-matches.util.js";
import { MysqlDB } from "./bdd/mysql-db.js";


export class SavingMatches {
    constructor(bddTarget) {
        this.bddTarget = bddTarget

    }



    saveMatches = async (matches) => {
        if (this.bddTarget === BDD_NAME.dynamodb) {
            const dynamoDb = new DynamoDB()
            await dynamoDb.saveMatches(matches, this.bddTarget, TABLES_NAME);
        }
        else if (this.bddTarget === BDD_NAME.mysql) {
            const mysqlDb = new MysqlDB()
            // mysqlDb.isConnected()
            await mysqlDb.saveMatches(matches, TABLES_NAME);
            // } else {
            //     console.log("Erreur lors de la connection")
            //     process.exit(1)
            // }
        }
    }
}