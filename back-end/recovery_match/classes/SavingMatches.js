import { BDD_NAME, TABLES_NAME } from "../utils/saving-matches.util.js";
import { DynamoDB } from './bdd/dynamo-db.js';
import { MysqlDB } from "./bdd/mysql-db.js";


export class SavingMatches {
    constructor(bddTarget) {
        this.bddTarget = bddTarget
    }

    saveMatches = async (matches,table) => {
        if (this.bddTarget === BDD_NAME.dynamodb) {
            const dynamoDb = new DynamoDB()
            await dynamoDb.saveMatches(matchesLol, this.bddTarget, TABLES_NAME);
        }
        else if (this.bddTarget === BDD_NAME.mysql) {
            const mysqlDb = new MysqlDB()
            await mysqlDb.saveMatches(matches, table);

        }
    }
}