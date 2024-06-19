export const TOKEN_API = process.env.TOKEN_API_PANDASCORE

export const BDD_TARGET = process.env.BDD_TARGET

export const optionLol = {
    method: 'GET',
    url: 'https://api.pandascore.co/lol/matches/upcoming',
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN_API}`
    }
}

export const optionCs = {
    method: 'GET',
    url: 'https://api.pandascore.co/csgo/matches/upcoming',
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN_API}`
    }
}

export const optionValorant = {
    method: 'GET',
    url: 'https://api.pandascore.co/valorant/matches/upcoming',
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN_API}`
    }
}