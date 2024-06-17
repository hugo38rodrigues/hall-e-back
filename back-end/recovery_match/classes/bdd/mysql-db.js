import mysql from 'mysql2';
import {Storage} from '../interface/storage.js';
import dotenv from 'dotenv';

dotenv.config();

export class MysqlDB extends Storage {
    constructor() {
        super();
        this.db =  mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            // database: process.env.DB_NAME,/**/
            port: process.env.DB_PORT
        })
    }


    async saveMatches(matches, tablesName) {
        for (const tableName of tablesName) {
            for (const match of matches) {
                console.log(match)
                await this.db.execute(`INSERT TO ${tableName} (id_match,name_game, league_name, teams_names) VALUES ${match.idMatch}, ${match.nameGame}, ${match.leagueName}, ${match.teamsNames}`, (err, result) => {
                    if (err) throw err;
                    console.log("Result: " + result);
                });
            }
        }
    }
}


