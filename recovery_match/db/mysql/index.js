import { DataTypes } from 'sequelize'
import { gameModel } from './models/game.js'
import { leagueModel } from './models/league.js'
import { matchModel } from './models/match.js'
import { teamModel } from './models/team.js'
import { sequelize } from './sequelize.js'

export const db = {}

// Initialisation des modèles
db.Game = gameModel(sequelize, DataTypes)
db.League = leagueModel(sequelize, DataTypes)
db.Team = teamModel(sequelize, DataTypes)
db.Match = matchModel(sequelize, DataTypes)

// Ajout de l'instance Sequelize à l'objet db
db.sequelize = sequelize

