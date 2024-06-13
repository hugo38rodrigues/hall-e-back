import AWS from "aws-sdk";
import mysql from "mysql";

export class CreateTables {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // createTable = (params) => {
  //   dynamodb.createTable(params, (err, data) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log(JSON.stringify(data, null, 2));
  //     }
  //   });
  // };
  //
  // createTable({
  //   TableName: this.tableName,
  //   AttributeDefinitions: [
  //     { AttributeName: 'id', AttributeType: 'N' },
  //   ],
  //   KeySchema: [
  //     { AttributeName: "id", KeyType: "HASH" },
  //   ],
  //   ProvisionedThroughput: {
  //     ReadCapacityUnits: 1,
  //     WriteCapacityUnits: 1
  //   }
  // });

}