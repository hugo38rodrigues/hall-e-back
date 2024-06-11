import axios from "axios"

export class GetData {
    constructor(option) {
        this.option = option;
    }

    verifyData = () => {

    }

    getDatas = async () => {
        try {
            const response = await axios(this.option);
            const arrayData = response.data;
            

            return this.verifyData(arrayData)
        } catch (error) {
            console.error('Error:', error);
        }
    }
}