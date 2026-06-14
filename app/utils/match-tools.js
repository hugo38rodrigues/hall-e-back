export const computeAdditionalHours = (gameName, bo) => {
	const normalizedGame = gameName.toLowerCase()

	// Stockage des durées en minutes pour simplifier
	const gameDurations = {
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

	const durations = gameDurations[normalizedGame]
	if (durations && bo in durations) {
		return durations[bo] // Retourne la durée en minutes
	}

	// Durée par défaut si jeu ou BO non reconnu (2h = 120 minutes)
	return 120
}
