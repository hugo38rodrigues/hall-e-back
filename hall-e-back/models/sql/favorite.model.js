import {DataTypes} from 'sequelize'
import {connectionDb} from "../../config/db.config.js";

export const Favorite = connectionDb.define(
    'Favorites',
    {
        favoriteable_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        favoriteable_type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
