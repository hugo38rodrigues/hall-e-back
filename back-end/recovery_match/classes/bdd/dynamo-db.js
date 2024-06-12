import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { Storage } from '../interface/storage.js';

export class DynamoDBStorage extends Storage {
  constructor(config) {
    super();
    this.client = new DynamoDBClient(config);
  }

  async saveMatches(data, nameTable) {
    data.map(match => {
      const params = {
        TableName: nameTable,
        Item: {
          id: { 'N': match.id },
          date: { "S": match.date },
          teamNames: { "SS": match.teamNames },
          leagueName: { "S": match.leagueName }
        }
      };
    })


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
