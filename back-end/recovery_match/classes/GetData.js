import axios from "axios"

export class GetData {
    constructor(option) {
        this.option = option;
    }

    getDatas = async () => {
        try {
            const response = await axios(this.option);
            if (response.status === 200) {
                return response.data;
            }
            else {
                console.log(`Error while retrieving data from api ${response}`)
                process.exit()
            }

        } catch (error) {
            console.error('Error:', error);
            process.exit()
        }
    }
}