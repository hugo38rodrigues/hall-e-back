import mysql from "mysql2/promise";
import { Table } from '../classes/interface/table.js';

export class SqlDbTables extends Table {
  #connexion
  #table

  constructor() {
    super()
    this.#connexion = null
    this.#table = `CREATE TABLE IF NOT EXISTS matches(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INTEGER NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
    )`
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

  createdTables = async () => {
    if (!this.#connexion) {
      await this.#initConnection()
    }

    try {
      await this.#connexion.execute(this.#table)
      console.log("Successfully Creation tables")
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