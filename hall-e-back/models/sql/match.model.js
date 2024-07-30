import {DataTypes} from 'sequelize';
import {game} from "./game.model.js";
import {league} from "./league.model.js";
import {team} from "./team.model.js";

export const match = (sequelize) => {
    return sequelize.define(
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
                    model: game,
                    key: 'id'
                }
            },
            leagueId: {
                type: DataTypes.INTEGER,
                references: {
                    model: league,
                    key: 'id'
                }
            },
            team_1_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: team,
                    key: 'id'
                }
            },
            team_2_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: team,
                    key: 'id'
                }
            }
        })
}