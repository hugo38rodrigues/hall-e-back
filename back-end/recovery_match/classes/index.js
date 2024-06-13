import {GetData} from "./GetData.js";
import {Match} from "./Match.js";
import {SavingMatches} from "./SavingMatches.js";

export class Index {
    constructor(configApi, BDD_TARGET, configBDD) {
        this.lolData = new GetData(configApi)
        this.csData = new GetData(configApi)
        this.valorantData = new GetData(configApi)
        this.matches = new Match()
        this.savingMatches = new SavingMatches(configBDD, BDD_TARGET)
    }

    createdMatchesLol = async () => {
        const lolData = await this.lolData.getDatas()
        const lolMatches = this.matches.createdMatches(lolData)
        // await this.savingMatches.saveMatches(lolMatches)

    }
    CreatedMatchesCs = async () => {
        const csData = await this.csData.getDatas()
        const matchesCs = this.matches.createdMatches(csData)
        // await this.savingMatches.saveMatches(matchesCs, "cs_match")
    }

    createdMatchesValorant = async () => {
        const valorantData = await this.valorantData.getDatas()
        const matchesValorant = this.matches.createdMatches(valorantData)
        // await this.savingMatches.saveMatches(matchesValorant, "valorant_match")
    }
}