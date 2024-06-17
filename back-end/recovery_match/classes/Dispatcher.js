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
        // await this.savingMatches.saveMatches(lolMatches)
        console.log(lolMatches)


    }
    // createdMatchesCs = async () => {
    //     const csData = await this.csData.getDatas()
    //     const matchesCs = this.matches.createdMatches(csData)
    //     await this.savingMatches.saveMatches(matchesCs)
    //     console.log("Success")
    // }
    //
    // createdMatchesValorant = async () => {
    //     const valorantData = await this.valorantData.getDatas()
    //     const matchesValorant = this.matches.createdMatches(valorantData)
    //     await this.savingMatches.saveMatches(matchesValorant)
    //     console.log("Success")
    // }
}