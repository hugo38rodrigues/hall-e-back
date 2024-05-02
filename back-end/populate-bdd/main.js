import { getUpComingMatchesLol } from "./Lol/index.js";


const dynamoDBConfig = {
  region: 'ap-euw-2',
  accessKeyId: 'fakeMyAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKe'
};

const main = async () => {
  try {
    await getUpComingMatchesLol(dynamoDBConfig)
  }
  catch (error) {
    console.log(error)
  }
}

main()

