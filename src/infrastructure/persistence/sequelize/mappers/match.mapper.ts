// infrastructure/persistence/sequelize/mappers/match.mapper.ts
import { Match } from '../../../../domain/entities/match.entities'
import { toBarEntity } from './bar.mapper'
import { toGameEntity } from './game.mapper'
import { toLeagueEntity } from './league.mapper'
import { toTeamEntity } from './team.mapper'

export function toMatchEntity(row: any): Match {
  return new Match(
    row.id,
    row.id_match,
    row.date,
    row.number_of_game,        
    row.hype_score,
    row.stream_platform,
   	toGameEntity(row.game),
    toLeagueEntity(row.league),
    toTeamEntity(row.team1),
    toTeamEntity(row.team2),
    row.programmedBars?.map(toBarEntity) ?? [],   // N–N → tableau de bars
  )
}