import dotenv from 'dotenv';
import mysql from 'mysql2';
import { Storage } from '../interface/storage.js';

dotenv.config();

export class MysqlDB extends Storage {
    constructor() {
        super();
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        })
    }
    checkData = async (match, tableName) => {
        const checkQuery = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id_match = ${match.idMatch}`;
        const rows = await this.db.execute(checkQuery);
        console.log(rows)
        return rows
    }
    async

    async saveMatches(matches, tableName) {
        for (const match of matches) {
            try {
                if (this.checkData(match, tableName).count > 0) {
                    console.log(`id_match ${match.idMatch} already exists in ${tableName}`);
                } else {
                    const insertQuery = `INSERT INTO ${tableName} (id_match, name_game, league_name, teams_names) VALUES (?, ?, ?, ?)`;
                    const values = [match.idMatch, match.nameGame, match.leagueName, match.teamsNames];
                    const result = await this.db.execute(insertQuery, values);
                    console.log("Inserted Result: ", result);
                }
            } catch (err) {
                console.error("Error: ", err);
                throw err;
            }
        }
    }
}


