import mysql from "mysql2/promise";

export class SqlDbTables {
  #connexion
  #tables
  constructor() {
    this.#connexion = null
    this.#tables = [`CREATE TABLE IF NOT EXISTS consumers(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      token  VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL
    )`, `CREATE TABLE IF NOT EXISTS bar(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      token  VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL
    )`, `CREATE TABLE IF NOT EXISTS admin(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      idComment 
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      token  VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL
    )`]
  }

  #initConnection = async () => {
    try {
      this.#connexion = await mysql.createConnection({
        host: process.env.DB_HOST, user:
          process.env.DB_USER, password:
          process.env.DB_PASSWORD, database:
          process.env.DB_NAME, port:
          process.env.DB_PORT
      })
    } catch (error) {
      console.log('Error Connexion', error)
    }
  }

  createdSqlTables = async () => {
    if (!this.#connexion) {
      await this.#initConnection()
    }
    try {
      for (table in this.#tables) {
        await this.#connexion.execute(table)
        console.log("Successfully Creation tables")
      }
    } catch (e) {
      console.log(`Error in creation tables ${e}`)
    } finally {
      try {
        await this.#connexion.end();
        console.log("############ END CONNEXION FOR DB  ############")
      } catch (endError) {
        console.error('Erreur lors de la fermeture de la connexion :', endError);
      }
    }
  }
}
