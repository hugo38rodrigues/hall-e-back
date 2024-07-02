import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Storage } from '../interface/storage.js';
import {connectionDynamoDb} from "../../bdd-config/db.config.js";

export class DynamoDB extends Storage {
  constructor() {
    super();
  }

  checkData = async (match, tableName, db) => {
    const item = new GetItemCommand({
      TableName: tableName,
      Key: {
        id_match: {N: match.idMatch},
      },
    });

    const response = await db.send(item);
    console.log(response);
    return response;
  }


  writeMatchesInDb = async (matches, tableName) => {
    const db = await connectionDynamoDb();
    for (const match of matches) {
      const exists = await this.checkData(match, tableName, db);
      console.log(exists.$metadata.httpStatusCode)
      if (exists.$metadata.httpStatusCode === 400) {
        console.log(`Match with id ${match.idMatch} already exists in ${tableName}.`);
      } else {
        console.log("Ça arrive")
      }
    }
  }

  saveMatches = async (matches, tableName) => {
    try {
      await this.writeMatchesInDb(matches, tableName);
    } catch (error) {
      console.error('Erreur lors de l\'insertion :', error);
    }
  }

}
