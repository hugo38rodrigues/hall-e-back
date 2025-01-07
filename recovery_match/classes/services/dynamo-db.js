import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { Storage } from '../interface/storage.js'

export class DynamoDB extends Storage {
	#connectionBdd

	constructor () {
		super()
		this.#connectionBdd = null
	}
  
	#initConnection = async () => {
		try {
			this.#connectionBdd = new DynamoDBClient({
				endpoint: process.env.ENDPOINT,
				credentials: {
					accessKeyId: process.env.ACCESS_KEY_ID,
					secretAccessKey: process.env.SECRET_ACCESS_KEY,
				}
			})
		} catch (error) {
			console.log('Error Connexion', error)
		}
	}


	#checkedData = async (match) => {
		const params = {
			TableName: 'matches',
			Key: {
				id_match: { N: match },
			},
		}
		if (!this.#connectionBdd) {
			this.#initConnection()
		}

		try {
			const data = await this.#connectionBdd.send(new GetItemCommand(params))
			return data.Item !== undefined
		} catch (error) {
			console.error(`Error checking match ${match} in table matches:`, error)
			throw error
		}
	}


	#insertMatchInDb = async (match) => {
		const params = {
			TableName: 'matches',
			Item: {
				id_match: { N: match.idMatch },
				date: { S: match.date.toString() },
				game_name: { S: match.gameName },
				league_name: { S: match.leagueName },
				teams_name: { SS: match.teamsName }
			}
		}

		try {
			const data = await this.#connectionBdd.send(new PutItemCommand(params))
			return data
		} catch (error) {
			console.error(`Error inserting match ${match.idMatch} into table matches:`, error)
			throw error
		}
	}

	savingMatches = async (matches) => {
		try {
			for (const match of matches) {
				const matchIsFound = await this.#checkedData(match.idMatch)
				if (!matchIsFound) {
					this.#insertMatchInDb(match)
				} else {
					console.log(`This ${match.idMatch} found in db`)
				}
			}
			console.log('################## Data insertion successful for Match ##################')
		} catch (error) {
			console.log(error)
			process.exit()
		}
	}

}
