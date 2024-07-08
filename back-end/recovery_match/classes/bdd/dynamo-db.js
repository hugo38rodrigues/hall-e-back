import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { connectionDynamoDb } from "../../bdd-config/config-connection.js";
import { Storage } from '../interface/storage.js';

export class DynamoDB extends Storage {
  constructor() {
    super();
  }

  checkData = async (match, tableName, db) => {
    const params = {
      TableName: tableName,
      Key: {
        id_match: { N: match },
      },
    };

    try {
      const data = await db.send(new GetItemCommand(params));
      return data.Item !== undefined;
    } catch (error) {
      console.error(`Erreur lors de la vérification du match ${match} dans la table ${tableName}:`, error);
      throw error;
    }
  }


  insertInDB = async (match, tableName, db) => {
    const params = {
      TableName: tableName,
      Item: {
        id_match: { N: match.idMatch },
        date: { S: match.date.toString() },
        game_name: { S: match.gameName },
        league_name: { S: match.leagueName },
        teams_name: { SS: match.teamsName }
      }
    };

    try {
      const data = await db.send(new PutItemCommand(params));
      return data;
    } catch (error) {
      console.error(`Erreur lors de l'insertion du match ${match.idMatch} dans la table ${tableName}:`, error);
      throw error;
    }
  }

  saveMatches = async (matches, tableName) => {
    const db = connectionDynamoDb();
    try {
      for (const match of matches) {
        const matchIsFound = await this.checkData(match.idMatch, tableName, db);
        if (!matchIsFound) {
          this.insertInDB(match, tableName, db)
        } else {
          console.log(`This ${match.idMatch} found in db`)
        }
      }
      console.log("################## SucessFull Insert Data ##################")
    } catch (error) {
      console.log(error)
      process.exit()
    }
  }

}
