import request from 'supertest'
import { expect, test } from 'vitest'
import app from '../../../../index'
import { barWithoutFavoriteAndLike } from '../../../fixtures/bar.fixture'

export const signUpSuccessFullBar = (signUpUrl, validConnexionBar) => {
	test('SignUp Success for bar without likes and favorites', async () => {
		const res = await request(app).post(signUpUrl).send(validConnexionBar)
		expect(res.body).toEqual(barWithoutFavoriteAndLike)
		expect(res.statusCode).toEqual(200)
	})
}
