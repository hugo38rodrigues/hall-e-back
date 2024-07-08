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
  const client = connectionDynamoDb()
  if (!(client instanceof DynamoDBClient)) {
    console.error("############ DATABASE CONNECTION NOT ESTABLISHED ############");
    return;
  }

  for (const tableParams of tablesToCreate) {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableParams.TableName }));
      console.log(`The ${tableParams.TableName} table already exists.`);
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        try {
          const data = await client.send(new CreateTableCommand(tableParams));
          console.log(`Table ${tableParams.TableName} created successfully.`, data);

        } catch (createErr) {
          console.error(`Unable to create table ${tableParams.TableName}. Error:`, createErr);
        }
      } else {
        console.error(`Error when checking table ${tableParams.TableName}. Error:`, err);
      }
    }
  }
};



