import { DataTypes } from 'sequelize'
import { gameModel } from './models/game.model.js'
import { leagueModel } from './models/league.model.js'
import { matchModel } from './models/match.model.js'
import { teamModel } from './models/team.model.js'
import { sequelize } from './sequelize.js'


export const db = {}

// Initialisation des modèles
db.Game = gameModel(sequelize, DataTypes)
db.League = leagueModel(sequelize, DataTypes)
db.Match = matchModel(sequelize, DataTypes)
db.Team = teamModel(sequelize, DataTypes)

// Ajout de l'instance Sequelize à l'objet db
db.sequelize = sequelize

