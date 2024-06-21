import {TABLES_NAME} from "../utils/saving-matches.util.js";
import {connectionDynamoDb, connectionMysql} from "./db.config.js";
import {BillingMode, CreateTableCommand } from "@aws-sdk/client-dynamodb";

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
  const client = await connectionDynamoDb()
  const lolTable = new CreateTableCommand({
    TableName: TABLES_NAME.lol,
    // This example performs a large write to the database.
    // Set the billing mode to PAY_PER_REQUEST to
    // avoid throttling the large write.
    BillingMode: BillingMode.PAY_PER_REQUEST,
    // Define the attributes that are necessary for the key schema.
    AttributeDefinitions: [
      {
        AttributeName: "id_match",
        // 'N' is a data type descriptor that represents a number type.
        // For a list of all data type descriptors, see the following link.
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
        AttributeType: "N",
      },
    ],
    // The KeySchema defines the primary key. The primary key can be
    // a partition key, or a combination of a partition key and a sort key.
    // Key schema design is important. For more info, see
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html
    KeySchema: [
      // The way your data is accessed determines how you structure your keys.
      // The movies table will be queried for movies by year. It makes sense
      // to make year our partition (HASH) key.
      { AttributeName: "id_match", KeyType: "HASH" },
    ],
  });
  const response = await client.send(lolTable);
  console.log(response);

}