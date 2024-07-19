import { Sequelize } from 'sequelize';
export class DB {
  constructor() {
    this.connexion = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: process.env.DB_PORT
    });
  }

  testConnexion = async () => {
    try {
      await this.connexion.authenticate();
      return true
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1)
    }
  }
}


