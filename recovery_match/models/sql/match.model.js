import {DataTypes} from 'sequelize'
import {Game} from './game.model.js'
import {League} from './league.model.js'
import {Team} from './team.model.js'
import {connectionDb} from "../../config/db-config.js";

const db = await connectionDb();

export const Match = db.define(
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
    })
