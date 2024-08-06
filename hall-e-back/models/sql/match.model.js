import {DataTypes} from 'sequelize'
import {Game} from './game.model.js'
import {League} from './league.model.js'
import {Team} from './team.model.js'
import {MysqlDB} from "../../config/sql/mysql.config.js";

const db = new MysqlDB()
const connection = db.connectionBdd

export const Match = connection.define(
    'Matches',
    {
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
            type: DataTypes.DATE
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
    })
