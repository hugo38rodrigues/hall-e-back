import { Sequelize } from 'sequelize'
// import { Bar } from '../models/sql/bar.model.js'
// import { Comment } from '../models/sql/comment.model.js'
// import { Consumer } from '../models/sql/consumer.model.js'
// import { Like } from '../models/sql/like.model.js'
// import { Favorite } from '../models/sql/favoris.model.js'
import { Game } from '../models/sql/game.model.js'
import { League } from '../models/sql/league.model.js'
import { Team } from '../models/sql/team.model.js'
import { Match } from '../models/sql/match.model.js'

export class Mysql {
  constructor () {
    this.connexion = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      port: process.env.DB_PORT
    })
  }

  testConnexion = async () => {
    try {
      await this.connexion.authenticate()
      return true
    } catch (error) {
      console.error('Unable to connect to the database:', error)
      process.exit(1)
    }
  }

  synchronizationDb = async () => {
    // const BarModel = Bar(this.connexion)
    // const CommentModel = Comment(this.connexion)
    // const ConsumerModel = Consumer(this.connexion)
    // const LikeModel = Like(this.connexion)
    // const FavoriteModel = Favorite(this.connexion)
    const GameModel = Game(this.connexion)
    const LeagueModel = League(this.connexion)
    const TeamModel = Team(this.connexion)
    const MatchModel = Match(this.connexion)


    if (await this.testConnexion()) {
    //   // Relations for Bar
    //   BarModel.hasMany(CommentModel)
    //   BarModel.hasMany(LikeModel, { foreignKey: 'barId' })

      //   // Relations for Consumer
      //   ConsumerModel.hasMany(CommentModel)
      //   ConsumerModel.hasMany(LikeModel, { foreignKey: 'consumerId' })
      //   ConsumerModel.hasMany(FavoriteModel, { foreignKey: 'consumer_id' })

      //   // Relations for Like
      //   LikeModel.belongsTo(ConsumerModel, { foreignKey: 'ConsumerModelId' })
      //   LikeModel.belongsTo(BarModel, { foreignKey: 'barId' })

      //   // Relations for Comment
      //   CommentModel.belongsTo(ConsumerModel, {
      //     foreignKey: {
      //       allowNull: false
      //     },
      //     onDelete: 'CASCADE',
      //     onUpdate: 'CASCADE'
      //   })
      //   CommentModel.belongsTo(BarModel, {
      //     foreignKey: {
      //       allowNull: false
      //     },
      //     onDelete: 'CASCADE',
      //     onUpdate: 'CASCADE'
      //   })

      // // Relations for Match
      LeagueModel.hasMany(MatchModel, { foreignKey: 'league_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
      MatchModel.belongsTo(LeagueModel, { foreignKey: 'league_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })

      GameModel.hasMany(MatchModel, { foreignKey: 'game_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
      MatchModel.belongsTo(GameModel, { foreignKey: 'game_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' })

      TeamModel.hasMany(MatchModel, {
        foreignKey: 'team1_id',
        as: 'team1', // Alias pour la relation team1
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
      MatchModel.belongsTo(TeamModel, {
        foreignKey: 'team1_id',
        as: 'team1', // Alias pour team1
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })

      TeamModel.hasMany(MatchModel, {
        foreignKey: 'team2_id',
        as: 'team2', // Alias pour la relation team2
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })

      MatchModel.belongsTo(TeamModel, {
        foreignKey: 'team2_id',
        as: 'team2', // Alias pour team2
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })

      //   // Relations for Favorite
      //   FavoriteModel.belongsTo(ConsumerModel, { foreignKey: 'consumer_id' })

      //   FavoriteModel.belongsTo(GameModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'GameModel'
      //     }
      //   })
      //   GameModel.hasMany(FavoriteModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'GameModel'
      //     }
      //   })

      //   FavoriteModel.belongsTo(LeagueModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'LeagueModel'
      //     }
      //   })
      //   LeagueModel.hasMany(FavoriteModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'LeagueModel'
      //     }
      //   })

      //   FavoriteModel.belongsTo(TeamModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'team'
      //     }
      //   })
      //   TeamModel.hasMany(FavoriteModel, {
      //     foreignKey: 'favoriteable_id',
      //     constraints: false,
      //     scope: {
      //       favoriteable_type: 'team'
      //     }
      //   })

      //   await BarModel.sync({ froce: true })
      //   await ConsumerModel.sync({ force: true })
     
      await GameModel.sync({ force: true })
      await TeamModel.sync({ force: true })
      //   await FavoriteModel.sync({ force: true })
      await LeagueModel.sync({ force: true })
      await MatchModel.sync({ force: true })
      //   await LikeModel.sync({ force: true })
      //   await CommentModel.sync({ force: true })
     
    }
  }
}