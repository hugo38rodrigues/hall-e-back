import { TABLES_NAME } from "../utils/saving-matches.util.js";
import { GetData } from "./GetData.js";
import { Match } from "./Match.js";
import { SavingMatches } from "./SavingMatches.js";

export class Dispatcher {
    constructor(configApi, BDD_TARGET) {
        this.lolData = new GetData(configApi)
        this.csData = new GetData(configApi)
        this.valorantData = new GetData(configApi)
        this.matches = new Match()
        this.savingMatches = new SavingMatches(BDD_TARGET)
    }


    createdMatchesLol = async () => {
        const lolData = await this.lolData.getDatas()
        const lolMatches = this.matches.createdMatches(lolData)
        try {
            await this.savingMatches.saveMatches(lolMatches, TABLES_NAME.lol)
        } catch (err) {
            console.log(`Error inserting Data Into Table ${TABLES_NAME.lol}`, err)
            process.exit()
        }
    }

    createdMatchesCs = async () => {
        const csData = await this.csData.getDatas()
        const csMatches = this.matches.createdMatches(csData)
        try {
            await this.savingMatches.saveMatches(csMatches, TABLES_NAME.cs)
        } catch (err) {
            console.log(`Error inserting Data Into Table ${TABLES_NAME.cs}`, err)
            process.exit()
        }

    }

    createdMatchesValorant = async () => {
        const valorantData = await this.valorantData.getDatas()
        const valorantMatches = this.matches.createdMatches(valorantData)
        try {
            await this.savingMatches.saveMatches(valorantMatches, TABLES_NAME.valorant)
        } catch (err) {
            console.log(`Error inserting Data Into Table ${TABLES_NAME.valorant}`, err)
            process.exit()
        }
    }
}