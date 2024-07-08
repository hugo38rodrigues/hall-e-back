import { BDD_NAME } from "../utils/saving-matches.util.js";
import { DynamoDB } from './bdd/dynamo-db.js';
import { MysqlDB } from "./bdd/mysql-db.js";


export class SavingMatches {
    constructor(bddTarget) {
        this.bddTarget = bddTarget
    }

    saveMatches = async (matches, table) => {
        if (this.bddTarget === BDD_NAME.dynamodb) {
            const dynamoDb = new DynamoDB()
            await dynamoDb.saveMatches(matches, table);
        }
        else if (this.bddTarget === BDD_NAME.mysql || BDD_NAME.mariadb) {
            const mysqlDb = new MysqlDB()
            await mysqlDb.saveMatches(matches, table);

        }
    }
}