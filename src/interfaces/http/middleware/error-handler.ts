import type { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'sequelize'
import { MatchNotFoundError } from '../../../domain/errors/match-not-found.errors'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	console.error(err) // log pour toi, côté serveur

	if (err instanceof MatchNotFoundError) {
		return res.status(404).json({ error: err.message })
	}

	if (err instanceof ValidationError) {
		return res.status(400).json({ error: err.message })
	}

	return res.status(500).json({ error: 'internal error' })
}
