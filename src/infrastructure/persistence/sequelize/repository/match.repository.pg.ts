import type { Match } from '../../../../domain/entities/match.entities'
import type { MatchRepository } from '../../../../domain/port/match.repository'
import type { Models } from '../associations'
import { toMatchEntity } from '../mappers/match.mapper'


export class MatchRepositoryPg implements MatchRepository {


  constructor(private models: Models) {
    this.models = models
  }

  async findAll(): Promise<Match[]> {
    const rows = await this.models.Match.findAll({
      attributes: ['id', 'id_match', 'date', 'number_of_game', 'hype_score', 'stream_platform'],
      include: [
        { model: this.models.Team,   as: 'team1',  attributes: ['id', 'name', 'acronym', 'logo_url'] },
        { model: this.models.Team,   as: 'team2',  attributes: ['id', 'name', 'acronym', 'logo_url'] },
        { model: this.models.Game,   as: 'game',   attributes: ['id', 'name'] },
        { model: this.models.League, as: 'league', attributes: ['id', 'name'] },
        {
          model: this.models.Bar,
          as: 'programmedBars',
          attributes: ['id', 'address', 'name', 'latitude', 'longitude'],
          required: false,
        },
      ],
    })
    return rows.map(toMatchEntity)
  }

  async findById(id: string): Promise<Match | null> {
    const row = await this.models.Match.findByPk(id, {
      include: [{ model: this.models.Game, as: 'game' }],
    })
    return row ? toMatchEntity(row) : null
  }
}