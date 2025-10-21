import axios from 'axios'
import Logger from '../middleware/logger.js'

const logger = new Logger()

export const getCoordinatesFromAddress = async (address) => {
	try {
		const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
			params: {
				key: process.env.LOCATIONIQ_API_KEY,
				q: address,
				format: 'json',
				limit: 1,
			},
		})

		if (response.data && response.data.length > 0) {
			const { lat, lon } = response.data[0]
			return { latitude: parseFloat(lat), longitude: parseFloat(lon) }
		}

		return null
	} catch (error) {
		logger.error('Erreur LocationIQ :', error.message)
		return null
	}
}
