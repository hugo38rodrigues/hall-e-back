export class UserInstance {
	constructor() {}

	getProfileUser = async (email) => {
		throw new Error('The function getProfileUser() must be implemented.')
	}

	getClient = async (clientId) => {
		throw new Error('The function getClient() must be implemented.')
	}

	getBar = async (barId) => {
		throw new Error('The function getBar() must be implemented.')
	}

	getGame = async (gameId) => {
		throw new Error('The function getGame() must be implemented.')
	}

	getTeam = async (teamId) => {
		throw new Error('The function getTeam() must be implemented.')
	}

	getLeague = async (leagueId) => {
		throw new Error('The function getLeague() must be implemented.')
	}

	getUserById = async (role, id) => {
		throw new Error('The function getUserById() must be implemented.')
	}

	addUser = async (profile) => {
		throw new Error('The function addUser() must be implemented.')
	}

	updateUser = async (id, ressources) => {
		throw new Error('The function updateUser() must be implemented.')
	}

	deleteUserById = async (id, role) => {
		throw new Error('The function deleteUserById() must be implemented.')
	}

	addFavoritesGame = async (bar, game) => {
		throw new Error('The function addFavoritesGame() must be implemented.')
	}
	removeFavoritesGame = async (bar, game) => {
		throw new Error('The function removeFavoritesGame() must be implemented.')
	}

	addFavoritesLeague = async (bar, league) => {
		throw new Error('The function addFavoritesLeague() must be implemented.')
	}

	removeFavoritesLeague = async (bar, league) => {
		throw new Error('The function removeFavoritesLeague() must be implemented.')
	}

	addFavoritesTeam = async (bar, team) => {
		throw new Error('The function addFavoritesTeam() must be implemented.')
	}

	removeFavoritesTeam = async (bar, team) => {
		throw new Error('The function removeFavoritesTeam() must be implemented.')
	}

	getMatches = async () => {
		throw new Error('The function getMatches() must be implemented.')
	}
}
