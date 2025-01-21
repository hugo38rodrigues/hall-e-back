import dotenv from 'dotenv';
import { Database } from './database.js';
dotenv.config()
 
export const databaseFactory = () => {
	
  const bddTarget = process.env.BDD_TARGET
	const configSql = {}
	const configDynamodb = {}
  const configMongodb = {
		url: process.env.URL_MONGO_DB,
		username: process.env.USERNAME_MONGO,
		password: process.env.PASSWORD_MONGO,
		nameDatabase: process.env.DB_NAME_MONGO,
    bddTarget
	}
  const config = bddTarget === 'mongodb' ? configMongodb : bddTarget === 'sql' ? configSql : configDynamodb
	
	if (Object.keys(config).length > 0) {
		return new Database(config)
	}	
	throw Error('Config empty')
	
}

const profile1 = {
	name: 'barTest',
	role: 'bar',
	email: 'hugo38.rodrigues@gmail.com',
	address: '5 rue de la libération, 38610, Gières',
	password: '5DDDcdxxsq'
}
const profile2 = {
	lastName: 'client1',
	firstName: 'clientTest',
	role:'client',
	email: 'hugo39.rodrigues@gmail.com',
	password: '5DDDcdxxss',
}

const dataBase = databaseFactory()
const userInstance = await dataBase.usersInstances()
await userInstance.addUser(profile1)
await userInstance.addUser(profile2)
await userInstance.getProfileUser('hugo38.rodrigues@gmail.com')
await userInstance.getProfileUser('hugo39.rodrigues@gmail.com')
await userInstance.getProfileUser('hugo40.rodrigues@gmail.com')


