/* eslint-disable no-unused-vars */
export class CommunService {
    constructor () {
    }
    
    getUser = async (ressources) => {}

    getConsumer =  async (consumerId) => {}

    getBar =  async (barId) => {}

    getGame = async (gameId) => {}

    getTeam = async (teamId) => {}

    getLeague = async (leagueId) => {}
    
    getUserById = async (role, id) => {}

    addUser = async (ressources) => {}

    updateUser = async (id, ressources) => {}

    deleteUserById = async (id, role) => {}

    addFavoritesGame = async (bar, game) => {}
    removeFavoritesGame = async (bar, game) => {}

    addFavoritesLeague = async (bar, league) => {}
    removeFavoritesLeague = async (bar, league) => {}

    addFavoritesTeam = async (bar, team) => {}
    removeFavoritesTeam = async (bar, team) => {}

    getMatchesAndScheduledMatches = async () => {}
}


