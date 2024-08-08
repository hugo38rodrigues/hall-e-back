import dotenv from 'dotenv';
import {Storage} from '../interface/storage.js'
import {League} from "../../models/sql/league.model.js"
import {Team} from "../../models/sql/team.model.js"
import {Game} from "../../models/sql/game.model.js"
import {Match} from "../../models/sql/match.model.js"

dotenv.config();

export class MysqlDB extends Storage {
    connectionBdd

    constructor() {
        super();
    }

    #checkedData = async (idMatch) => {
        try {
            const match = await Match.findOne({
                where: { id_match: idMatch }
            });

            if (match) {
                console.log(`Match with id_match ${idMatch} already exists.`);
                return true;
            }
            console.log(`Match with id_match ${idMatch} does not exist.`);
            return false;

        } catch (error) {
            console.error('Error checking if match exists:', error);
            throw error; // Lancer l'erreur pour la gérer plus haut
        }
    }

    #insertMatchInDb = async (matches) => {
        for (const value of matches) {
            const game = await Game.create({name: value.gameName});
            const league = await League.create({name: value.leagueName});
            const team1 = await Team.create({name: value.team1});
            const team2 = await Team.create({name: value.team2});
            const match = await Match.create({
                id_match: value.idMatch,
                date: value.date,
                gameId: game.gameId,
                leagueId: league.leagueId,
                team_1_id: team1.team_1_id,
                team_2_id: team2.team_1_id,
            });
            const exists = await this.#checkedData(match.id_match)
            if (exists) {
                console.log(`Match with id ${match.idMatch} already exists in matches.`);
                return
            }
            await Match.create(match)
        }
    }


    #closeConnection = async () => {
        if (this.connectionBdd) {
            try {
                await this.connectionBdd.end();
                console.log("############ END CONNEXION FOR DB  ############");
            } catch (endError) {
                console.error('Erreur lors de la fermeture de la connexion :', endError);
            } finally {
                this.connectionBdd = null; // Réinitialisation de la connexion
            }
        }
    }


    savingMatches = async (matches) => {
        try {
            await this.#insertMatchInDb(matches);
        } catch (error) {
            console.error('Insertion error :', error);
            // } finally {
            //     try {
            //         await this.#closeConnection()
            //         console.log('Closed database connection');
            //     } catch (endError) {
            //         console.error('Error closing connection :', endError);
            //     }
            // }
        }
    }
}
