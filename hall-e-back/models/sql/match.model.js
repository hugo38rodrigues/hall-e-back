import { DataTypes } from 'sequelize';
import { DB } from '../../config/db-config.js';
const db = new DB()

export const Match = db.connexion.define(
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
      type: DataTypes.DATE,
      allowNull: false
    },
    game_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    league_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teams_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
);