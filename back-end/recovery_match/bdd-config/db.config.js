import mysql from "mysql2/promise";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const connectionMysql = async () => {
        console.log("############ DATABASE CONNECTION ESTABLISHED ############")
        return mysql.createConnection({
                host: process.env.DB_HOST,user:
                process.env.DB_USER,password:
                process.env.DB_PASSWORD,database:
                process.env.DB_NAME,port:
                process.env.DB_PORT
        })
}

export  const connectionDynamoDb = async () => {
  console.log("############ DATABASE CONNECTION ESTABLISHED ############")
  return new DynamoDBClient({
    region: process.env.BDD_REGION,
    endpoint: process.env.ENDPOINT,
    access_key_id: process.env.ACCESS_KEY_ID,
    secret_key_id: process.env.SECRET_ACCESS_KEY
  })

}
