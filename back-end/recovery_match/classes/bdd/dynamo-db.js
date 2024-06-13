import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { Storage } from '../interface/storage.js';

export class DynamoDB extends Storage {
  constructor() {
    super();
    this.config= {
      region: process.env.BDD_REGION,
      endpoint: process.env.ENDPOINT,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
    this.client = new DynamoDBClient(this.config);
  }
  //
  // async saveMatches(data) {
  //   data.map(match => {
  //     const params = {
  //       TableName: this.nameTable,
  //       Item: {
  //         id: { 'N': match.id },
  //         date: { "S": match.date },
  //         teamNames: { "SS": match.teamNames },
  //         leagueName: { "S": match.leagueName }
  //       }
  //     };
  //   })


    // try {
    //   const command = new PutItemCommand(params);
    //   const response = await this.client.send(command);
    //   console.log('Item saved successfully:', JSON.stringify(response, null, 2));
    // } catch (error) {
    //   console.error('Unable to add item:', error);
    //   throw error;
    // }
  }
}
