import { Sequelize } from 'sequelize';
import { Bar } from '../models/sql/bar.model.js';
import { Comment } from '../models/sql/comment.model.js';
import { Consumer } from '../models/sql/consumer.model.js';
import { Like } from '../models/sql/like.model.js';
import { Favoris } from '../models/sql/favoris.model.js';
import { Game } from '../models/sql/game.model.js';
import { League } from '../models/sql/league.model.js';
import { Team } from '../models/sql/team.model.js';
import { Match } from '../models/sql/match.model.js';


export class DB {
    constructor () {
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
        const bar = Bar(this.connexion);
        const comment = Comment(this.connexion);
        const consumer = Consumer(this.connexion);
        const like = Like(this.connexion);
        const favoris = Favoris(this.connexion);
        const match = Match(this.connexion);
        const game = Game(this.connexion);
        const league = League(this.connexion);
        const teamName = Team(this.connexion);

        if (await this.testConnexion()) {
            bar.hasMany(comment);
            consumer.hasMany(comment);
            consumer.hasMany(like, { foreignKey: 'consumerId' });
            like.belongsTo(consumer, { foreignKey: 'consumerId' });
            bar.hasMany(like, { foreignKey: 'barId' });
            like.belongsTo(bar, { foreignKey: 'barId' });

            comment.belongsTo(consumer, {
                foreignKey: {
                    allowNull: false
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
            comment.belongsTo(bar, {
                foreignKey: {
                    allowNull: false
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });

            match.belongsTo(game, {
                foreignKey: 'gameId',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            match.belongsTo(league, {
                foreignKey: 'leagueId',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            match.belongsTo(teamName, {
                as: 'Team1',
                foreignKey: 'team_1_id',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });
            match.belongsTo(teamName, {
                as: 'Team2',
                foreignKey: 'team_2_id',
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            });

            consumer.hasMany(favoris, { foreignKey: 'consumer_id' });
            favoris.belongsTo(consumer, { foreignKey: 'consumer_id' });

            favoris.belongsTo(game, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'game'
                }
            });
            game.hasMany(favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'game'
                }
            });

            favoris.belongsTo(league, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'league'
                }
            });
            league.hasMany(favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'league'
                }
            });

            favoris.belongsTo(teamName, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'team'
                }
            });
            teamName.hasMany(favoris, {
                foreignKey: 'favoriteable_id',
                constraints: false,
                scope: {
                    favoriteable_type: 'team'
                }
            });

        } else {
            console.log('Error');
        }

    }
}
