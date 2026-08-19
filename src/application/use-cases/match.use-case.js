export class GetAllMatches {

	constructor(matchRepository){
		this.matchRepository = matchRepository
	}

	async execute(){
		return await this.matchRepository.findAll()
	}
	
}