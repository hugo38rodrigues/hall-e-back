import { Sequelize } from 'sequelize'

const dbConfig = {
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	dialect: 'mysql',
	port: process.env.DB_PORT,
	logging: console.log,
}

// Initialisation de Sequelize
export const sequelize = new Sequelize({
	database: dbConfig.database,
	username: dbConfig.username,
	password: dbConfig.password,
	dialect: dbConfig.dialect,
	host: dbConfig.host,
	port: dbConfig.port,
	logging: dbConfig.logging,
})
