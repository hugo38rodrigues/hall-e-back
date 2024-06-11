import AWS from "aws-sdk";
export class CreateTables {
  constructor(tableName) {
    this.config =  AWS.config.update({
      region: "ap-euw-2",
      endpoint: "http://localhost:8000",
      accessKeyId: 'fakeMyAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKe'
    });
    this.dynamodb = new AWS.DynamoDB();
    this.tableName = tableName;
  }

  createTable = (params) => {
    dynamodb.createTable(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    });
  };

  createTable({
    TableName: this.tableName,
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