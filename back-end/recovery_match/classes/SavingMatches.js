import { DynamoDBStorage } from './bdd/dynamo-db.js';

export class SavingMatches {
    constructor( configDynamoDb) {
        this.dynamoDb = new DynamoDBStorage(configDynamoDb)
    }

    saveMatches = async (matches, nameTable) => {
       await this.dynamoDb.saveMatches(matches, nameTable);
    }
}