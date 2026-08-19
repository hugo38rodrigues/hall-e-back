import { Bar } from "./Bar.entities";
import { Game } from "./game.entities";
import { League } from "./league.entities";
import { Team } from "./team.entities";

export class Match{
	private static GAME_DURATION: Record<string, Record<number, number>> = {
		'league of legends': {
			1: 33,
			3: 110, // 1h50 = 110 min
			5: 230, // 3h50 = 230 min
		},
		'cs go': {
			1: 50,
			3: 150, // 2h30 = 150 min
			5: 300, // 5h00 = 300 min
		},
		valorant: {
			1: 45,
			3: 135, // 2h15 = 135 min
			5: 270, // 4h30 = 270 min
		},
	}
	private static GAME_DURATION_DEFAULT: number = 120

	constructor(
		public readonly id: string, 
		public readonly id_match: string,
		public readonly date: Date,
    public readonly numberOfGame: number,
   	public readonly hypeScore: number,
    public readonly streamPlatform: string,
		public readonly game: Game,
		public readonly league: League,
		public readonly  team1: Team,
		public readonly  team2: Team,
		public readonly programmed: Bar
	){}

	private normalizedGame (): string{
		return this.game.name.toLowerCase()
	} 

	public matchDuration(): number{ 
		const durations = Match.GAME_DURATION[this.normalizedGame()]
		if (durations && this.numberOfGame in durations) {
			return durations[this.numberOfGame]
		}

		return Match.GAME_DURATION_DEFAULT
	}

	public endDate(): Date {
  	return new Date(this.date.getTime() + this.matchDuration() * 60_000);
	}
	
	public isLiveNow(now: Date = new Date()): boolean {

		return now >= this.date && now <= this.endDate();
	}

}