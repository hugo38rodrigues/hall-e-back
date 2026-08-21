import type { MatchRepository } from "../../domain/port/match.repository"

export class GetAllMatches {
	matchRepository: MatchRepository

	constructor(matchRepository: MatchRepository){
		this.matchRepository = matchRepository
	}

	async execute(){
		return await this.matchRepository.findAll()
	}
	
}