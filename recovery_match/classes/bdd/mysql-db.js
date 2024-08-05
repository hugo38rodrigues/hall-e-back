import dotenv from 'dotenv';
import {Storage} from '../interface/storage.js'
import {Sequelize, DataTypes} from "sequelize"
import {League} from "../../models/sql/league.model.js"
import {Team} from "../../models/sql/team.model.js"
import {Game} from "../../models/sql/game.model.js"
import {Match} from "../../models/sql/match.model.js"

dotenv.config();

export class MysqlDB extends Storage {
    #connectionBdd

    constructor() {
        super();
        this.#connectionBdd = null
    }

    createTables = async () => {
        if (!this.#connectionBdd === null) {
            await this.#initConnexion()
        }

        const Game = this.#connectionBdd.define('Game', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        });

        // Définition du modèle League
        const League = this.#connectionBdd.define('League', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        });

        // Définition du modèle Team
        const Team = this.#connectionBdd.define('Team', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        });

        // Définition du modèle Match
        const Match = this.#connectionBdd.define('Match', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            id_match: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            gameId: {
                type: DataTypes.INTEGER,
                references: {
                    model: Game,
                    key: 'id'
                }
            },
            leagueId: {
                type: DataTypes.INTEGER,
                references: {
                    model: League,
                    key: 'id'
                }
            },
            team_1_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: Team,
                    key: 'id'
                }
            },
            team_2_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: Team,
                    key: 'id'
                }
            }
        });

        // Relations
        Match.belongsTo(Game, {foreignKey: 'gameId', onDelete: 'NO ACTION', onUpdate: 'CASCADE'});
        Match.belongsTo(League, {foreignKey: 'leagueId', onDelete: 'NO ACTION', onUpdate: 'CASCADE'});
        Match.belongsTo(Team, {as: 'Team1', foreignKey: 'team_1_id', onDelete: 'NO ACTION', onUpdate: 'CASCADE'});
        Match.belongsTo(Team, {as: 'Team2', foreignKey: 'team_2_id', onDelete: 'NO ACTION', onUpdate: 'CASCADE'});

        // Synchronisation des modèles avec la base de données
        await this.#connectionBdd.sync();
    }

    #initConnexion = async () => {
        try {

            this.#connectionBdd = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                port: process.env.DB_PORT
            });
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
