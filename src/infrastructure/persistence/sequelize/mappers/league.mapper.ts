// league.mapper.ts
import { League } from '../../../../domain/entities/league.entities'

export function toLeagueEntity(row: any): League {
  return new League(row.name)
}