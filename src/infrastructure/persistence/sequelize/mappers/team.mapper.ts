// team.mapper.ts
import { Team } from '../../../../domain/entities/team.entities'

export function toTeamEntity(row: any): Team {
  return new Team(row.name, row.acronym, row.logo_url)
}