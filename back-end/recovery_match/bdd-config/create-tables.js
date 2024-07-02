import { TABLES_NAME } from "../utils/saving-matches.util.js";
import { connectionDynamoDb, connectionMysql } from "./db.config.js";
import {CreateTableCommand, ListTablesCommand} from "@aws-sdk/client-dynamodb";

export const createTableSQl = async ()=> {

  const db = await connectionMysql();
  const lolTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.lol}(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INTEGER NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  const csTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.cs}(
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INT NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  const valorantTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.valorant}(
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INT NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  try {
    await db.execute(lolTable)
    await db.execute(csTable)
    await db.execute(valorantTable)
    console.log("Successfully Creation tables")
    } catch (e) {
      console.log(`Error in creation tables ${e}`)
    }finally {
      try {
        await db.end();
        console.log("############ END CONNEXION FOR DB  ############")
      } catch (endError) {
        console.error('Erreur lors de la fermeture de la connexion :', endError);
      }
    }
  }

export const createTablesDynamo = async () => {
    const client = await connectionDynamoDb();


  const listTablesCommand = new ListTablesCommand({});
  try {
    const tablesResponse = await client.send(listTablesCommand);
    console.log("Tables existantes :", tablesResponse.TableNames);
  } catch (error) {
    console.error("Erreur lors de l'exécution de la commande :", error);
  }

    //
    // // Créer la table si elle n'existe pas
    // const lolTable = new CreateTableCommand({
    //   TableName: "Lol_Match",
    //   AttributeDefinitions: [
    //     {
    //       AttributeName: "id_match",
    //       AttributeType: "N", // Type numérique pour l'attribut
    //     },
    //   ],
    //   KeySchema: [
    //     {AttributeName: "id_match", KeyType: "HASH"},
    //   ],
    //   ProvisionedThroughput: {
    //     ReadCapacityUnits: 1,
    //     WriteCapacityUnits: 1,
    //   },
    // });
    //
    // try {
    //   const response = await client.send(lolTable);
    //   console.log("Table créée avec succès:", response);
    // } catch (error) {
    //   console.error("Erreur lors de la création de la table:", error);
    // }
}