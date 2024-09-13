import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient
} from '@aws-sdk/client-dynamodb'
import { Table } from '../classes/interface/table.js'

export class DynamoDbTables extends Table {
  #connexion
  #table

  constructor () {
    super()
    this.#connexion = null

    this.#table = {
      TableName: 'matches',
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
  }

  #initConnexion = async () => {
    try {
      this.#connexion = new DynamoDBClient({
        endpoint: process.env.ENDPOINT,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        }
      })
    } catch (error) {
      console.log('Error Connexion', error)
      process.exit()
    }
  }

  createdTables = async () => {

    if (!this.#connexion) {
      await this.#initConnexion()
    }
    
    try {
      await this.#connexion.send(new DescribeTableCommand(this.#table.TableName))
      console.log(`The ${this.#table.TableName} table already exists.`)
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        try {
          const data = await this.#connexion.send(new CreateTableCommand(this.#table))
          console.log(`Table ${this.#table.TableName} created successfully.`, data)
        } catch (createErr) {
          console.error(`Unable to create table ${this.#table.TableName}. Error:`, createErr)
        }
      } else {
        console.error(`Error when checking table ${this.#table.TableName}. Error:`, err)
      }
    }
  }
}
