// game.mapper.ts
import { Game } from "../../../../domain/entities/game.entities";


export function toGameEntity(row: any): Game {
  return new Game(row.name)
}