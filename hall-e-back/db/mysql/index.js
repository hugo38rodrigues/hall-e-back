import { barModel } from './models/bar.model.js'
import { commentModel } from './models/comment.model.js'
import { consumerModel } from './models/consumer.model.js'
import { DataTypes } from 'sequelize'
import { gameModel } from './models/game.model.js'
import { leagueModel } from './models/league.model.js'
import { matchModel } from './models/match.model.js'
import { teamModel } from './models/team.model.js'
import { barMatchModel } from './models/bar-match.js'
import { sequelize } from './sequelize.js'


export const db = {}

// Initialisation des modèles
db.Bar = barModel(sequelize, DataTypes)
db.Comment = commentModel(sequelize, DataTypes)
db.Consumer = consumerModel(sequelize, DataTypes)
db.Game = gameModel(sequelize, DataTypes)
db.League = leagueModel(sequelize, DataTypes)
db.Match = matchModel(sequelize, DataTypes)
db.Team = teamModel(sequelize, DataTypes)
db.BarMatch = barMatchModel(sequelize)

// Ajout de l'instance Sequelize à l'objet db
db.sequelize = sequelize

