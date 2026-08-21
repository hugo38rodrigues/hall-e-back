import type { Match } from "../entities/match.entities";

export interface MatchRepository {
	findAll(): Promise<Match[] | null>
	findById(id: string): Promise<Match | null>

}