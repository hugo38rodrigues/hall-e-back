import axios from 'axios'

export const get = async (url) => {
  try {
    console.log(url)
    const response = await axios.get(url)
    return response
  } catch (error) {
    console.error(error)
  }
}

