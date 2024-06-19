import { GetData } from "./GetData.js";
import { Match } from "./Match.js";
import { SavingMatches } from "./SavingMatches.js";
import {TABLES_NAME} from "../utils/saving-matches.util.js";

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
        try{
            await this.savingMatches.saveMatches(lolMatches,TABLES_NAME.lol)
            console.log("############ SUCCESSFUL DATA INSERTION FOR LOL MATCHES ############")
        } catch(err){
            console.log("Error", err)
        }
    }

    createdMatchesCs = async () => {
        const csData = await this.csData.getDatas()
        const csMatches = this.matches.createdMatches(csData)
        try{
            await this.savingMatches.saveMatches(csMatches,TABLES_NAME.cs)
            console.log("############ SUCCESSFUL DATA INSERTION FOR CS MATCHES ############")
        } catch(err){
            console.log("Error", err)
        }

    }

    createdMatchesValorant = async () => {
        const valorantData = await this.valorantData.getDatas()
        const valorantMatches = this.matches.createdMatches(valorantData)
        try{
            await this.savingMatches.saveMatches(valorantMatches,TABLES_NAME.valorant)
            console.log("############ SUCCESSFUL DATA INSERTION FOR VALORANT MATCHES ############")
        } catch(err){
            console.log("Error", err)
        }
    }
}