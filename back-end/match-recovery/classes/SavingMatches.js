import { DynamoDBStorage } from './bdd/dynamo-db';

export class SavingMatches {
    constructor( configDynamoDb) {
        this.configDynamoDb = configDynamoDb;
        this.dynamoDb = new DynamoDBStorage(this.configDynamoDb)
    }

    saveMatches = async (matches, nameTable) => {
       await this.dynamoDb.saveMatches(matches, nameTable);
    }
}