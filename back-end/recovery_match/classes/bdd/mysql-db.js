import dotenv from 'dotenv';
import { connectionMysql } from "../../bdd-config/config-connection.js";
import { Storage } from '../interface/storage.js';

dotenv.config();

export class MysqlDB extends Storage {
    constructor() {
        super();
    }

    checkData = async (match, tableName, db) => {
        const checkQuery = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id_match = ?`;
        try {
            const [rows] = await db.execute(checkQuery, [match.idMatch]);
            return rows[0].count > 0;
        } catch (error) {
            console.error(`Error verifying data for table ${tableName} : `, error);
            throw error;
        }
    }

    writeMatchesInDb = async (matches, tableName, db) => {
        for (const match of matches) {
            const exists = await this.checkData(match, tableName, db);
            if (exists) {
                console.log(`Match with id ${match.idMatch} already exists in ${tableName}.`);
            } else {
                const insertQuery = `INSERT INTO ${tableName} (id_match, date, game_name, league_name, teams_name) VALUES (?, ?, ?, ?, ?)`
                const values = [match.idMatch, match.date, match.gameName, match.leagueName, match.teamsName]
                try {
                    await db.execute(insertQuery, values)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    saveMatches = async (matches, tableName) => {
        const db = await connectionMysql();
        try {
            await this.writeMatchesInDb(matches, tableName, db);
        } catch (error) {
            console.error('Insertion error :', error);
        } finally {
            try {
                await db.end();
                console.log('Closed database connection');
            } catch (endError) {
                console.error('Error closing connection :', endError);
            }
        }
    }
}
