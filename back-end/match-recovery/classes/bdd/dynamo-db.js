import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { Storage } from '../interface/storage.js';

export class DynamoDBStorage extends Storage {
  constructor(config) {
    super();
    this.client = new DynamoDBClient(config);
  }

  async saveMatches(data, nameTable) {
    const params = {
      TableName: nameTable,
      Item: {
        id: { 'N': data[0].id },
        date: { "S": data[0].date },
        teamNames: { "SS": data[0].teamNames },
        leagueName: { "S": data[0].leagueName }
      }
    };

    try {
      const command = new PutItemCommand(params);
      const response = await this.client.send(command);
      console.log('Item saved successfully:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Unable to add item:', error);
      throw error;
    }
  }
}
