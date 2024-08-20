import { Sequelize } from 'sequelize'
import { BDD_TARGET } from '../utils/constants.utils.js'

export const connectionDb = async () => {
  switch (BDD_TARGET) {
  case 'mysql':
    return new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: process.env.DB_PORT
    })
  case 'dynamodb':
    console.log('In Progress')
    break
  case 'mangodb':
    console.log('In Progress')
    break
  default:
    console.log(`Not found ${BDD_TARGET}`)
  }
}