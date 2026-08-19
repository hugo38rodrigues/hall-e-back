// main/container.ts
import { GetAllMatches } from '../application/use-cases/match.use-case.js'
import { makeGetMatchesController } from '../interfaces/http/controller/matches.controller.js'
import { DatabaseAdapter } from '../infrastructure/persistence/sequelize/config/database.js'

export const buildContainer = (db: DatabaseAdapter) => {
  const matchRepo = db.match()
  const getMatches = new GetAllMatches(matchRepo)

  return {
    getAllMatches: makeGetMatchesController(getMatches),
  }
}

export type Controllers = ReturnType<typeof buildContainer>