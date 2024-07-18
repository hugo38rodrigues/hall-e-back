import dotenv from 'dotenv';
import mysql from "mysql2/promise";
import { Storage } from '../interface/storage.js';

dotenv.config();

export class MysqlDB extends Storage {
    #connectionBdd

    constructor() {
        super();
        this.#connectionBdd = null
    }

    #initConnexion = async () => {
        try {
            this.#connectionBdd = await mysql.createConnection({
                host: process.env.DB_HOST, user:
                    process.env.DB_USER, password:
                    process.env.DB_PASSWORD, database:
                    process.env.DB_NAME, port:
                    process.env.DB_PORT
            })
        } catch (error) {
            console.log('Error Connexion', error)
            process.exit()
        }
    }

    #checkedData = async (match) => {
        if (!this.#connectionBdd) {
            await this.#initConnexion()
        }

        const checkQuery = `SELECT COUNT(*) AS count FROM matches WHERE id_match = ?`;
        try {
            const [rows] = await this.#connectionBdd.execute(checkQuery, [match.idMatch]);
            return rows[0].count > 0;
        } catch (error) {
            console.error(`Error verifying data for table Match : `, error);
            throw error;
        }
    }

    #insertMatchInDb = async (matches) => {
        for (const match of matches) {
            const exists = await this.#checkedData(match);
            if (exists) {
                console.log(`Match with id ${match.idMatch} already exists in matches.`);
            } else {
                const insertQuery = `INSERT INTO matches (id_match, date, game_name, league_name, teams_name) VALUES (?, ?, ?, ?, ?)`
                const values = [match.idMatch, match.date, match.gameName, match.leagueName, match.teamsName]
                try {
                    await this.#connectionBdd.execute(insertQuery, values)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
    #closeConnection = async () => {
        if (this.#connectionBdd) {
            try {
                await this.#connectionBdd.end();
                console.log("############ END CONNEXION FOR DB  ############");
            } catch (endError) {
                console.error('Erreur lors de la fermeture de la connexion :', endError);
            } finally {
                this.#connectionBdd = null; // Réinitialisation de la connexion
            }
        }
    }


    savingMatches = async (matches) => {
        try {
            await this.#insertMatchInDb(matches);
        } catch (error) {
            console.error('Insertion error :', error);
        } finally {
            try {
                await this.#closeConnection()
                console.log('Closed database connection');
            } catch (endError) {
                console.error('Error closing connection :', endError);
            }
        }
    }
}
