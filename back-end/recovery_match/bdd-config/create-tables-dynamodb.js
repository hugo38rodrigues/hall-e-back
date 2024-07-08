import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TABLES_NAME } from "../utils/saving-matches.util.js";
import { connectionDynamoDb } from "./config-connection.js";


const tablesToCreate = [
  {
    TableName: TABLES_NAME.lol,
    AttributeDefinitions: [
      { AttributeName: 'id_match', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'id_match', KeyType: 'HASH' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: TABLES_NAME.cs,
    AttributeDefinitions: [
      { AttributeName: 'id_match', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'id_match', KeyType: 'HASH' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: TABLES_NAME.valorant,
    AttributeDefinitions: [
      { AttributeName: 'id_match', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'id_match', KeyType: 'HASH' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

export const createTablesDynamo = async () => {
  const client = connectionDynamoDb();
  console.log(client)
  if (!(client instanceof DynamoDBClient)) {
    console.error("############ DATABASE CONNECTION NOT ESTABLISHED ############");
    return;
  }

  console.log("############ DATABASE CONNECTION ESTABLISHED ############");

  for (const tableParams of tablesToCreate) {
    try {
      // Vérifier si la table existe
      await client.send(new DescribeTableCommand({ TableName: tableParams.TableName }));
      console.log(`La table ${tableParams.TableName} existe déjà.`);
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        // La table n'existe pas, donc nous la créons
        try {
          const data = await client.send(new CreateTableCommand(tableParams));
          console.log(`Table ${tableParams.TableName} créée avec succès.`, data);

        } catch (createErr) {
          console.error(`Impossible de créer la table ${tableParams.TableName}. Erreur:`, createErr);
        }
      } else {
        // Une autre erreur s'est produite
        console.error(`Erreur lors de la vérification de la table ${tableParams.TableName}. Erreur:`, err);
      }
    }
  }
};



