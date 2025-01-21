
import { verifyConnexion, registerModels } from './config/mongo.config.js'
import { UserMongoDbService } from './services/mongodb/user.mongodb.js'

export class Database {

	constructor (config) {
		this.bddTarget = config.bddTarget
		this.config = config
	}
	
	usersInstances = async() => {
		switch (this.bddTarget) {
			case 'mysql': {
				return new UsersMysqlService()
			}
			case 'mongodb':
				const isConnectedBdd = await verifyConnexion(this.config)
				if (isConnectedBdd)
					{
						registerModels()
						return new UserMongoDbService(this.config) 
					} 
			default: {
				console.error(`${this.bddTarget} is not supported`)
			}
		}
	}
	
	barInstance(){
		switch (this.bddTarget) {
			case 'mysql':
				return new BarMysqlService()
			case 'mangodb':
			    return new BarMangoService()
			default:
				console.log(`${this.bddTarget} is not supported`)
		}
	}
	
	clientInstance(){
		switch (this.bddTarget) {
			case 'mysql':
				return new ClientMysqlService()
			case 'mangodb':
			return new ClientMangoService()
			default:
				console.log(`${this.bddTarget} is not supported`)
		}
	}
	
	recoveryMatchesInstance(){
		switch (this.bddTarget) {
			case 'mysql':
				return new RecoveryMatchesMysqlService()
			case 'mangodb':
				return new RecoveryMatchesMangoService()
			default:
				console.log(`${this.bddTarget} is not supported`)
		}
	}

}