import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { Storage } from './storage.js';

export class DynamoDBStorage extends Storage {
  constructor(config) {
    super();
    this.client = new DynamoDBClient(config);
    this.LolTable = 'LolMatches';
    this.ValorantTable = 'ValorantMatches';
    this.CsGoTable = 'CsGoMatches';
  }

  async saveLolMatch(data) {

    const params = {
      TableName: this.LolTable,
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
      console.log('Item saved successfully:', JSON.stringify(respo444nse, null, 2));
    } catch (error) {
      console.error('Unable to add item:', error);
      throw error;
    }
  }

  async saveCsGoMatch(data) {
    const params = {
      TableName: this.CsGoTable,
      Item: data
    };
    try {
      const data = await this.docClient.put(params).promise();
      console.log('Item saved successfully:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Unable to add item:', error);
      throw error;
    }
  }

  async saveValorantMatch(data) {
    const params = {
      TableName: this.CsGoTable,
      Item: data
    };
    try {
      const data = await this.docClient.put(params).promise();
      console.log('Item saved successfully:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Unable to add item:', error);
      throw error;
    }
  }
}
