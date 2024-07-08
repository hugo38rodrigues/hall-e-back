import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import mysql from "mysql2/promise";


export const connectionMysql = async () => {
    console.log("############ DATABASE CONNECTION ESTABLISHED ############")
    return mysql.createConnection({
        host: process.env.DB_HOST, user:
            process.env.DB_USER, password:
            process.env.DB_PASSWORD, database:
            process.env.DB_NAME, port:
            process.env.DB_PORT
    })
}

export const connectionDynamoDb = () => {
    console.log("############ DATABASE CONNECTION ESTABLISHED ############")
    return new DynamoDBClient({
        endpoint: process.env.ENDPOINT,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        }
    });
};







