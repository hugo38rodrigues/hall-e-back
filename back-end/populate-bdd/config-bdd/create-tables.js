import AWS from "aws-sdk";
export const createTables = () => {
  AWS.config.update({
    region: "ap-euw-2",
    endpoint: "http://localhost:8000",
    accessKeyId: 'fakeMyAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKe'
  });

  const dynamodb = new AWS.DynamoDB();

  const createTable = (params) => {
    dynamodb.createTable(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    });
  };

  // Création de la table LolMatches
  createTable({
    TableName: "LolMatches",
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  });

  // Création de la table ValorantMatches
  createTable({
    TableName: "ValorantMatches",
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  });

  // Création de la table CsGoMatches
  createTable({
    TableName: "CsGoMatches",
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  });
}