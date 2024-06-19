import {TABLES_NAME} from "../utils/saving-matches.util.js";
import { connectionMysql } from "./db.config.js";

export const createTableSQl = async ()=> {
  const db = await connectionMysql
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

  db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion :', err);
      return;
    }
    console.log('Connecté à la base de données MySQL');
    try {
      db.query(lolTable)
      db.query(csTable)
      db.query(valorantTable)
      console.log("Successfully Creation tables")
    }catch (e) {
      console.log(`Error in creation tables ${e}`)
    }
  })
}