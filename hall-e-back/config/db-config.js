import {Sequelize} from 'sequelize';
import {bar} from "../models/sql/bar.model.js";
import {comment} from "../models/sql/comment.model.js";
import {consumer} from "../models/sql/consumer.model.js";
import {like} from "../models/sql/like.model.js";
import {favoris} from "../models/sql/favoris.model.js";
import {match} from "../models/sql/match.model.js";
import {game} from "../models/sql/game.model.js";
import {league} from "../models/sql/league.model.js";
import {team} from "../models/sql/team.model.js";


export class DB {
    constructor() {
        this.connexion = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            port: process.env.DB_PORT
        });
    }

    testConnexion = async () => {
        try {
            await this.connexion.authenticate();
            return true
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            process.exit(1)
        }
    }


    synchronizationDb = async () => {
        const Bar = bar(this.connexion);
        const Comment = comment(this.connexion);
        const Consumer = consumer(this.connexion);
        const Like = like(this.connexion);
        const Favoris = favoris(this.connexion);
        const Match = match(this.connexion);
        const Game = game(this.connexion);
        const League = league(this.connexion);
        const TeamName = team(this.connexion);

        if (await this.testConnexion()) {
            Bar.hasMany(Comment);
            Consumer.hasMany(Comment);
            Consumer.hasMany(Like, { foreignKey: 'consumerId' });
            Like.belongsTo(Consumer, { foreignKey: 'consumerId' });
            Bar.hasMany(Like, { foreignKey: 'barId' });
            Like.belongsTo(Bar, { foreignKey: 'barId' });

            Comment.belongsTo(Consumer, {
                foreignKey: {
                    allowNull: false
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
            Comment.belongsTo(Bar, {
                foreignKey: {
                    allowNull: false
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });

            Match.belongsTo(Game, {
                foreignKey: 'gameId',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            Match.belongsTo(League, {
                foreignKey: 'leagueId',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            Match.belongsTo(TeamName, {
                as: 'Team1',
                foreignKey: 'team_1_id',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            Match.belongsTo(TeamName, {
                as: 'Team2',
                foreignKey: 'team_2_id',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });

            Consumer.hasMany(Favoris, { foreignKey: 'consumer_id' });
            Favoris.belongsTo(Consumer, { foreignKey: 'consumer_id' });

            Favoris.belongsTo(Game, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'game'
                }
            });
            Game.hasMany(Favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'game'
                }
            });

            Favoris.belongsTo(League, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'league'
                }
            });
            League.hasMany(Favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'league'
                }
            });

            Favoris.belongsTo(TeamName, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'team'
                }
            });
            TeamName.hasMany(Favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'team'
                }
            });

        } else {
            console.log("Error");
        }

    }
}
