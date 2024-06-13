import {Storage} from "../interface/storage.js";
import mysql from 'mysql'

export class MysqlDB extends Storage {
    constructor() {
        super();
        this.con = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD
        });
    }

    async saveMatches(matches, tablesName) {
        this.con.connect((err) => {
            if (err) throw err;
            console.log("Connected!");
            for (const tableName in tablesName) {
                for (const match in matches) {
                    this.con.query(`INSERT TO ${tableName} (id_match,name_game, league_name, teams_names) VALUES ${match.idMatch}, ${match.nameGame}, ${match.leagueName}, ${match.teamsNames}`, (err, result) => {
                        if (err) throw err;
                        console.log("Result: " + result);
                    });
                }
            }
        })
    }

}