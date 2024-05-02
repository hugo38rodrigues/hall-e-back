// dynamoDBStorage.js
import { AWS } from 'aws-sdk';
import { Storage } from '../storage';

class DynamoDBStorage extends Storage {
  constructor(config) {
    super();
    _this.docClient = new AWS.DynamoDB.DocumentClient(config);
    _this.LolTable = 'lol_match'
    _this.ValorantTable = 'valorant_match'
    _this.CsGoTable = 'csgo_match'
  }

  async saveLolMatch(data) {
    const params = {
      TableName: this.LolTable,

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

  async saveValorantMatchMatch(data) {
    const params = {
      TableName: this.ValorantTable,
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

export default DynamoDBStorage;