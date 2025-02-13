import axios from 'axios'

export class Match {
	#urlConnection

	constructor (urlConnection) {
		this.#urlConnection = urlConnection
	}

	#checkedData = (value) => {
		return value === null || value === '' || value === undefined
	}

	#formatedDate = (date) => {
		const curentYears = new Date().getFullYear()
		const dateObject = new Date(date)
		if (dateObject.getFullYear() === curentYears) {
			return dateObject
		} else {
			return null
		}
	}

	#formatLeagueName = (name) => {
		return name.replace(/-/g, ' ').replace(/^./, (char) => char.toUpperCase()) // Met la première lettre en majuscule
	}

	#getData = async (urlConnection) => {
		try {
			const response = await axios(urlConnection)
			if (response.status === 200) {
				return response.data
			} else {
				console.log(`Error while retrieving data from api ${response}`)
				process.exit()
			}
		} catch (error) {
			console.error('Error:', error)
			process.exit()
		}
	}

	
	createdMatch = async () => {
		const responseData = await this.#getData(this.#urlConnection)
		const matches = responseData.map((data) => {
			const idMatch = data.id.toString()
			const numberOfGame = data.number_of_games.toString()
			const date = this.#formatedDate(data.begin_at)
			const gameName = this.#formatLeagueName(data.videogame.slug)
			const leagueName = data.league.name
			const getTeamData = (field) =>
				data.opponents.map((opponent) => opponent.opponent[field]) || []

			const [team1Name, team2Name] = getTeamData('name')
			const [team1Acronym, team2Acronym] = getTeamData('acronym')
			const [team1Logo, team2Logo] = getTeamData('image_url')

			const isEmptyData = [
				idMatch,
				date,
				numberOfGame,
				gameName,
				leagueName,
				team1Name,
				team2Name,
				team1Acronym,
				team2Acronym,
			].some((field) => this.#checkedData(field))

			if (isEmptyData) {
				return null
			}
			
			return {
				idMatch,
				date,
				numberOfGame,
				leagueName,
				gameName,
				team1: {
					name: team1Name,
					acronym: team1Acronym,
					logoUrl: team1Logo,
				},

				team2: {
					name: team2Name,
					acronym: team2Acronym,
					logoUrl: team2Logo,
				},
			}
		})

		return matches.filter((item) => item !== null)
	}

	processMatches = async (matches, recoveryMatchesInstance) => {
		for (const match of matches) {
			const isVerifyLolMatch = await recoveryMatchesInstance.verifyMatchIsPresent(match.idMatch)
			if (isVerifyLolMatch) {
				console.error(`Match found ${match.idMatch}`)
			} else {
				
				const team1 = await recoveryMatchesInstance.insertTeam(match.team1)
				const team2 = await recoveryMatchesInstance.insertTeam(match.team2)
				

				const updateMatch = { ...match, team1: team1, team2: team2 }
				await recoveryMatchesInstance.insertMatch(updateMatch)
			}
		}
	}
}
