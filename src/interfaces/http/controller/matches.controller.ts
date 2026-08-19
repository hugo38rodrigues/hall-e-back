import { Request, Response } from "express";
import { Match } from "../../../domain/entities/match.entities"

interface GetMathcesInterface  {
	execute() : Promise<Match[]>
}

export function makeGetMatchesController (getMatches: GetMathcesInterface) {

	return async (_req: Request, res: Response) => {
		const matches = await getMatches.execute()
		return res.status(200).json(matches)
	}
}