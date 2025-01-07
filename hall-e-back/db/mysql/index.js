import { DataTypes } from 'sequelize'
import { barMatchScheduleModel } from './models/bar-match.js'
import { barModel } from './models/bar.model.js'
import { clientModel } from './models/client.model.js'
import { commentModel } from './models/comment.model.js'
import { gameModel } from './models/game.model.js'
import { leagueModel } from './models/league.model.js'
import { likeModel } from './models/likes.js'
import { matchModel } from './models/match.model.js'
import { pictureModel } from './models/picture.js'
import { teamModel } from './models/team.model.js'
import { sequelize } from './sequelize.js'

export const db = {}

// Initialisation des modèles
db.Bar = barModel(sequelize, DataTypes)
db.Comment = commentModel(sequelize, DataTypes)
db.Client = clientModel(sequelize, DataTypes)
db.Game = gameModel(sequelize, DataTypes)
db.League = leagueModel(sequelize, DataTypes)
db.Match = matchModel(sequelize, DataTypes)
db.Team = teamModel(sequelize, DataTypes)
db.barMatchSchedules = barMatchScheduleModel(sequelize, DataTypes)
db.Like = likeModel(sequelize, DataTypes)
db.Picture = pictureModel(sequelize, DataTypes)

// Ajout de l'instance Sequelize à l'objet db
db.sequelize = sequelize
