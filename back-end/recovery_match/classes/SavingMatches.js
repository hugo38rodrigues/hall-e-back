import { DynamoDBStorage } from './bdd/dynamo-db.js';
import {BDD_NAME} from "../utils/saving-matches.util.js";

export class SavingMatches {
    constructor( configDb, bddTarget) {
        this.configDb = configDb
        this.bddTarget = bddTarget
    }

    saveMatches = async (matches) => {
        if(this.bddTarget === BDD_NAME.dynamodb) {
            const dynamoDb = new DynamoDBStorage(this.configDb)
            await dynamoDb.saveMatches(matches);
        }
        else if (this.bddTarget === BDD_NAME.mysql) {
            const mysqlDb = new DynamoDBStorage(this.configDb)
            await mysqlDb.saveMatches(matches);
        }
    }
}