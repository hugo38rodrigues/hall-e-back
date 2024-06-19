import {TABLES_NAME} from "../utils/saving-matches.util.js";
import { connectionMysql } from "./db.config.js";

export const createTableSQl = async ()=> {

  const db = await connectionMysql();
  const lolTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.lol}(
      id INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INTEGER NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  const csTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.cs}(
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INT NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  const valorantTable = `CREATE TABLE IF NOT EXISTS ${TABLES_NAME.valorant}(
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      id_match INT NOT NULL,
      date DATETIME NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      league_name VARCHAR(255) NOT NULL,
      teams_name VARCHAR(255) NOT NULL
  )`
  try {
    await db.execute(lolTable)
    await db.execute(csTable)
    await db.execute(valorantTable)
    console.log("Successfully Creation tables")
    } catch (e) {
      console.log(`Error in creation tables ${e}`)
    }finally {
      try {
        await db.end();
        console.log("############ END CONNEXION FOR DB  ############")
      } catch (endError) {
        console.error('Erreur lors de la fermeture de la connexion :', endError);
      }
  }

}